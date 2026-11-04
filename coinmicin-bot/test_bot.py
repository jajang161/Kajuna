"""Tests for paper-trading safety rules; no internet, no wallet."""
from unittest.mock import patch
import bot

def fake_info(mint):
    return dict(address=mint, symbol=mint, pair='POOL_'+mint, price=1.0,
                ok=True, liquidity=300000, volume=600000, age=9)

def fake_report(mint):
    return dict(mint=mint, tokenProgram=bot.SPL,
                token=dict(mintAuthority=None, freezeAuthority=None),
                risks=[], lpLockedPct=99,
                topHolders=[{'pct': 1.5} for _ in range(10)])

def test():
    assert bot.CFG['scan_seconds'] == 600
    assert bot.CFG['monitor_seconds'] == 30
    assert bot.CFG['max_positions'] == 2
    assert bot.CFG['tp'] == 50 and bot.CFG['sl'] == -5
    assert bot.CFG['min_score'] == 85
    x = fake_info('coinA')
    assert bot.risk_score('coinA', fake_report('coinA'), x) >= 85
    risky = fake_report('coinA')
    risky['risks'] = [{'name':'danger'}]
    assert bot.risk_score('coinA', risky, x) == 0
    assert bot.risk_score('coinA', None, x) == 0
    s = bot.empty_state()
    with patch.object(bot, 'record', return_value=None):
        assert bot.buy(s, fake_info('coinA'), 90)
        assert bot.buy(s, fake_info('coinB'), 90)
        assert not bot.buy(s, fake_info('coinC'), 90)
        assert len(s['positions']) == 2
        first = s['positions'][0]
        bot.sell(s, first, first['price']*1.5, 'TP +50% JUAL SEMUA')
        assert len(s['positions']) == 1
        assert bot.buy(s, fake_info('coinC'), 90)
        assert len(s['positions']) == 2
    print('PASS: scanner 10min, monitor 30sec, 2 positions, full TP +50, safety gate, refill.')

if __name__ == '__main__':
    test()
