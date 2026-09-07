# 🌱 Panduan Bermain VECT CT LAB
### Volcano Emergency Computational Thinking — SMP Kelas VIII

> **Durasi:** 45–60 menit (1 sesi = 2 modul)  
> **Platform:** Browser HP/Laptop — tanpa install, bisa offline setelah dibuka sekali  
> **Tujuan:** Berlatih *Computational Thinking* lewat 2 misi detektif

---

## 0. Alur Umum (WAJIB Baca Dulu)

```
Briefing (cerita Pak Taro) → Isi Nama/Kelas/Absen → Hub (pilih modul)
    → Modul 1 (Adonan) ↔ Modul 2 (Pupuk) → Refleksi (3 soal) → Hasil → Kirim ke Guru
```

*   **Kamu bebas mulai dari Modul 1 atau 2**, tapi disarankan **Modul 1 dulu** (lebih pendek, 10 menit).
*   Progress tersimpan otomatis. Jika internet putus, buka lagi → klik **Lanjut Sesi Terakhir** di Hub.
*   Tombol **`← Hub`** selalu ada di pojok kanan atas untuk kembali.

---

## 1. 🚨 Briefing — Misi Dimulai

**Layar:** `Lab berantakan + Pak Taro bilang “DATA HILANG!”`

1. Baca dialog Pak Taro.
2. Klik **`MULAI INVESTIGASI →`**
3. Kamu akan masuk ke layar identitas.

> **Tips Guru:** Bacakan keras cerita hujan abu agar siswa merasa konteks darurat PJJ.

---

## 2. 📝 Onboarding — Isi Identitas

| Field | Aturan |
|-------|--------|
| Nama Lengkap | Minimal 3 huruf, hanya huruf/spasi |
| Kelas | Pilih `VIII-A` s/d `VIII-D` |
| No. Absen | Angka `1–40` |

1. Isi 3 field → klik **`Masuk Lab →`**
2. Jika ada yang kosong → muncul peringatan.
3. Data tersimpan lokal + ke Supabase jika ada internet.

---

## 3. 🏠 Hub — Pusat Kendali

*   Lihat sapaan `Halo, {nama}` + **Progress ring** `0% → 50% → 100%`
*   Dua kartu besar:

| Kartu | Isi | Waktu |
|-------|-----|-------|
| **🍪 Modul 1: Mesin Pembentuk Adonan** | Tracing pipeline, 2 level (Easy/Medium) | ±10 menit |
| **🌱 Modul 2: Pupuk Ajaib** | 3 eksperimen + drag & drop + verifikasi | ±25 menit |

*   Klik kartu untuk masuk. Badge `Mulai` → `80%`/`100%` setelah selesai.
*   Di bawah ada **`Selesai & Kirim Laporan ke Guru`** → klik HANYA setelah kedua modul + refleksi selesai (otomatis download CSV juga).
*   **`Reset Progress`** untuk mengulang dari nol.

---

## 4. 🍪 LEVEL 1 — Mesin Pembentuk Adonan (Algorithm Lab)

**Tujuan CT:** Memahami `IF bentuk==X THEN ubah ke Y ELSE tetap`

### 4.1 Pilih Level

*   **Easy (2 gates):** `Square → Triangle → Circle` — cocok untuk pemula
*   **Medium (3 gates):** Ada gate no-op (tidak mengubah) untuk melatih debugging

Klik `Easy` atau `Medium` di atas. Skor terpisah per level.

### 4.2 Dua Tampilan (Toggle di kanan atas)

#### A. Pipeline Trace (Default)
```
START: ▢ Square → [IF ▢ THEN △] → [IF △ THEN ○] → Keluar: ○ ?
```
1. Klik **`▶ Jalankan Pipeline`** atau **`Jalankan Auto`** (play otomatis 1.2 detik/gate)
2. Atau klik **`Step Next ➔`** untuk maju satu gate demi satu gate
3. Lihat **adonan bergerak** (morph ▢→△→○) + **History breadcrumb** di bawah
4. Jika hasil = Expected → `100%` (hijau), jika 1 gate benar → `50%` (kuning)
5. Klik **`Simpan & Kembali ke Hub`** — skor masuk ke Hub

