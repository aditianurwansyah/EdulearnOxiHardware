import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, Edit, Trash2, Video, BookOpen,
  Award, Clock, Tag, Play, ChevronRight, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper ekstrak YouTube Video ID
const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const DetailMateriPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminUser, currentUser } = useAuth();
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true);
        const data = await dataService.getMateriById(id);
        if (data) {
          setMateri(data);
        } else {
          toast.error('Materi tidak ditemukan');
          navigate('/pembelajaran');
        }
      } catch (error) {
        toast.error('Gagal memuat materi');
        navigate('/pembelajaran');
      } finally {
        setLoading(false);
      }
    };
    fetchMateri();
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dataService.deleteMateri(id);
      toast.success('Materi berhasil dihapus!');
      navigate('/pembelajaran');
    } catch (error) {
      toast.error('Gagal menghapus materi');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuizSubmit = () => {
    const quiz = materi.quiz || [];
    let correct = 0;
    let gradableCount = 0;

    quiz.forEach((q, idx) => {
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        gradableCount++;
        if (quizAnswers[idx] && quizAnswers[idx].trim() === q.correctAnswer.trim()) {
          correct++;
        }
      }
    });

    const calculatedScore = gradableCount > 0 ? Math.round((correct / gradableCount) * 100) : 100;
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);
    toast.success('Jawaban kuis berhasil dikumpulkan!');
  };

  const videoId = materi ? getYouTubeId(materi.videoUrl) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Memuat rincian materi...</p>
        </div>
      </div>
    );
  }

  if (!materi) return null;

  const quiz = materi.quiz || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Action Bar */}
      <div className="bg-white border-b sticky top-16 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/pembelajaran"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Kembali ke Daftar Pembelajaran
          </Link>
          {isAdminUser && (
            <div className="flex items-center gap-2">
              <Link
                to={`/pembelajaran/${id}/edit`}
                className="flex items-center gap-1.5 btn-secondary text-sm py-1.5 px-3"
              >
                <Edit size={15} /> Edit Materi
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 btn-danger text-sm py-1.5 px-3"
              >
                <Trash2 size={15} /> Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {materi.kategori && (
            <span className="badge bg-blue-100 text-blue-800 font-medium">
              <Tag size={12} className="mr-1" /> {materi.kategori}
            </span>
          )}
          {materi.videoUrl && (
            <span className="badge bg-red-100 text-red-700 font-medium">
              <Video size={12} className="mr-1" /> Dilengkapi Video
            </span>
          )}
          {quiz.length > 0 && (
            <span className="badge bg-green-100 text-green-700 font-medium">
              <Award size={12} className="mr-1" /> {quiz.length} Soal Kuis
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
            <Clock size={12} />
            Diterbitkan: {new Date(materi.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
          {materi.judul}
        </h1>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {materi.deskripsi}
        </p>

        {/* Video Player Section */}
        {videoId ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                <Play size={18} fill="currentColor" />
              </span>
              <h2 className="text-xl font-bold text-gray-800">Video Pembelajaran Interaktif</h2>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl aspect-video border border-gray-200 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=0`}
                title={materi.judul}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : materi.videoUrl ? (
          <div className="card mb-8 border-l-4 border-l-red-500">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Video className="text-red-500" size={20} /> Tautan Video Tambahan
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Materi ini dilengkapi video edukasi eksternal. Silakan buka tautan berikut:
            </p>
            <a
              href={materi.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline bg-blue-50 px-4 py-2 rounded-lg"
            >
              <Play size={16} /> Buka Video ({materi.videoUrl})
            </a>
          </div>
        ) : null}

        {/* Text/HTML Content Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
            <BookOpen className="text-blue-600" size={22} /> Uraian Materi Pembelajaran
          </h2>
          <div
            className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: materi.konten || '<p>Konten belum tersedia.</p>' }}
          />
        </div>

        {/* Quiz Section */}
        {quiz.length > 0 && (
          <div className="card border-2 border-emerald-100 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Award className="text-emerald-600" size={24} /> Kuis Pemahaman Materi
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Uji pemahamanmu setelah membaca materi dan menonton video di atas ({quiz.length} soal).
                </p>
              </div>

              {!showQuiz && !quizSubmitted && (
                <button
                  onClick={() => setShowQuiz(true)}
                  className="btn-primary flex items-center gap-2 self-start sm:self-auto shadow"
                >
                  Mulai Kerjakan Kuis <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Quiz Banner sebelum mulai */}
            {!showQuiz && !quizSubmitted && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 text-center border border-emerald-200">
                <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                  <Award size={36} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Siap untuk Menguji Kemampuanmu?</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
                  Kuis ini terdiri dari berbagai tipe soal (pilihan ganda, benar/salah, dan essay). 
                  Skor Anda akan dihitung secara otomatis setelah submit!
                </p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="btn-primary py-2.5 px-6 font-semibold"
                >
                  Mulai Kuis Sekarang
                </button>
              </div>
            )}

            {/* Hasil Kuis Setelah Submit */}
            {quizSubmitted && (
              <div className={`text-center p-8 rounded-2xl mb-8 border ${quizScore >= 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`text-6xl font-black mb-2 ${quizScore >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {quizScore}%
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {quizScore >= 70 ? '🎉 Luar Biasa! Anda Berhasil Lulus!' : '📚 Jangan Menyerah, Tetap Semangat!'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm mb-6">
                  {quizScore >= 70 
                    ? 'Pemahaman Anda terhadap materi ini sangat memuaskan. Silakan lanjut ke materi berikutnya!' 
                    : 'Masih ada beberapa jawaban yang kurang tepat. Anda bisa meninjau penjelasan di bawah ini dan mencoba lagi.'}
                </p>
                <button
                  onClick={() => { 
                    setQuizAnswers({}); 
                    setQuizSubmitted(false); 
                    setShowQuiz(true); 
                    setQuizScore(0); 
                  }}
                  className="btn-secondary text-sm font-semibold px-6"
                >
                  Ulangi Kuis
                </button>
              </div>
            )}

            {/* Daftar Soal */}
            {(showQuiz || quizSubmitted) && (
              <div className="space-y-6">
                {quiz.map((q, idx) => {
                  const isAnswered = quizAnswers[idx] !== undefined;
                  const isCorrect = q.type !== 'essay' && quizAnswers[idx] === q.correctAnswer;

                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-2xl p-5 transition-all ${
                        quizSubmitted
                          ? q.type === 'essay' 
                            ? 'border-gray-200 bg-gray-50/50'
                            : isCorrect 
                            ? 'border-emerald-300 bg-emerald-50/40' 
                            : 'border-red-300 bg-red-50/40'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <span className="font-bold bg-blue-100 text-blue-800 rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                            {q.type === 'multiple_choice' ? 'Pilihan Ganda' : q.type === 'true_false' ? 'Benar / Salah' : 'Uraian / Essay'}
                          </span>
                          <p className="font-bold text-gray-800 text-base mt-2">{q.pertanyaan}</p>
                        </div>
                      </div>

                      {/* Tipe 1: Pilihan Ganda */}
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2 ml-10">
                          {q.options?.map((opt, optIdx) => {
                            const isSelected = quizAnswers[idx] === opt;
                            const isThisCorrect = opt === q.correctAnswer;

                            return (
                              <label
                                key={optIdx}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                  quizSubmitted
                                    ? isThisCorrect
                                      ? 'border-emerald-500 bg-emerald-100 text-emerald-900 font-semibold'
                                      : isSelected && !isThisCorrect
                                      ? 'border-red-400 bg-red-100 text-red-900'
                                      : 'border-gray-200 text-gray-500'
                                    : isSelected
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 text-blue-900'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${idx}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [idx]: opt }))}
                                  disabled={quizSubmitted}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm flex-1">{opt}</span>
                                {quizSubmitted && isThisCorrect && (
                                  <span className="badge bg-emerald-600 text-white text-xs flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Jawaban Benar
                                  </span>
                                )}
                                {quizSubmitted && isSelected && !isThisCorrect && (
                                  <span className="badge bg-red-600 text-white text-xs flex items-center gap-1">
                                    <XCircle size={12} /> Jawaban Anda
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Tipe 2: Benar / Salah */}
                      {q.type === 'true_false' && (
                        <div className="flex gap-4 ml-10">
                          {['Benar', 'Salah'].map((opt) => {
                            const isSelected = quizAnswers[idx] === opt;
                            const isThisCorrect = opt === q.correctAnswer;

                            return (
                              <label
                                key={opt}
                                className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border cursor-pointer font-bold text-sm transition-all ${
                                  quizSubmitted
                                    ? isThisCorrect
                                      ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                                      : isSelected && !isThisCorrect
                                      ? 'border-red-400 bg-red-100 text-red-900'
                                      : 'border-gray-200 text-gray-400'
                                    : isSelected
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 text-blue-900'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${idx}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [idx]: opt }))}
                                  disabled={quizSubmitted}
                                  className="sr-only"
                                />
                                <span>{opt === 'Benar' ? '✓ Benar' : '✗ Salah'}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Tipe 3: Essay */}
                      {q.type === 'essay' && (
                        <div className="ml-10">
                          <textarea
                            className="input-field text-sm leading-relaxed"
                            rows={3}
                            placeholder="Ketik jawaban penjelasan Anda di sini..."
                            value={quizAnswers[idx] || ''}
                            onChange={e => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                            disabled={quizSubmitted}
                          />
                          {quizSubmitted && q.kunciJawaban && (
                            <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm">
                              <p className="font-bold text-blue-900 mb-1 flex items-center gap-1">
                                💡 Panduan / Kunci Jawaban Referensi:
                              </p>
                              <p className="text-blue-800 leading-relaxed">{q.kunciJawaban}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Penjelasan Pembahasan */}
                      {quizSubmitted && q.penjelasan && (
                        <div className="ml-10 mt-3 p-3 bg-gray-100 rounded-xl text-xs text-gray-700 leading-relaxed">
                          <strong>Pembahasan:</strong> {q.penjelasan}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizSubmitted && (
                  <div className="pt-2">
                    <button
                      onClick={handleQuizSubmit}
                      className="w-full btn-primary py-3.5 text-base font-bold shadow-lg"
                    >
                      Kumpulkan & Cek Skor Kuis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 rounded-xl p-2.5">
                <AlertCircle size={26} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Hapus Materi Ini?</h3>
                <p className="text-xs text-gray-500">Tindakan ini permanen</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus materi <strong>"{materi.judul}"</strong> beserta semua soal kuis di dalamnya?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailMateriPage;
