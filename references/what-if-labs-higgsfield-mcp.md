# Kajuna — What If Labs ↔ Bang Motion ↔ Higgsfield MCP

> **Status:** instruction-level bridge for an AI coding/creative agent. No proprietary Higgsfield connection, runtime preset, auto-generation or render job is installed by this file.

## Kapan aktif

- Aktif hanya bila user meminta **What If Labs**, atau secara eksplisit ingin menerapkan salah satu gaya baru untuk proyek.
- Untuk permintaan Bang Motion biasa, **tetap ikuti** `SKILL.md` dan `references/` bawaan tanpa memaksakan 10 gaya, durasi 30 detik, atau Higgsfield.
- Sumber aturan motion graphics tetap Bang Motion versi 1.19.0. Gunakan `docs/what-if-labs-style-guide.md` sebagai katalog visual pendukung; jangan mengganti skill induk.
- Jika user menyediakan **lima prompt referensi visual asli What If Labs**, hormati referensi itu sebagai otoritas gaya. Sepuluh gaya Kajuna adalah opsi pelengkap, **bukan pengganti**. Bila teks lima referensi tidak tersedia di chat atau repo, jangan mengarang isi atau mengklaim telah membacanya.

## Peta kerja agent

| Lapisan | Tanggung jawab | Alat / keluaran |
| --- | --- | --- |
| Agent/konseptor | Tentukan pertanyaan, riset, verifikasi klaim, skenario, gaya utama dan storyboard | Brief terstruktur + rundown |
| Bang Motion | Komposisi, desain gerak, GSAP/HTML, kamera, transisi, kontinuitas dan scrub/frame testing | `index.html` (browser) dan MP4 jika diekspor |
| Higgsfield MCP (opsional) | Membuat ilustrasi, footage dan audio yang diminta | Job generasi + aset asli, saat connector tersedia |
| Penyatuan & QA | Pakai aset hasil generasi sebagai layer footage bila sesuai; rapikan durasi, cek visual dan narasi | Video final **hanya jika render/komposisi benar-benar selesai** |

**Bukan satu operasi yang sama:** Higgsfield *generative video* menghasilkan klip dari prompt; Bang Motion membangun motion graphic pada timeline yang deterministik. `references/ae-bridge-higgsfield.md` adalah integrasi terpisah untuk **After Effects** dan hanya berlaku jika AE plus tool `ae_*` tersedia.

## Pilih gaya melalui SVG

Baca `docs/what-if-labs-style-guide.md` dan gunakan tepat **satu gaya dominan** per adegan atau rangkaian; kombinasikan hanya jika ada alasan visual yang konkret. Ini gambar referensi dalam `docs/gallery/`, **tidak otomatis berisi file animasi yang bisa dijalankan**.

| Gaya | File referensi | Mekanisme gerak yang harus dirancang |
| --- | --- | --- |
| Scientific Scale | `13-science-scale.svg` | Wide → close-up → reveal perbandingan skala |
| Geographic Infographic | `14-geographic-infographic.svg` | Region menyala → rute → penanda sebab-akibat |
| Anatomy Cutaway | `15-anatomy-cutaway.svg` | Lapisan terbuka berurutan, close-up organ akurat |
| Microverse Journey | `16-microverse-journey.svg` | Zoom skala bertahap dengan perbandingan referensi |
| Physics Simulation | `17-physics-simulation.svg` | Gaya, lintasan, atau gelombang sebagai model berlabel |
| Exploded Mechanism | `18-exploded-mechanism.svg` | Komponen terurai pada sumbu jelas lalu menyatu |
| Cause & Effect Puzzle | `19-cause-effect-puzzle.svg` | Potongan bergeser untuk memperlihatkan hubungan kausal |
| Evolution Timeline | `20-evolution-timeline.svg` | Garis waktu dan percabangan, bukan morphing linear keliru |
| Alternate History | `21-alternate-history.svg` | Baseline historis ↔ skenario hipotetis, label jelas |
| Exoplanet Ecosystem | `22-exoplanet-ecosystem.svg` | Lingkungan fiksi ilmiah konsisten, biologi spekulatif |

Alternatif studi visual: `docs/gallery/13-cosmic-scale.svg` (di luar daftar 10). Gambar tidak boleh diperlakukan sebagai fakta ilmiah atau desain karakter yang wajib disalin persis.

## ElevenLabs otomatis (bila dipilih user)

Gunakan `docs/what-if-labs-elevenlabs.md` dan `scripts/what-if-labs-auto.mjs`. Alur ini membuat VO Inggris melalui ElevenLabs ber-timestamp, subtitle Inggris, teks terjemahan dan subtitle Indonesia (terjemahan ditulis/ditinjau agen sebelum TTS), SFX opsional, dan MP4 setelah visual timeline tersedia. Jangan mewajibkan CapCut manual jika pengguna memilih otomatis. Jangan mengaku TTS/SFX telah dihasilkan bila belum ada API key dan panggilan nyata; simpan key hanya di environment privat. Validasi 12 adegan tanpa biaya sebelum generate.

## Urutan produksi What If Labs

