import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="EduLearn Logo" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xl font-bold text-blue-400">EduLearn</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform edukasi digital yang menyediakan materi pembelajaran berkualitas tinggi untuk semua kalangan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigasi Cepat</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Beranda</Link></li>
              <li><Link to="/pembelajaran" className="hover:text-blue-400 transition-colors">Pembelajaran</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Masuk / Daftar</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontak</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span>info@edulearn.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                <span>Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} EduLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
