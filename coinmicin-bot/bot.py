#!/usr/bin/env python3
"""Coin Micin Paper Bot: simulasi, tidak punya akses wallet atau order nyata."""
import argparse
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE = Path(__file__).resolve().parent
STATE = BASE / 'paper_state.json'
LOG = BASE / 'paper_trades.jsonl'
CFG = dict(capital=30.0, scan_seconds=600, monitor_seconds=30,
           max_positions=2, fraction_per_trade=.10, tp=50.0, sl=-5.0,
           daily_stop=.05, min_score=85, min_liquidity=100000,
           min_volume=100000, min_age_h=2, max_age_h=96,
           max_fdv=15000000, min_locked=90, max_top10=35,
           fee_pct=.01, fixed_fee=.03, slippage=.01)
SPL = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'


def utc():
    return datetime.now(timezone.utc)


def val(x, default=0):
    try:
        return float(x)
    except (TypeError, ValueError):
        return default


def fetch(url):
    req = Request(url, headers={'Accept': 'application/json', 'User-Agent': 'CoinMicin-Paper/1.0'})
    with urlopen(req, timeout=18) as r:
        return json.load(r)


def telegram(message):
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()
    chat = os.environ.get('TELEGRAM_CHAT_ID', '').strip()
    if not token or not chat:
        return False
    data = urlencode({'chat_id': chat, 'text': message[:3900]}).encode()
    try:
        req = Request('https://api.telegram.org/bot' + token + '/sendMessage', data=data, method='POST')
        with urlopen(req, timeout=15) as r:
            return bool(json.load(r).get('ok'))
    except Exception as e:
        print('Telegram gagal:', type(e).__name__)  # jangan menampilkan token
        return False


def record(kind, message):
    msg = f'[{utc().isoformat(timespec="seconds")}] {kind}: {message}'
    print(msg)
    with LOG.open('a', encoding='utf-8') as f:
        f.write(json.dumps({'time': utc().isoformat(), 'type': kind, 'message': message}) + '\n')
    telegram('🧪 SIMULASI ' + kind + '\n' + message)


def empty_state():
    return dict(cash=CFG['capital'], starting=CFG['capital'], positions=[], closed=[], seen=[],
                last_prices={}, scans=0, day=utc().date().isoformat(), day_equity=CFG['capital'], stale=[])


def load():
    return json.loads(STATE.read_text()) if STATE.exists() else empty_state()


def save(s):
    tmp = STATE.with_suffix('.tmp')
    tmp.write_text(json.dumps(s, indent=2), encoding='utf-8')
    tmp.replace(STATE)


def equity(s):
    return s['cash'] + sum(p['units'] * s['last_prices'].get(p['address'], p['price']) for p in s['positions'])


def no_new_buys(s):
    return bool(s['stale']) or equity(s) <= s['day_equity'] * (1-CFG['daily_stop'])


def candidates():
    profiles = fetch('https://api.dexscreener.com/token-profiles/latest/v1')
    tokens = list(dict.fromkeys(p.get('tokenAddress') for p in profiles
        if isinstance(p, dict) and p.get('chainId') == 'solana' and p.get('tokenAddress')))[:25]
    if not tokens:
        return []
    pairs = fetch('https://api.dexscreener.com/tokens/v1/solana/' + ','.join(tokens))
    best = {}
    for p in pairs if isinstance(pairs, list) else []:
        mint = (p.get('baseToken') or {}).get('address')
        if mint in tokens and p.get('chainId') == 'solana':
            if mint not in best or val((p.get('liquidity') or {}).get('usd')) > val((best[mint].get('liquidity') or {}).get('usd')):
                best[mint] = p
    return list(best.values())


def numeric_filter(p):
    created = val(p.get('pairCreatedAt'))
    age = (time.time()*1000-created)/3600000 if created else -1
    buys = val(((p.get('txns') or {}).get('h1') or {}).get('buys'))
    sells = val(((p.get('txns') or {}).get('h1') or {}).get('sells'))
    x = dict(address=(p.get('baseToken') or {}).get('address', ''),
             symbol=(p.get('baseToken') or {}).get('symbol', '?'), pair=p.get('pairAddress', ''),
             price=val(p.get('priceUsd')), liquidity=val((p.get('liquidity') or {}).get('usd')),
             volume=val((p.get('volume') or {}).get('h24')), fdv=val(p.get('fdv')), age=age)
    x['ok'] = (bool(x['address']) and x['price'] > 0 and
        x['liquidity'] >= CFG['min_liquidity'] and x['volume'] >= CFG['min_volume'] and
        CFG['min_age_h'] <= age <= CFG['max_age_h'] and 0 < x['fdv'] <= CFG['max_fdv'] and
        val((p.get('priceChange') or {}).get('h1')) <= 25 and buys >= 20 and
        (sells == 0 or buys/sells >= .7))
    return x


