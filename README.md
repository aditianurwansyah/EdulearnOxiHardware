# 🎓 EduLearn - Platform Edukasi Digital Interaktif

Website edukasi modern berbasis **React.js + Tailwind CSS** dengan fitur CRUD materi, integrasi video YouTube, kuis multi-tipe (Pilihan Ganda, Benar/Salah, Essay), autentikasi Google OAuth & Email via Firebase, serta siap di-deploy langsung ke **Netlify**.

---

## 🌟 Fitur Utama

1. **🏠 Beranda Interaktif:**
   - Hero banner edukasi modern.
   - Statistik dinamis (total materi, pelajar terdaftar, total soal kuis).
   - Fitur unggulan & showcase materi terpopuler.
   - Menggunakan logo resmi yang telah diintegrasikan (`/logo.jpg`).

2. **📚 Modul Pembelajaran (CRUD Lengkap):**
   - **Melihat & Membaca Materi:** Tampilan komprehensif, mendukung format teks dan HTML semantik.
   - **Tambah Materi Baru:** Form admin untuk membuat judul, deskripsi, kategori, thumbnail, dan uraian konten.
   - **Edit Materi:** Memperbarui konten, video, dan soal kuis kapan saja.
   - **Hapus Materi:** Dilengkapi konfirmasi modal keamanan.
   - **Filter & Pencarian:** Cari materi berdasarkan kata kunci dan filter kategori.

3. **🎥 Integrasi Video Pembelajaran:**
   - Menyematkan video YouTube langsung (embed player interaktif) di setiap materi.
   - Mendukung format URL YouTube standar (`watch?v=...`) maupun tautan singkat (`youtu.be/...`).

4. **📝 Sistem Kuis Multi-Tipe:**
   - **Pilihan Ganda (Multiple Choice):** Penilaian otomatis + penandaan jawaban benar.
   - **Benar / Salah (True/False):** Evaluasi instan.
   - **Uraian / Essay:** Input jawaban terbuka + kunci jawaban/panduan penilaian referensi.
   - **Kalkulasi Skor:** Nilai persentase kelulusan langsung dihitung dan ditampilkan setelah kuis dikumpulkan.

5. **🔐 Autentikasi & Otorisasi:**
   - **Google OAuth Login:** Masuk 1-klik dengan akun Google Anda.
   - **Email & Password Login:** Registrasi dan login aman.
   - **Mode Cepat Demo:** Tombol 1-klik untuk testing cepat sebagai *Admin* atau *Pelajar* tanpa perlu setup backend terlebih dahulu.
   - **Admin Management Panel:** Dashboard khusus mengelola seluruh materi dan memantau pengguna.

6. **🚀 Siap Deploy ke Netlify:**
   - Sudah dilengkapi `netlify.toml` dan `_redirects` untuk penanganan Single Page Application (SPA).

---

## 💻 Cara Menjalankan di Komputer Lokal

1. Buka PowerShell / Terminal di folder project:
   ```bash
   cd c:\Users\aditi\Documents\antigravity\proud-hertz\edulearn
   ```
2. Jalankan server development:
   ```bash
   npm run dev
   ```
3. Buka browser pada URL yang tertera (biasanya `http://localhost:5173`).

---

## ☁️ Cara Deploy ke Netlify

Website ini **100% kompatibel dan siap di-deploy ke Netlify**! Ada dua cara termudah:

### Cara 1: Deploy Otomatis via GitHub (Sangat Direkomendasikan)
1. Push project ini ke repository GitHub Anda:
   ```bash
   git init
   git add .
   git commit -m "Initial EduLearn website"
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
2. Buka [app.netlify.com](https://app.netlify.com/) dan login.
3. Klik **"Add new site"** ➔ **"Import an existing project"** ➔ Pilih **GitHub**.
4. Pilih repository Anda. Netlify otomatis membaca file `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. *(Opsional)* Jika menggunakan Firebase asli, tambahkan Environment Variables di Netlify:
   - Masuk ke **Site settings** ➔ **Environment variables**
   - Tambahkan variabel dari Firebase Console (`VITE_FIREBASE_API_KEY`, dsb).
6. Klik **"Deploy site"**. Dalam 1 menit website edukasi Anda langsung aktif online!

---

### Cara 2: Deploy Cepat via Drag & Drop (Netlify Drop)
1. Lakukan build di komputer Anda:
   ```bash
   npm run build
   ```
2. Folder `dist` siap digunakan di dalam `edulearn/dist`.
3. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
4. Tarik (*drag & drop*) folder `dist` tersebut ke layar browser Netlify Drop.
5. Website Anda langsung tayang dengan domain publik gratis dari Netlify!
