// src/services/dataService.js
// Layanan data hybrid: menggunakan Firebase Firestore jika terkoneksi,
// atau otomatis fallback ke localStorage dengan data contoh lengkap yang siap pakai.

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

const STORAGE_KEY_MATERI = 'edulearn_materi_data';
const STORAGE_KEY_USERS = 'edulearn_users_data';

// Cek apakah Firebase sudah dikonfigurasi dengan API key nyata
export const isFirebaseReady = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(apiKey && apiKey !== 'YOUR_API_KEY' && apiKey.length > 10);
};

// Data materi awal / contoh
const INITIAL_MATERI = [
  {
    id: 'materi-1',
    judul: 'Pengenalan Web Development Modern (HTML, CSS, JavaScript)',
    deskripsi: 'Pelajari pondasi utama pengembangan website dari struktur semantik HTML5, styling responsif dengan CSS, hingga interaktivitas menggunakan JavaScript modern ES6+.',
    kategori: 'Pemrograman Web',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    quizCount: 3,
    konten: `
      <h2>1. Pengantar Pemrograman Web</h2>
      <p>Pengembangan web (web development) merupakan proses pembangunan dan pemeliharaan situs web. Tiga pilar utama web front-end meliputi:</p>
      <ul>
        <li><strong>HTML (HyperText Markup Language):</strong> Memberikan struktur dan konten halaman.</li>
        <li><strong>CSS (Cascading Style Sheets):</strong> Mengatur tata letak, warna, tipografi, dan tampilan responsif.</li>
        <li><strong>JavaScript:</strong> Menambahkan logika interaktif, manipulasi DOM, dan komunikasi dengan server via API.</li>
      </ul>
      
      <h2>2. Struktur HTML5 Modern</h2>
      <p>Gunakan tag semantik seperti <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, dan <code>&lt;footer&gt;</code> untuk meningkatkan aksesibilitas dan SEO.</p>
      
      <h2>3. Styling dengan CSS & Utility-First</h2>
      <p>Modern CSS memanfaatkan teknik Flexbox untuk penataan satu dimensi dan CSS Grid untuk penataan dua dimensi yang kompleks. Kerangka kerja seperti Tailwind CSS mempercepat proses perancangan dengan menyediakan kelas-kelas utilitas yang terstandarisasi.</p>
      
      <h2>4. JavaScript Modern (ES6+)</h2>
      <p>Fitur-fitur seperti arrow functions, destructuring, template literals, async/await, dan modul ES6 menjadikan penulisan kode JavaScript jauh lebih bersih, aman, dan mudah dipelihara.</p>
    `,
    quiz: [
      {
        type: 'multiple_choice',
        pertanyaan: 'Tag HTML manakah yang digunakan untuk membuat hyperlink atau tautan ke halaman lain?',
        options: ['<link>', '<a>', '<href>', '<nav>'],
        correctAnswer: '<a>',
        penjelasan: 'Tag <a> (anchor) dengan atribut href digunakan untuk mendefinisikan tautan hyperlink dalam dokumen HTML.'
      },
      {
        type: 'true_false',
        pertanyaan: 'CSS Grid dirancang khusus untuk menangani tata letak dua dimensi (baris dan kolom secara bersamaan).',
        correctAnswer: 'Benar',
        penjelasan: 'Benar, CSS Grid adalah sistem layout 2D, sedangkan Flexbox utamanya difokuskan pada layout 1D (satu arah per baris atau kolom).'
      },
      {
        type: 'essay',
        pertanyaan: 'Jelaskan perbedaan utama antara penggunaan keyword "let", "const", dan "var" dalam JavaScript modern!',
        kunciJawaban: 'var memiliki function scope dan terkena hoisting. let memiliki block scope dan nilainya dapat diubah kembali (reassign). const juga memiliki block scope tetapi nilainya bersifat konstan (tidak dapat di-reassign setelah dideklarasikan).'
      }
    ]
  },
  {
    id: 'materi-2',
    judul: 'Dasar Kecerdasan Buatan & Machine Learning',
    deskripsi: 'Memahami konsep fundamental Artificial Intelligence, cara kerja algoritma Machine Learning, serta implementasi praktisnya dalam memecahkan masalah di dunia nyata.',
    kategori: 'Artificial Intelligence',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    quizCount: 3,
    konten: `
      <h2>1. Apa itu Artificial Intelligence (AI)?</h2>
      <p>Artificial Intelligence adalah cabang ilmu komputer yang bertujuan menciptakan sistem yang mampu melakukan tugas-tugas yang biasanya membutuhkan kecerdasan manusia, seperti pengenalan suara, pengambilan keputusan, dan pemahaman bahasa alami.</p>
      
      <h2>2. Kategori Utama Machine Learning</h2>
      <ul>
        <li><strong>Supervised Learning:</strong> Model dilatih menggunakan data berlabel (contoh: Klasifikasi email spam, Regresi harga rumah).</li>
        <li><strong>Unsupervised Learning:</strong> Model menemukan pola tersembunyi dari data tanpa label (contoh: Clustering segmentasi pelanggan).</li>
        <li><strong>Reinforcement Learning:</strong> Model belajar melalui sistem reward dan punishment dari lingkungan (contoh: AI bermain catur atau mobil otonom).</li>
      </ul>
      
      <h2>3. Alur Kerja Proyek Machine Learning</h2>
      <p>Dimulai dari pengumpulan data (data collection), pembersihan data (data preprocessing), pelatihan model (model training), evaluasi metrik (akurasi, precision, recall), hingga deployment ke sistem produksi.</p>
    `,
    quiz: [
      {
        type: 'multiple_choice',
        pertanyaan: 'Manakah di bawah ini yang merupakan contoh algoritma Supervised Learning?',
        options: ['K-Means Clustering', 'Linear Regression', 'PCA (Principal Component Analysis)', 'Apriori'],
        correctAnswer: 'Linear Regression',
        penjelasan: 'Linear Regression menggunakan data berlabel untuk memprediksi nilai kontinu, sehingga termasuk ke dalam Supervised Learning.'
      },
      {
        type: 'true_false',
        pertanyaan: 'Machine Learning adalah bagian atau subset dari disiplin ilmu Artificial Intelligence (AI).',
        correctAnswer: 'Benar',
        penjelasan: 'Benar, Machine Learning adalah salah satu cabang utama dari AI yang berfokus pada algoritma yang belajar dari data.'
      },
      {
        type: 'essay',
        pertanyaan: 'Apa yang dimaksud dengan kondisi "Overfitting" pada Machine Learning dan bagaimana cara mengatasinya?',
        kunciJawaban: 'Overfitting terjadi ketika model terlalu mempelajari detail dan noise pada data latih (training data) sehingga performanya buruk saat menghadapi data baru (testing data). Cara mengatasinya antara lain: menambah data latih, menggunakan regularisasi (L1/L2), teknik cross-validation, atau mengurangi kompleksitas model.'
      }
    ]
  },
  {
    id: 'materi-3',
    judul: 'Fundamental UI/UX Design untuk Produk Digital',
    deskripsi: 'Panduan lengkap merancang antarmuka (UI) yang memikat secara visual dan memberikan pengalaman pengguna (UX) yang mulus, intuitif, serta aksesibel.',
    kategori: 'Desain Grafis & UI/UX',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581291518655-9523c932deb3?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    quizCount: 3,
    konten: `
      <h2>1. Perbedaan UI dan UX</h2>
      <p><strong>UX (User Experience):</strong> Berfokus pada bagaimana rasanya menggunakan produk secara keseluruhan—kemudahan, kenyamanan, dan alur pemecahan masalah.</p>
      <p><strong>UI (User Interface):</strong> Berfokus pada aspek visual dan elemen interaktif yang dilihat pengguna—warna, tipografi, tombol, ikon, dan layout.</p>
      
      <h2>2. Prinsip Desain Visual Inti</h2>
      <ul>
        <li><strong>Hierarchy (Hirarki Visual):</strong> Membimbing mata pengguna melihat elemen paling penting terlebih dahulu.</li>
        <li><strong>Contrast (Kontras):</strong> Memastikan teks dan elemen penting mudah dibaca dengan latar belakang yang sesuai.</li>
        <li><strong>Consistency (Konsistensi):</strong> Menggunakan komponen dan pola navigasi yang seragam di seluruh aplikasi.</li>
        <li><strong>Whitespace:</strong> Memberikan ruang bernapas antar elemen agar tampilan tidak padat dan melelahkan.</li>
      </ul>
      
      <h2>3. Tahapan Design Thinking</h2>
      <p>Empathize (Pahami pengguna) ➔ Define (Tentukan masalah) ➔ Ideate (Kembangkan solusi) ➔ Prototype (Buat purwarupa) ➔ Test (Uji coba ke pengguna langsung).</p>
    `,
    quiz: [
      {
        type: 'multiple_choice',
        pertanyaan: 'Apa kepanjangan dari istilah UI dan UX dalam desain digital?',
        options: [
          'User Interface dan User Experience',
          'User Integration dan User Extension',
          'Universal Icon dan Unique Experience',
          'User Internet dan User XML'
        ],
        correctAnswer: 'User Interface dan User Experience',
        penjelasan: 'UI singkatan dari User Interface (Antarmuka Pengguna) dan UX singkatan dari User Experience (Pengalaman Pengguna).'
      },
      {
        type: 'true_false',
        pertanyaan: 'Whitespace (ruang kosong) dalam desain harus sebisa mungkin diisi elemen agar layar tidak terkesan mubazir.',
        correctAnswer: 'Salah',
        penjelasan: 'Salah. Whitespace sangat penting untuk memberikan jeda visual, meningkatkan keterbacaan, dan memfokuskan perhatian pengguna ke elemen penting.'
      },
      {
        type: 'essay',
        pertanyaan: 'Sebutkan 3 tahapan dalam proses Design Thinking dan jelaskan secara singkat tujuannya!',
        kunciJawaban: '1. Empathize: memahami kebutuhan dan kesulitan pengguna melalui riset/wawancara. 2. Define: merumuskan pernyataan masalah spesifik yang dihadapi pengguna. 3. Prototype: membuat representasi visual atau interaktif dari solusi untuk kemudian diuji pada tahap Test.'
      }
    ]
  }
];