def rugcheck(mint):
    if not re.fullmatch(r'[1-9A-HJ-NP-Za-km-z]{32,44}', mint):
        return None
    try:
        r = fetch('https://api.rugcheck.xyz/v1/tokens/' + mint + '/report')
        return r if isinstance(r, dict) else None
    except Exception:
        return None  # gagal membaca = TOLAK


def risk_score(mint, r, x):
    """Skor 0-100 adalah kriteria heuristik, BUKAN peluang 85% aman."""
    if not isinstance(r, dict) or r.get('mint') != mint or not x.get('ok') or x['address'] != mint:
        return 0
    t = r.get('token') or {}
    if not isinstance(t, dict) or 'mintAuthority' not in t or 'freezeAuthority' not in t:
        return 0
    if t['mintAuthority'] or t['freezeAuthority']:
        return 0
    if (r.get('tokenProgram') or t.get('program')) != SPL:
        return 0
    if not isinstance(r.get('risks'), list) or r['risks']:
        return 0
    locked = r.get('lpLockedPct')
    if locked is None:
        markets = r.get('markets') or []
        vals = [val((m.get('lp') or {}).get('lpLockedPct'), -1) for m in markets if isinstance(m, dict)]
        locked = min(vals) if vals and len(vals) == len(markets) else -1
    locked = val(locked, -1)
    holders = r.get('topHolders')
    if locked < CFG['min_locked'] or not isinstance(holders, list) or len(holders) < 10:
        return 0
    try:
        top10 = sum(float(h['pct']) for h in holders[:10])
    except (KeyError, ValueError, TypeError):
        return 0
    if top10 > CFG['max_top10']:
        return 0
    return min(100, 75 + (5 if locked >= 98 else 0) + (5 if top10 <= 20 else 0)
               + (5 if x['liquidity'] >= 250000 else 0) + (5 if x['volume'] >= 500000 else 0)
               + (5 if x['age'] >= 8 else 0))


def buy(s, x, score):
    if (no_new_buys(s) or len(s['positions']) >= CFG['max_positions'] or
        x['address'] in s['seen'] or score < CFG['min_score'] or not x['ok']):
        return False
    budget = min(s['cash'], equity(s)*CFG['fraction_per_trade'])
    if budget < 0.15:
        return False
    acquired = (budget-CFG['fixed_fee'])/(1+CFG['fee_pct'])/(1+CFG['slippage'])/x['price']
    if acquired <= 0:
        return False
    s['cash'] -= budget
    s['positions'].append(dict(address=x['address'], symbol=x['symbol'], price=x['price'],
        pair=x['pair'], units=acquired, unit_cost=budget/acquired, since=time.time(), score=score))
    s['seen'].append(x['address'])
    s['seen'] = s['seen'][-2000:]
    record('BELI', f'{x["symbol"]}: ${budget:.2f}; skor risiko {score}/100 (bukan 85% aman)')
    return True


def sell(s, p, price, why):
    proceeds = max(0, p['units']*price*(1-CFG['slippage'])*(1-CFG['fee_pct'])-CFG['fixed_fee'])
    pnl = proceeds - p['units']*p['unit_cost']
    s['cash'] += proceeds
    s['closed'].append(dict(symbol=p['symbol'], pnl=pnl, reason=why, when=utc().isoformat()))
    s['positions'].remove(p)
    record('JUAL', f'{p["symbol"]}: {why}; estimasi PnL ${pnl:+.3f}; 100% posisi dijual')