#### B. 🏭 Pabrik Isometrik (Mode Bermain)
1. Pilih token adonan di bawah: **Persegi / Segitiga / Lingkaran**
2. Klik **Pintu 1, 2, atau 3** di atas pipa (lingkaran angka)
3. Adonan kawaii (wajah) akan meluncur `Pintu → Gate → FINISH (K)` selama 2.8 detik
4. Gate menampilkan `S ➔ T` dsb. — amati perubahan bentuk
5. Cocok untuk visualisasi jalur sebelum masuk ke mode trace

> **Panduan untuk Siswa:**
> *   *“Jika adonan Persegi masuk Gate 1 (Square→Triangle), apa yang keluar?”*
> *   *“Kenapa Medium bisa 50%? Karena gate kedua tidak memicu.”*
> *   Debugging = cek gate mana yang salah.

---

## 5. 🌱 LEVEL 2 — Pupuk Ajaib (Pattern Lab)

**Tujuan CT:** Pattern Recognition + Feature Deduction + Debugging  
**Kunci Jawaban (jangan bocorkan dulu!):** `A & F = Air Biasa`, `B=Daun`, `C=Kelopak Berlapis & Putih`, `D=Tangkai Bergelombang`, `E=Tengah Hitam`

Level ini punya **4 sub-tahap** — ikuti urutan:

### 5.1 🧪 Lab Interaktif (Wajib — Paling Baru)

Di paling atas ada kartu gelap `Lab Interaktif — Pilih 3 gelas`:

1. **Pilih gelas:** Klik atau **drag** gelas `A–F` (warna beda) ke slot
   *   Maksimal 3 gelas per campuran
   *   Klik `×` di chip untuk hapus, `Reset` untuk kosongkan
2. Klik **`🧪 Analisis Campuran`**
3. Lihat **fase animasi 3.2 detik:** `pouring (1.2s) → growing (2.4s) → blooming` — bunga `FlowerSVG` di kanan akan berubah:
   *   Jika ada `B` → daun tumbuh
   *   Jika ada `C` → kelopak jadi putih & berlapis (2 layer)
   *   Jika ada `D` → tangkai bergelombang
   *   Jika ada `E` → tengah jadi hitam
   *   `A`/`F` → tidak ada efek (air)
4. Di bawah muncul **Traits ditemukan** (mis. `Kelopak Putih (Pupuk C)`) — catat untuk checklist
5. Ulangi dengan kombinasi lain untuk membandingkan pola (mis. `A+B+C` vs `C+D+F`)

> **Cara Debrief:** *“Gelas C selalu muncul bersama kelopak putih di EXP1 & EXP3 — jadi C = Putih!”*

### 5.2 🧪 Eksperimen 1–3 (Checklist Fitur)

Ada 3 kartu:

| Eksperimen | Campuran | Hasil yang harus kamu centang |
|------------|----------|-------------------------------|
| EXP 1 | A + B + C | Daun + Kelopak Berlapis & Putih |
| EXP 2 | A + D + E | Tangkai Bergelombang + Tengah Hitam |
| EXP 3 | C + D + F | Kelopak Berlapis & Putih + Tangkai Bergelombang |

1. Perhatikan preview bunga kecil di tiap kartu (otomatis update dari hipotesis kamu)
2. Centang checklist: `Menumbuhkan Daun`, `Kelopak Berlapis & Putih`, `Tangkai Bergelombang`, `Tengah Hitam`, atau `Tidak ada perubahan`
3. Minimal centang 1 per eksperimen. Data ini masuk `discoveredTraits` untuk rubrik guru.

### 5.3 🧩 Drag & Drop — Sort the Evidence

1. Di kiri: **Gelas A–F** dengan dropdown `— pilih fitur —`
2. Pilih untuk tiap gelas:
   *   `Menumbuhkan Daun` / `Kelopak Berlapis & Putih` / `Tangkai Bergelombang` / `Tengah Hitam` / `Air Biasa`
3. Indikator: `✨` = benar, `🔍` = cek lagi (tidak langsung “SALAH!”)
4. Di kanan ada **Preview bunga** (3 bunga kecil A,B,C) — update live
5. Jika bingung, klik **`💡 Hint (0/3)`** → pilih level:

| Hint | Isi | Cost |
|------|-----|------|
| Lv1 Pertanyaan | “Coba lihat gelas yang muncul di 2 eksperimen” | -10% |
| Lv2 Arah | “Bandingkan EXP1 & EXP3 — C muncul dua kali” | -10% |
| Lv3 Visual | Sorot `C → Putih`, `A/F → Air` | -10% |