// Helper LocalStorage
const getLocalMateri = () => {
  const data = localStorage.getItem(STORAGE_KEY_MATERI);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_MATERI, JSON.stringify(INITIAL_MATERI));
    return INITIAL_MATERI;
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY_MATERI, JSON.stringify(INITIAL_MATERI));
    return INITIAL_MATERI;
  }
};

const setLocalMateri = (list) => {
  localStorage.setItem(STORAGE_KEY_MATERI, JSON.stringify(list));
};

const getLocalUsers = () => {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  if (!data) {
    const defaultUsers = [
      { id: 'usr-1', email: 'admin@edulearn.com', displayName: 'Admin EduLearn', role: 'admin', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
      { id: 'usr-2', email: 'budi@siswa.com', displayName: 'Budi Santoso', role: 'student', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'usr-3', email: 'siti@siswa.com', displayName: 'Siti Rahma', role: 'student', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// ======================= API FUNCTIONS =======================

export const dataService = {
  // Ambil semua materi
  async getAllMateri() {
    if (isFirebaseReady()) {
      try {
        const snap = await getDocs(query(collection(db, 'materi'), orderBy('createdAt', 'desc')));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn('Firebase query failed, using localStorage fallback:', err);
      }
    }
    return getLocalMateri();
  },

  // Ambil detail materi berdasarkan ID
  async getMateriById(id) {
    if (isFirebaseReady()) {
      try {
        const snap = await getDoc(doc(db, 'materi', id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() };
        }
      } catch (err) {
        console.warn('Firebase getDoc failed, checking local:', err);
      }
    }
    const local = getLocalMateri();
    return local.find(m => m.id === id) || null;
  },

  // Tambah materi baru
  async createMateri(payload) {
    const newMateriData = {
      ...payload,
      createdAt: new Date().toISOString(),
      quizCount: payload.quiz ? payload.quiz.length : 0,
    };

    if (isFirebaseReady()) {
      try {
        const ref = await addDoc(collection(db, 'materi'), newMateriData);
        return { id: ref.id, ...newMateriData };
      } catch (err) {
        console.warn('Firebase create failed, saving to localStorage:', err);
      }
    }

    const local = getLocalMateri();
    const id = 'materi-' + Date.now();
    const created = { id, ...newMateriData };
    setLocalMateri([created, ...local]);
    return created;
  },

  // Update materi
  async updateMateri(id, payload) {
    const updatedData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      quizCount: payload.quiz ? payload.quiz.length : 0,
    };

    if (isFirebaseReady()) {
      try {
        await updateDoc(doc(db, 'materi', id), updatedData);
        return { id, ...updatedData };
      } catch (err) {
        console.warn('Firebase update failed, updating localStorage:', err);
      }
    }

    const local = getLocalMateri();
    const updated = local.map(m => (m.id === id ? { ...m, ...updatedData } : m));
    setLocalMateri(updated);
    return { id, ...updatedData };
  },

  // Hapus materi
  async deleteMateri(id) {
    if (isFirebaseReady()) {
      try {
        await deleteDoc(doc(db, 'materi', id));
      } catch (err) {
        console.warn('Firebase delete failed, removing from local:', err);
      }
    }

    const local = getLocalMateri();
    const filtered = local.filter(m => m.id !== id);
    setLocalMateri(filtered);
    return true;
  },

  // Ambil daftar pengguna
  async getUsers() {
    if (isFirebaseReady()) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn('Firebase users fetch failed, using local:', err);
      }
    }
    return getLocalUsers();
  },

  // Simpan pengguna lokal saat login demo
  saveLocalUser(user) {
    const users = getLocalUsers();
    if (!users.some(u => u.email === user.email)) {
      users.push({
        id: user.uid || 'usr-' + Date.now(),
        email: user.email,
        displayName: user.displayName,
        role: user.role || 'student',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  }
};