def monitor(s):
    missing = []
    for p in list(s['positions']):
        try:
            pairs = fetch('https://api.dexscreener.com/token-pairs/v1/solana/' + p['address'])
            exact = [v for v in pairs if v.get('pairAddress') == p['pair'] and
                (v.get('baseToken') or {}).get('address') == p['address']]
            if not exact:
                raise ValueError('pool hilang')
            quote = exact[0]
            price = val(quote.get('priceUsd'))
            liquidity = val((quote.get('liquidity') or {}).get('usd'))
            if price <= 0 or liquidity < 50000:
                raise ValueError('harga/likuiditas tidak valid')
            s['last_prices'][p['address']] = price
            change = (price/p['price']-1)*100
            if change <= CFG['sl']:
                sell(s, p, price, f'SL teramati {change:+.1f}%')
            elif change >= CFG['tp']:
                sell(s, p, price, 'TP +50% harga teramati')
            elif time.time()-p['since'] >= 12*3600:
                sell(s, p, price, 'batas waktu 12 jam')
        except Exception:
            missing.append(p['symbol'])
    previously = set(s.get('stale', []))
    s['stale'] = sorted(missing)
    if set(missing)-previously:
        record('PERINGATAN', 'Harga tidak tersedia: ' + ', '.join(sorted(set(missing)-previously)) + '; tidak buka posisi baru')
    save(s)


def report(s):
    wins = sum(v['pnl'] > 0 for v in s['closed'])
    losses = sum(v['pnl'] < 0 for v in s['closed'])
    realized = sum(v['pnl'] for v in s['closed'])
    return (f'🧪 PAPER TRADING — BUKAN UANG NYATA\nScan: {s["scans"]}, posisi terbuka: {len(s["positions"])}/2\n'
            f'Cash: ${s["cash"]:.2f}, ekuitas indikatif: ${equity(s):.2f}, hasil jual: ${realized:+.2f}\n'
            f'Jual untung {wins}, rugi {losses}; quote hilang: {", ".join(s["stale"]) or "tidak"}\n'
            'TP +50% jual 100%, SL -5% pemicu saja. Biaya/likuiditas bisa menyebabkan rugi lebih besar.')


def scan(s):
    today = utc().date().isoformat()
    if today != s['day']:
        telegram('📊 LAPORAN HARI SEBELUMNYA\n' + report(s))
        s['day'], s['day_equity'] = today, equity(s)
    # Pantau posisi SEBELUM membuka posisi baru.
    monitor(s)
    raw = candidates()
    filtered = [x for x in map(numeric_filter, raw) if x['ok']]
    filtered.sort(key=lambda x: x['liquidity'], reverse=True)
    s['scans'] += 1
    approved = 0
    if not no_new_buys(s):
        for x in filtered[:8]:
            if len(s['positions']) >= CFG['max_positions']:
                break
            score = risk_score(x['address'], rugcheck(x['address']), x)
            if score >= CFG['min_score']:
                approved += 1
                buy(s, x, score)
    save(s)
    telegram(f'🔎 Scan {s["scans"]}: {len(raw)} token profil, {len(filtered)} lolos filter angka, '
             f'{approved} lolos keamanan.\n' + report(s))
    print(report(s))


def demo():
    s = empty_state()
    x = dict(address='TOKEN_FIKTIF', symbol='CONTOH', price=1, pair='POOL_FIKTIF', ok=True)
    assert buy(s, x, 90)
    assert len(s['positions']) == 1
    p = s['positions'][0]
    # Tahan pada +20%; seluruh posisi dijual pada +50%.
    assert 1.2/p['price']-1 < CFG['tp']/100
    sell(s, p, 1.5, 'TP +50% simulasi harga fiktif')
    assert not s['positions'] and len(s['closed']) == 1
    print('DEMO LULUS (DATA FIKTIF)\n' + report(s))


def main():
    parser = argparse.ArgumentParser(description='PAPER TRADING SAJA; tidak ada modul beli nyata')
    modes = parser.add_mutually_exclusive_group(required=True)
    for mode in ['demo', 'once', 'loop', 'report', 'telegram-test']:
        modes.add_argument('--'+mode, action='store_true')
    args = parser.parse_args()
    if args.demo:
        demo()
        return
    s = load()
    if args.report:
        print(report(s))
        return
    if args.telegram_test:
        print('Terkirim' if telegram('🧪 Tes bot Coin Micin — simulasi tanpa dana asli') else 'Belum terkoneksi')
        return
    next_scan = time.monotonic()
    next_monitor = next_scan
    while True:
        now = time.monotonic()
        if now >= next_scan:
            try:
                scan(s)
            except Exception as e:
                s['stale'] = ['API ERROR']
                save(s)
                record('ERROR', 'Scan gagal: ' + type(e).__name__ + '. Tidak membeli.')
            if args.once:
                return
            next_scan = time.monotonic()+CFG['scan_seconds']
            next_monitor = time.monotonic()+CFG['monitor_seconds']
        elif now >= next_monitor:
            monitor(s)
            next_monitor = time.monotonic()+CFG['monitor_seconds']
        time.sleep(1)


if __name__ == '__main__':
    main()