Maks 3 hint, total penalty maks -30%.

### 5.4 🔬 Uji Semua Hipotesis (Final Verification)

1. Setelah 6 gelas terisi, klik **`🔬 UJI SEMUA HIPOTESIS`**
2. Sistem jalankan 3 eksperimen otomatis, tampilkan:
   *   3 bunga besar + label `EXP 1 ✓ / ✗`
   *   Teks `MATCH ✓` atau `✗ predicted [...] expected [...]`
3. Jika semua `✓` → **`🏆 CASE SOLVED!`**
4. Jika ada `✗` → hit `debuggingAttempts +1`, cek gelas yang kontradiktif, minta hint Lv2, lalu uji lagi (curiosity loop)
5. Baru setelah `MATCH` semua, lanjut ke alasan

### 5.5 📝 Alasan / Reasoning

*   Textarea wajib **minimal 20 karakter**
*   Contoh bagus: *“Saya lihat C ada di EXP1 & EXP3 dengan kelopak putih, jadi C=Putih. A tidak pernah menambah fitur jadi Air.”*
*   Klik **`Simpan Jawaban Modul 2`** → skor `M2` (water bonus 40 + feature 60) + `waterCorrect YES/NO` tersimpan → otomatis balik ke Hub

---

## 6. 🧠 Refleksi CT (5 menit)

Setelah kedua modul, klik kartu mana saja → kamu akan diarahkan ke `/reflection` jika belum refleksi:

1. **Q1:** Memecah masalah → **Dekomposisi**
2. **Q2:** Mencari kesamaan EXP1 & 3 → **Pattern Recognition**
3. **Q3:** Memperbaiki dugaan salah → **Debugging**
4. **Esai:** *“Jelaskan bagaimana kamu menemukan 2 gelas air”* (min 10 karakter)

Klik **`Kirim & Lihat Hasil`** → `localStorage` + masuk ke Result.

---

## 7. 🏆 Hasil & CT Skill Breakdown

*   4 kartu: `M1 %`, `M2 %`, `Air YES/NO`, `Final` (rumus `M1*0.4 + M2*0.6 - hints*10`)
*   **Radar CT:** Pattern, Algorithm, Debugging, Abstraction, Decomposition
*   Tombol `Kembali ke Hub` atau `Lihat Dashboard`

---

## 8. 📊 Kirim Laporan ke Guru

Di Hub, klik **`Selesai & Kirim Laporan ke Guru`**:

*   Jika ada Supabase → insert ke `sessions` + toast `terkirim`
*   Selalu download **CSV V4-compatible** (`student_activity_log.csv` header) — bisa upload ke Drive/Excel
*   Guru buka `/dashboard` → lihat tabel `Nama | Kelas | Absen | M1 | M2 | Air | Status`, KPI, heatmap, export CSV/JSON/PDF

---

## 9. ❓ FAQ & Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Tidak bisa klik Jalankan | Pastikan 3 glass dipilih (Lab) atau 6 assignment terisi (Drag&Drop) |
| Hint tidak muncul | Klik `💡 Hint` dulu untuk buka pilihan Lv1-3 |
| Skor 50% terus | Cek gate no-op di Medium — tidak semua gate mengubah |
| Air salah terus | Ingat: **dua** gelas air (`A & F`). Cek yang tidak pernah menambah fitur |
| Internet putus | Tetap bisa main — data di IndexedDB, akan sync saat online lagi (dot kuning → hijau) |
| Mau ulang | Hub → `Reset Progress` atau ganti Level Easy↔Medium |

---

## 10. Checklist Guru (Sebelum Kelas)

- [ ] Buka `https://vect-ct-lab.vercel.app` di HP siswa, tes 1x sampai Result
- [ ] Siapkan `.env` Supabase (copy dari `PANDUAN_BERMAIN.md:1` → `app/.env.example:1`) jika mau realtime
- [ ] Jalankan migrasi SQL PRD V5 §9.2 di Supabase
- [ ] Bagikan link + minta siswa isi Nama/Kelas/Absen yang benar
- [ ] Setelah sesi, buka `/dashboard` → Export CSV untuk nilai

Selamat mengajar! 🎉
