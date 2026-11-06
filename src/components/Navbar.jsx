import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Home, LogOut, User, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, userRole, isAdminUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil keluar');
      navigate('/');
    } catch {
      toast.error('Gagal keluar');
    }
  };

  const navLinks = [
    { to: '/', label: 'Beranda', icon: Home },
    { to: '/pembelajaran', label: 'Pembelajaran', icon: BookOpen },
  ];

  if (isAdminUser) {
    navLinks.push({ to: '/admin', label: 'Admin Panel', icon: Shield });
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="EduLearn Logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xl font-bold text-blue-600">EduLearn</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 font-medium transition-colors ${
                  isActive(to) && to !== '/'
                    ? 'text-blue-600'
                    : to === '/' && location.pathname === '/'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">{currentUser.displayName || currentUser.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Keluar</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg font-medium ${
                  isActive(to) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <div className="border-t pt-3">
              {currentUser ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 text-red-500 px-2 py-2"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-sm w-full text-center block"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
