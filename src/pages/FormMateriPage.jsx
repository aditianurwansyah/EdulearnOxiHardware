import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, Plus, Trash2, Save, Video, Image,
  BookOpen, Award, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const QUIZ_TYPES = [
  { value: 'multiple_choice', label: 'Pilihan Ganda' },
  { value: 'true_false', label: 'Benar / Salah' },
  { value: 'essay', label: 'Essay / Uraian' },
];

const defaultQuizItem = () => ({
  type: 'multiple_choice',
  pertanyaan: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  kunciJawaban: '',
  penjelasan: '',
});

const FormMateriPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isAdminUser } = useAuth();

  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Pemrograman Web',
    konten: '',
    videoUrl: '',
    thumbnailUrl: '',
  });
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [quizExpanded, setQuizExpanded] = useState({});

  useEffect(() => {
    if (!isAdminUser) {
      toast.error('Hanya Admin yang dapat menambah/mengedit materi');
      navigate('/pembelajaran');
      return;
    }

    if (isEdit) {
      const fetchData = async () => {
        try {
          const data = await dataService.getMateriById(id);
          if (data) {
            setForm({
              judul: data.judul || '',
              deskripsi: data.deskripsi || '',
              kategori: data.kategori || '',
              konten: data.konten || '',
              videoUrl: data.videoUrl || '',
              thumbnailUrl: data.thumbnailUrl || '',
            });
            setQuiz(data.quiz || []);
            // Expand all quiz by default on edit
            const initialExpanded = {};
            (data.quiz || []).forEach((_, idx) => {
              initialExpanded[idx] = true;
            });
            setQuizExpanded(initialExpanded);
          } else {
            toast.error('Materi tidak ditemukan');
            navigate('/pembelajaran');
          }
        } catch {
          toast.error('Gagal memuat data materi');
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isEdit, isAdminUser, navigate]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addQuizItem = () => {
    const newQuiz = [...quiz, defaultQuizItem()];
    setQuiz(newQuiz);
    setQuizExpanded(prev => ({ ...prev, [newQuiz.length - 1]: true }));
  };

  const removeQuizItem = (idx) => {
    setQuiz(quiz.filter((_, i) => i !== idx));
  };

  const updateQuizItem = (idx, field, value) => {
    const updated = [...quiz];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'type') {
      updated[idx].correctAnswer = '';
      if (value === 'multiple_choice') updated[idx].options = ['', '', '', ''];
    }
    setQuiz(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...quiz];
    updated[qIdx].options[optIdx] = value;
    setQuiz(updated);
  };

  const addOption = (qIdx) => {
    const updated = [...quiz];
    updated[qIdx].options = [...(updated[qIdx].options || []), ''];
    setQuiz(updated);
  };

  const removeOption = (qIdx, optIdx) => {
    const updated = [...quiz];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== optIdx);
    setQuiz(updated);
  };

  const validate = () => {
    if (!form.judul.trim()) return 'Judul materi harus diisi';
    if (!form.deskripsi.trim()) return 'Deskripsi singkat harus diisi';
    if (!form.konten.trim()) return 'Konten uraian materi harus diisi';

    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      if (!q.pertanyaan.trim()) return `Pertanyaan kuis nomor ${i + 1} belum diisi`;
      if (q.type === 'multiple_choice') {
        const filled = q.options?.filter(o => o.trim());
        if (!filled || filled.length < 2) return `Soal nomor ${i + 1}: minimal memiliki 2 opsi pilihan jawaban`;
        if (!q.correctAnswer) return `Soal nomor ${i + 1}: mohon pilih salah satu jawaban benar`;
      }
      if (q.type === 'true_false' && !q.correctAnswer) {
        return `Soal nomor ${i + 1}: mohon tentukan apakah Benar atau Salah`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) return toast.error(errorMsg);

    setLoading(true);
    try {
      const payload = {
        ...form,
        quiz: quiz.map(q => ({
          ...q,
          options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : undefined,
        })),
        quizCount: quiz.length,
      };

      if (isEdit) {
        await dataService.updateMateri(id, payload);
        toast.success('Materi berhasil diperbarui!');
        navigate(`/pembelajaran/${id}`);
      } else {
        const created = await dataService.createMateri(payload);
        toast.success('Materi baru berhasil ditambahkan!');
        navigate(`/pembelajaran/${created.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan materi');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header bar */}
      <div className="bg-white border-b sticky top-16 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
          <h1 className="font-bold text-gray-800">
            {isEdit ? 'Edit Materi Pembelajaran' : 'Tambah Materi Baru'}
          </h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 shadow"
          >
            <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Info Utama */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
            <BookOpen className="text-blue-600" size={20} /> Informasi Pokok Materi
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pengenalan Algoritma & Struktur Data..."
                value={form.judul}
                onChange={e => handleChange('judul', e.target.value)}
                className="input-field font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Deskripsi Singkat <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Jelaskan secara ringkas isi materi ini..."
                value={form.deskripsi}
                onChange={e => handleChange('deskripsi', e.target.value)}
                className="input-field"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kategori Pembelajaran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemrograman, Sains, Bahasa, Desain..."
                  value={form.kategori}
                  onChange={e => handleChange('kategori', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Image size={15} /> URL Gambar Thumbnail (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.thumbnailUrl}
                  onChange={e => handleChange('thumbnailUrl', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video Link */}
        <div className="card border-l-4 border-l-red-500">
          <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Video className="text-red-500" size={20} /> Link Video Pembelajaran (YouTube)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Video akan otomatis di-embed dan dapat langsung diputar oleh siswa pada halaman materi.
          </p>
          <input
            type="url"
            placeholder="Contoh: https://www.youtube.com/watch?v=kUMe1FH4CHE"
            value={form.videoUrl}
            onChange={e => handleChange('videoUrl', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Konten Lengkap */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={20} /> Uraian Konten Materi <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Dapat menyertakan teks biasa atau tag HTML seperti &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;code&gt;.
          </p>
          <textarea
            placeholder="Tulis uraian materi pembelajaran lengkap di sini..."
            value={form.konten}
            onChange={e => handleChange('konten', e.target.value)}
            className="input-field font-mono text-sm leading-relaxed"
            rows={12}
          />
        </div>

        {/* Quiz Builder */}
        <div className="card border-2 border-emerald-100">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Award className="text-emerald-600" size={22} /> Kuis & Evaluasi Materi ({quiz.length} Soal)
              </h2>
              <p className="text-xs text-gray-500">
                Buat kuis interaktif tipe pilihan ganda, benar/salah, atau essay.
              </p>
            </div>
            <button
              type="button"
              onClick={addQuizItem}
              className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4 shadow"
            >
              <Plus size={16} /> Tambah Soal Baru
            </button>
          </div>

          {quiz.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Award size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">Belum ada soal kuis yang ditambahkan</p>
              <p className="text-xs text-gray-400 mt-1">Klik tombol "+ Tambah Soal Baru" di atas untuk menambahkan kuis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quiz.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {/* Soal Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                    onClick={() => setQuizExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-800 truncate max-w-sm">
                        {q.pertanyaan || `Soal ${idx + 1} (Belum diisi)`}
                      </span>
                      <span className="badge bg-blue-100 text-blue-700 text-xs font-medium">
                        {QUIZ_TYPES.find(t => t.value === q.type)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          removeQuizItem(idx); 
                        }}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Hapus soal ini"
                      >
                        <Trash2 size={16} />
                      </button>
                      {quizExpanded[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Soal Form */}
                  {quizExpanded[idx] && (
                    <div className="p-5 space-y-4 border-t border-gray-100">
                      {/* Pilihan Tipe */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Tipe Soal</label>
                        <div className="flex gap-2 flex-wrap">
                          {QUIZ_TYPES.map(type => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => updateQuizItem(idx, 'type', type.value)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                q.type === type.value
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'border-gray-300 text-gray-600 hover:border-blue-400'
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pertanyaan */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pertanyaan <span className="text-red-500">*</span></label>
                        <textarea
                          value={q.pertanyaan}
                          onChange={e => updateQuizItem(idx, 'pertanyaan', e.target.value)}
                          className="input-field text-sm"
                          rows={2}
                          placeholder="Tuliskan pertanyaan kuis..."
                        />
                      </div>

                      {/* Pilihan Ganda Form */}
                      {q.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                            Pilihan Jawaban & Tandai Jawaban Benar <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {q.options?.map((opt, optIdx) => {
                              const isChecked = q.correctAnswer === opt && opt.trim() !== '';

                              return (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={isChecked}
                                    onChange={() => opt.trim() && updateQuizItem(idx, 'correctAnswer', opt)}
                                    className="w-4 h-4 text-emerald-600 cursor-pointer"
                                    title="Tandai opsi ini sebagai jawaban benar"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={e => updateOption(idx, optIdx, e.target.value)}
                                    className={`input-field text-sm py-1.5 ${isChecked ? 'border-emerald-500 bg-emerald-50/30' : ''}`}
                                    placeholder={`Pilihan ${optIdx + 1}...`}
                                  />
                                  {q.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => removeOption(idx, optIdx)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-emerald-700 font-medium mt-2">
                            💡 Klik tombol radio di sebelah kiri untuk menentukan jawaban yang benar.
                          </p>
                          <button
                            type="button"
                            onClick={() => addOption(idx)}
                            className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Plus size={14} /> Tambah Opsi Pilihan
                          </button>
                        </div>
                      )}

                      {/* Benar/Salah Form */}
                      {q.type === 'true_false' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Tentukan Jawaban Benar <span className="text-red-500">*</span></label>
                          <div className="flex gap-3">
                            {['Benar', 'Salah'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => updateQuizItem(idx, 'correctAnswer', opt)}
                                className={`px-6 py-2 rounded-xl border font-bold text-sm transition-all ${
                                  q.correctAnswer === opt
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                    : 'border-gray-300 text-gray-600 hover:border-emerald-400'
                                }`}
                              >
                                {opt === 'Benar' ? '✓ Benar' : '✗ Salah'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Essay Kunci */}
                      {q.type === 'essay' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            Kunci Jawaban / Panduan Penilaian (Opsional)
                          </label>
                          <textarea
                            value={q.kunciJawaban || ''}
                            onChange={e => updateQuizItem(idx, 'kunciJawaban', e.target.value)}
                            className="input-field text-sm"
                            rows={2}
                            placeholder="Jawaban acuan yang benar untuk panduan siswa..."
                          />
                        </div>
                      )}

                      {/* Penjelasan Pembahasan */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                          Penjelasan / Pembahasan (Opsional)
                        </label>
                        <input
                          type="text"
                          value={q.penjelasan || ''}
                          onChange={e => updateQuizItem(idx, 'penjelasan', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Penjelasan yang tampil setelah siswa selesai mengerjakan kuis..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1 font-semibold"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 font-bold py-3.5 shadow-lg disabled:opacity-50"
          >
            <Save size={18} /> {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Materi' : 'Publikasikan Materi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormMateriPage;
