import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield, Users, BookOpen, Award, Plus, Edit, Trash2,
  Eye, AlertCircle, BarChart3, TrendingUp, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { isAdminUser, isFirebaseConnected } = useAuth();
  const [stats, setStats] = useState({ materiCount: 0, userCount: 0, totalQuiz: 0 });
  const [materiList, setMateriList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [materi, users] = await Promise.all([
        dataService.getAllMateri(),
        dataService.getUsers(),
      ]);

      const totalQuiz = materi.reduce((acc, m) => acc + (m.quizCount || (m.quiz ? m.quiz.length : 0)), 0);

      setMateriList(materi);
      setUserList(users);
      setStats({ materiCount: materi.length, userCount: users.length, totalQuiz });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUser) {
      fetchData();
    }
  }, [isAdminUser]);

  const handleDeleteMateri = async (id) => {
    try {
      await dataService.deleteMateri(id);
      setMateriList(prev => prev.filter(m => m.id !== id));
      setStats(prev => ({ ...prev, materiCount: prev.materiCount - 1 }));
      toast.success('Materi berhasil dihapus!');
      setDeleteTarget(null);
    } catch {
      toast.error('Gagal menghapus materi');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card flex items-center gap-4 border border-gray-100">
      <div className={`p-3.5 rounded-2xl ${color}`}>
        <Icon size={26} />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-800">{value}</p>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
      </div>
    </div>
  );

  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md w-full p-8">
          <Shield className="mx-auto text-amber-500 mb-3" size={56} />
          <h2 className="text-xl font-bold text-gray-800">Akses Khusus Admin</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            Halaman ini hanya dapat diakses oleh akun dengan role administrator.
          </p>
          <Link to="/login" className="btn-primary w-full inline-block">
            Masuk sebagai Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Shield size={32} className="text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Management Panel</h1>
              <p className="text-blue-200 text-sm">Kelola materi pembelajaran, kuis, dan data pelajar</p>
            </div>
          </div>
          <Link
            to="/pembelajaran/tambah"
            className="btn-primary flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} /> Tambah Materi Baru
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { key: 'dashboard', label: 'Ringkasan Dashboard', icon: BarChart3 },
            { key: 'materi', label: 'Kelola Materi & Kuis', icon: BookOpen },
            { key: 'users', label: 'Daftar Pengguna', icon: Users },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Tab 1: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard icon={BookOpen} label="Total Modul Materi" value={stats.materiCount} color="bg-blue-100 text-blue-600" />
                  <StatCard icon={Award} label="Total Soal Kuis" value={stats.totalQuiz} color="bg-emerald-100 text-emerald-600" />
                  <StatCard icon={Users} label="Total Pengguna Aktif" value={stats.userCount} color="bg-purple-100 text-purple-600" />
                </div>

                {/* Status Integrasi Backend */}
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-lg mt-0.5">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900">Status Penyimpanan & Integrasi</h3>
                      <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                        {isFirebaseConnected 
                          ? '✅ Firebase Cloud terhubung secara penuh. Data disinkronkan ke Google Cloud Firestore & Firebase Auth.'
                          : '⚡ Mode Hybrid Aktif: Data berjalan secara mulus di penyimpanan lokal browser (localStorage). Semua aksi Tambah, Edit, Hapus, dan Kuis berfungsi 100%. Untuk menghubungkan Firebase permanen saat deploy, cukup isi file .env.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabel Materi Terbaru */}
                <div className="card">
                  <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" /> Materi Pembelajaran Terkini
                  </h2>
                  <div className="divide-y divide-gray-100">
                    {materiList.slice(0, 5).map(m => (
                      <div key={m.id} className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{m.judul}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Kategori: <span className="font-medium text-gray-600">{m.kategori || 'Umum'}</span> · {m.quizCount || (m.quiz ? m.quiz.length : 0)} soal kuis
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/pembelajaran/${m.id}`} className="text-xs font-semibold text-blue-600 hover:underline px-2.5 py-1 bg-blue-50 rounded-md">
                            Lihat
                          </Link>
                          <Link to={`/pembelajaran/${m.id}/edit`} className="text-xs font-semibold text-emerald-600 hover:underline px-2.5 py-1 bg-emerald-50 rounded-md">
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                    {materiList.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-6">Belum ada materi pembelajaran</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Kelola Materi */}
            {activeTab === 'materi' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg">Daftar Modul Pembelajaran ({materiList.length})</h2>
                    <p className="text-xs text-gray-500">Tambah, perbarui uraian konten, embed video YouTube, dan kelola kuis</p>
                  </div>
                  <Link to="/pembelajaran/tambah" className="btn-primary text-sm flex items-center gap-2 shadow">
                    <Plus size={16} /> Tambah Materi
                  </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {materiList.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Belum ada materi pembelajaran</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                          <tr>
                            <th className="px-5 py-4 font-bold">Judul & Tanggal</th>
                            <th className="px-5 py-4 font-bold hidden md:table-cell">Kategori</th>
                            <th className="px-5 py-4 font-bold text-center">Video</th>
                            <th className="px-5 py-4 font-bold text-center">Soal Kuis</th>
                            <th className="px-5 py-4 font-bold text-right">Tindakan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {materiList.map(m => (
                            <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-bold text-gray-900">{m.judul}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <span className="badge bg-blue-100 text-blue-700 font-semibold">
                                  {m.kategori || 'Umum'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                {m.videoUrl ? (
                                  <span className="badge bg-red-100 text-red-700 font-semibold text-xs">✓ Ada Video</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="badge bg-emerald-100 text-emerald-700 font-bold">
                                  {m.quizCount || (m.quiz ? m.quiz.length : 0)} Soal
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link 
                                    to={`/pembelajaran/${m.id}`} 
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Baca Materi"
                                  >
                                    <Eye size={17} />
                                  </Link>
                                  <Link 
                                    to={`/pembelajaran/${m.id}/edit`} 
                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Edit Materi"
                                  >
                                    <Edit size={17} />
                                  </Link>
                                  <button
                                    onClick={() => setDeleteTarget(m)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus Materi"
                                  >
                                    <Trash2 size={17} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Pengguna */}
            {activeTab === 'users' && (
              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-4">Pengguna Terdaftar ({userList.length})</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-5 py-4 font-bold">Nama Pengguna</th>
                        <th className="px-5 py-4 font-bold hidden md:table-cell">Email</th>
                        <th className="px-5 py-4 font-bold text-center">Peran (Role)</th>
                        <th className="px-5 py-4 font-bold hidden md:table-cell">Tanggal Bergabung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {userList.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                  {(u.displayName || u.email || '?')[0].toUpperCase()}
                                </div>
                              )}
                              <span className="font-bold text-gray-800">{u.displayName || u.email?.split('@')[0]}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{u.email}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`badge font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {u.role || 'student'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-400 hidden md:table-cell text-xs">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 rounded-xl p-2.5">
                <AlertCircle size={26} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus materi <strong>"{deleteTarget.judul}"</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-secondary">
                Batal
              </button>
              <button onClick={() => handleDeleteMateri(deleteTarget.id)} className="flex-1 btn-danger">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
