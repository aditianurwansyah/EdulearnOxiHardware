import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PembelajaranPage from './pages/PembelajaranPage';
import DetailMateriPage from './pages/DetailMateriPage';
import FormMateriPage from './pages/FormMateriPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pembelajaran" element={<PembelajaranPage />} />
              <Route path="/pembelajaran/:id" element={<DetailMateriPage />} />

              {/* Admin Routes */}
              <Route
                path="/pembelajaran/tambah"
                element={
                  <AdminRoute>
                    <FormMateriPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/pembelajaran/:id/edit"
                element={
                  <AdminRoute>
                    <FormMateriPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center text-center px-4">
                    <div>
                      <p className="text-8xl font-bold text-blue-200 mb-4">404</p>
                      <h2 className="text-2xl font-bold text-gray-700 mb-2">Halaman Tidak Ditemukan</h2>
                      <p className="text-gray-400 mb-6">Halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
                      <a href="/" className="btn-primary">Kembali ke Beranda</a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
