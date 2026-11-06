import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, Users, Award, ArrowRight, Star,
  CheckCircle, Zap, Globe, TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ materiCount: 0, userCount: 0, quizCount: 0 });
  const [featuredMateri, setFeaturedMateri] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiList, userList] = await Promise.all([
          dataService.getAllMateri(),
          dataService.getUsers(),
        ]);
        
        let quizTotal = 0;
        materiList.forEach(m => {
          quizTotal += (m.quizCount || (m.quiz ? m.quiz.length : 0));
        });

        setStats({
          materiCount: materiList.length,
          userCount: userList.length,
          quizCount: quizTotal,
        });

        // 3 materi terbaru
        const featured = [...materiList]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setFeaturedMateri(featured);
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Materi Lengkap & Terstruktur',
      desc: 'Materi pembelajaran berkualitas tinggi dengan penjelasan komprehensif yang mudah dipahami.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Award,
      title: 'Kuis Interaktif',
      desc: 'Uji pemahaman Anda melalui kuis pilihan ganda, benar/salah, dan evaluasi essay instan.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Globe,
      title: 'Integrasi Video Pembelajaran',
      desc: 'Setiap materi dapat disematkan video interaktif (seperti YouTube) agar belajar lebih visual.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Akses Fleksibel & Cepat',
      desc: 'Dapat diakses kapan saja dan siap di-deploy secara instan ke platform cloud modern seperti Netlify.',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const categoryColors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-pink-100 text-pink-800',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 mb-6 text-sm">
            <Zap size={14} />
            Platform Edukasi Digital Interaktif
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Belajar Lebih Cerdas,<br />
            <span className="text-cyan-200">Tingkatkan Keahlian Masa Depan</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            EduLearn menyediakan materi pembelajaran terstruktur, integrasi video YouTube, 
            dan kuis interaktif (pilihan ganda, benar/salah, essay) untuk mengukur progres belajarmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pembelajaran"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3.5 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Mulai Belajar Sekarang <ArrowRight size={18} />
            </Link>
            {!currentUser ? (
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3.5 px-8 rounded-xl transition-all"
              >
                Masuk / Buat Akun
              </Link>
            ) : (
              <Link
                to="/admin"
                className="bg-blue-800/60 hover:bg-blue-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all border border-blue-400/40"
              >
                Buka Panel Kelola
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-8 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Materi Edukasi', value: stats.materiCount, icon: BookOpen },
            { label: 'Pelajar Terdaftar', value: stats.userCount, icon: Users },
            { label: 'Bank Soal Kuis', value: stats.quizCount, icon: Award },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="text-blue-500 mb-1" size={26} />
              <span className="text-2xl md:text-3xl font-extrabold text-gray-800">{value}</span>
              <span className="text-gray-500 text-xs md:text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Fitur Utama EduLearn</h2>
            <p className="text-gray-500">Platform pembelajaran terpadu untuk pendidik dan peserta didik</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materi Pilihan / Terbaru */}
      {featuredMateri.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Materi Pembelajaran Unggulan</h2>
                <p className="text-gray-500 mt-1">Pilih topik yang menarik bagi Anda dan mulai pelajari sekarang</p>
              </div>
              <Link to="/pembelajaran" className="btn-primary flex items-center gap-2 text-sm">
                Lihat Semua <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredMateri.map((materi, idx) => (
                <Link
                  key={materi.id}
                  to={`/pembelajaran/${materi.id}`}
                  className="card hover:shadow-xl transition-all hover:-translate-y-1 group flex flex-col"
                >
                  {materi.thumbnailUrl && (
                    <div className="h-44 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <img
                        src={materi.thumbnailUrl}
                        alt={materi.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className={`badge ${categoryColors[idx % categoryColors.length]} self-start mb-2`}>
                    {materi.kategori || 'Umum'}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {materi.judul}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 flex-1">{materi.deskripsi}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-gray-400">
                    <span className="flex items-center gap-1 font-medium text-blue-600">
                      <BookOpen size={12} /> {materi.quizCount || (materi.quiz ? m.quiz.length : 0)} soal kuis
                    </span>
                    <span>{new Date(materi.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Mulai Perjalanan Belajarmu Hari Ini</h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            Pelajari materi berkualitas, tonton video pembelajaran lengkap, dan uji pemahamanmu dengan kuis interaktif.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['✨ Siap Deploy ke Netlify', '📚 CRUD Materi Lengkap', '🎥 Integrasi Video YouTube', '📝 Kuis Multi-Tipe'].map(item => (
              <span key={item} className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium">{item}</span>
            ))}
          </div>
          <Link
            to="/pembelajaran"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3.5 px-10 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg"
          >
            Jelajahi Semua Materi <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
