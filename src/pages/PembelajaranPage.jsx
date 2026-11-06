import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, Plus, Search, ChevronRight, Clock,
  Video, Award, Tag
} from 'lucide-react';

const categoryColors = [
  'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800', 'bg-indigo-100 text-indigo-800',
];

const PembelajaranPage = () => {
  const { isAdminUser } = useAuth();
  const [materiList, setMateriList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [kategoriList, setKategoriList] = useState(['Semua']);

  const fetchMateri = async () => {
    try {
      setLoading(true);
      const data = await dataService.getAllMateri();
      setMateriList(data);
      setFiltered(data);

      const kategoris = ['Semua', ...new Set(data.map(m => m.kategori).filter(Boolean))];
      setKategoriList(kategoris);
    } catch (error) {
      console.error('Error fetching materi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchMateri(); 
  }, []);

  useEffect(() => {
    let result = materiList;
    if (selectedKategori !== 'Semua') {
      result = result.filter(m => m.kategori === selectedKategori);
    }
    if (search.trim()) {
      result = result.filter(m =>
        m.judul?.toLowerCase().includes(search.toLowerCase()) ||
        m.deskripsi?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, selectedKategori, materiList]);

  const getColorForKategori = (kat) => {
    const idx = kategoriList.indexOf(kat) % categoryColors.length;
    return categoryColors[Math.max(0, idx - 1)];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat materi pembelajaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold mb-2">Modul Pembelajaran</h1>
              <p className="text-blue-100">Pilih materi, tonton videonya, pelajari materinya, dan kerjakan kuisnya.</p>
            </div>
            {isAdminUser ? (
              <Link
                to="/pembelajaran/tambah"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow transition-all self-start sm:self-auto"
              >
                <Plus size={18} /> Tambah Materi Baru
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-xl text-sm transition-all"
              >
                Login Admin untuk Tambah/Edit Materi
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari materi berdasarkan judul atau topik..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white text-gray-800 rounded-xl pl-11 pr-4 py-3 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Kategori Filter Tabs */}
        {kategoriList.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {kategoriList.map(kat => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedKategori === kat
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        )}

        {/* Materi List / Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={56} />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {materiList.length === 0 ? 'Belum ada materi pembelajaran' : 'Materi tidak ditemukan'}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {materiList.length === 0
                ? 'Materi masih kosong. Silakan masuk sebagai Admin untuk menambahkan materi baru.'
                : 'Tidak ada materi yang sesuai dengan pencarian atau filter yang dipilih.'}
            </p>
            {isAdminUser && (
              <Link to="/pembelajaran/tambah" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Tambah Materi Pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
              <span>Menampilkan <strong>{filtered.length}</strong> materi</span>
              {selectedKategori !== 'Semua' && (
                <button
                  onClick={() => setSelectedKategori('Semua')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Reset Filter Kategori
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((materi, idx) => (
                <Link
                  key={materi.id}
                  to={`/pembelajaran/${materi.id}`}
                  className="card hover:shadow-xl transition-all hover:-translate-y-1.5 group flex flex-col border border-gray-100 overflow-hidden"
                >
                  {materi.thumbnailUrl && (
                    <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-gray-100 relative">
                      <img
                        src={materi.thumbnailUrl}
                        alt={materi.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {materi.videoUrl && (
                        <span className="absolute bottom-2 right-2 badge bg-red-600 text-white font-medium shadow flex items-center gap-1">
                          <Video size={12} /> Video YouTube
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {materi.kategori && (
                      <span className={`badge ${getColorForKategori(materi.kategori)} font-medium`}>
                        <Tag size={10} className="mr-1" />
                        {materi.kategori}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {materi.judul}
                  </h3>
                  
                  <p className="text-gray-500 text-sm flex-1 line-clamp-3 leading-relaxed mb-4">
                    {materi.deskripsi}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400">
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <Award size={14} /> {materi.quizCount || (materi.quiz ? materi.quiz.length : 0)} Soal Kuis
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(materi.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="mt-3 text-blue-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Buka & Baca Materi <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PembelajaranPage;