1. **Tentukan subjek yang baru dan spesifik.** Variasikan space di luar Bumi, tubuh manusia, teknologi, fisika, alam, hewan/prasejarah, sejarah alternatif, eksobiologi, realitas alternatif. Catat fakta, asumsi, dan ketidakpastian. Jika klaim berisiko salah, periksa sumber tepercaya yang relevan.
2. **Buat style brief:** pilih gaya utama katalog, 1 alternatif bila perlu, subjek identitasnya, benda-benda yang diperlukan, warna, kamera, dan mekanisme transisi. Jangan membuat setiap episode sama.
3. **Bila mengikuti standar What If Labs saat ini:** 3 klip × 10 detik = 30 detik, **4 kejadian berbeda per klip** (12 adegan) dalam vertikal 9:16. Jadwal default setiap klip: 0–2,5; 2,5–5; 5–7,5; 7,5–10 detik. Variasikan timecode bila dibutuhkan, tetap tutup tepat 10 detik per klip. Aturan ini **tidak mengubah** durasi proyek Bang Motion non-What If Labs.
4. **Motion plan sebelum aset:** tulis subjek + kejadian + posisi + gerak kamera untuk tiap beat; penyebab terlihat sebelum akibat; kunci jumlah karakter/objek. Cocokkan narasi dengan visual, hindari empat shot yang sebenarnya hanya angle berbeda untuk satu aksi.
5. **Tentukan jalur implementasi:**
   - **Browser-first:** buat `index.html` dengan timeline Bang Motion/GSAP; gunakan gambar/footage Higgsfield sebagai lapisan yang mengikuti waktu. Jalur ini lebih cocok untuk kontrol durasi tepat, label data, ilustrasi bergerak, dan 12 scene.
   - **Video-generation-first:** bila user meminta model video Higgsfield, pecah brief per klip dengan timecodes dan periksa dukungan durasi, rasio, media reference, serta anggaran **sebelum submit**. Generasi tidak menjamin empat cut dalam 10 detik, kontinuitas, atau durasi akhir yang persis; hasil harus ditinjau dan bila perlu disunting.
6. **Suara:** narasi Inggris natural dan padat **terpisah** untuk CapCut, dengan terjemahan Indonesia dan timestamp sesuai storyboard, kecuali user meminta VO terintegrasi. SFX/musik secukupnya; jangan memasukkan voice-over ke prompt video bila akan diisi terpisah.
7. **QA dan ekspor:** preview/scrub pada detik penting, cek keselarasan 12 kejadian, kualitas aset, hak cipta, akurasi, implikasi ilmiah, dan kebutuhan disclosure konten sintetis. MP4 hanya dikatakan jadi setelah benar-benar diekspor; hasil video AI hanya dikatakan selesai saat job berstatus selesai dan media tersedia.

## Langkah Higgsfield MCP (hanya saat terhubung)

- **Discover:** cari tool/model yang tersedia saat run-time. Beberapa implementasi mengizinkan `models_search`, `models_get`, `estimate_video_cost`, `generate_image`, `generate_video`, `generate_audio` serta tool peninjauan status; kemampuan dan nama persis bisa berbeda antar instalasi. Jangan menebak ID model, parameter, suara, batas durasi, atau URL media.
- **Brief generasi:** jelaskan gaya, komposisi, subjek, gerak, gerak kamera, rasio 9:16, durasi yang didukung, dan batas jumlah objek. Gunakan gambar referensi hanya melalui input media yang didukung oleh tool yang dipilih, dan hanya ketika user mengizinkan. Hindari informasi pribadi atau lisensi yang tidak jelas.
- **Biaya dan otorisasi:** periksa estimasi kredit/kuota dan konfirmasi anggaran atau penggunaan yang diminta user sebelum tindakan berbayar. **Membaca panduan/URL ini bukan izin untuk mengeluarkan kredit.** Jangan kirim job atau mengulang job gagal hanya demi pemeriksaan teknis.
- **Eksekusi:** jalankan model Higgsfield sesuai skema tool nyata, simpan job ID, tunggu/cek status hanya bila diperbolehkan. Jangan melaporkan "berhasil dibuat" ketika masih pending atau tool tidak terhubung. Hindari resubmit bila respons timeout karena hasil awal belum diketahui.
- **Integrasi:** pakai media selesai sebagai background, subjek, layer atau shot dalam Bang Motion jika format/aksesnya sesuai; periksa resolusi, transisi, relasi fisik, lisensi dan timing. Jika model tidak mendukung durasi yang tepat, jelaskan kompromi dan gunakan timeline browser atau editing alih-alih berpura-pura mendukung.

### Kerangka brief per klip

```text
WHAT IF LABS — CLIP [1/2/3] — exactly 10s, vertical 9:16
STYLE: [one of the ten gallery concepts; relevant five-reference cue if supplied]
SCENE 1 00:00–00:02.5: [subject + visible action + camera]
SCENE 2 00:02.5–00:05.0: [different event + location + camera]
SCENE 3 00:05.0–00:07.5: [different event + observable result]
SCENE 4 00:07.5–00:10.0: [different event + connection to next clip]
CONTINUITY: [same objects, stable identity/count, physically plausible transitions]
AUDIO/SFX: [environment sound cues]; no dialogue or narration if CapCut VO is separate
CAPCUT VO: [English spoken text with scene timestamps]; [Indonesian translation]
```

## Batas hasil & penerapan

- File ini adalah **instruksi routing** untuk agent yang membaca fork Kajuna; **bukan** tool executor, penginstal MCP, sinkronisasi otomatis, atau render engine baru.
- Untuk mengaktifkan perubahan, user harus memakai **versi fork Kajuna yang diperbarui** dalam lingkungan agent dan menghubungkan Higgsfield MCP melalui konfigurasi aplikasinya. Agent yang masih memuat skill lama perlu memuat ulang.
- Bang Motion asli tetap menghasilkan `index.html`; rendering MP4 mengikuti tool `scripts/export-frames.mjs` dan dependensi yang tersedia.
- Jangan menambahkan token, API key, ataupun password ke GitHub.
