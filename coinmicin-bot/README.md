# Coin Micin Bot — simulasi (tanpa deposit)

**HANYA PAPER TRADING.** Proyek ini tidak mempunyai akses wallet, transaksi nyata, AI pengambil keputusan, maupun integrasi trading GMGN. Jangan deposit hanya karena program dapat berjalan.

## Aturan simulasi

- Scanner token profil baru Solana dari DEX Screener setiap **10 menit** selama proses berjalan.
- Pemantauan harga posisi tiap **30 detik**; harga indikatif, bukan kepastian harga eksekusi.
- Maksimal **2 posisi** berbeda terbuka, masing-masing maksimal **10%** dari estimasi ekuitas; modal awal fiktif **$30** (atur di `bot.py`).
- **Take profit +50% harga teramati: jual 100%**; pemicu stop-loss **-5%**; tidak dijamin terjual pada harga pemicu.
- Hanya pertimbangkan token dengan **skor risiko internal >=85/100** serta gerbang wajib lolos. **Ini bukan 85% peluang aman.** Data tak lengkap atau tanda bahaya berarti tidak membeli.
- Anggaran rugi harian yang menghentikan **pembelian baru** saat ekuitas turun 5%; tidak mengunci rugi riil.
- Laporan posisi dan hasil simulasi ke Telegram jika kredensial tersimpan sebagai environment secrets.
- Jika posisi terjual, slot bisa terisi lagi pada scan berikutnya. Jika tidak ada coin lolos filter, jangan membeli.

## Dari Codespaces (Android)

Pakai terminal Codespaces, tanpa mengunggah ZIP:

```bash
mkdir -p coinmicin-bot && cd coinmicin-bot && curl -fsSLO https://raw.githubusercontent.com/jajang161/Kajuna/main/coinmicin-bot/bot.py && python3 bot.py --demo
```

Perintah lain:

```bash
python3 bot.py --once          # 1 kali scan pasar publik, seluruh transaksi tetap simulasi
python3 bot.py --loop          # scan 10 menit dan pantau harga 30 detik selama server aktif
python3 bot.py --report        # lihat ringkasan simulasi
python3 bot.py --telegram-test # tes laporan Telegram setelah secret dikonfigurasi
```

Telegram opsional: set `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` **secara privat** di lingkungan Codespaces. **Jangan** kirim token ke chat atau commit dalam repo publik. Jangan pernah memasukkan seed phrase/private key.

Codespaces **bukan** server 24 jam permanen: ia berhenti saat idle. Pengujian jangka panjang dan penggunaan uang riil memerlukan pekerjaan tambahan dan server yang sesuai.

## Batasan penting

Sumber daftar coin adalah *latest token profiles* DEX Screener, **bukan** semua token baru. Pemeriksaan RugCheck hanya filter risiko, bukan jaminan bebas scam. Beberapa token mungkin tidak pernah lolos filter. Biaya, slippage, kegagalan API, dan token yang tidak bisa dijual dapat menyebabkan kerugian riil jauh lebih besar daripada ambang stop-loss. **Tidak ada laba yang dijamin.**
