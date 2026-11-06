import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { isFirebaseReady, dataService } from '../services/dataService';

const AuthContext = createContext();

const DEMO_USER_STORAGE_KEY = 'edulearn_demo_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin emails - tambahkan email admin di sini
  const ADMIN_EMAILS = [
    'admin@edulearn.com',
    'admin@demo.com',
    'aditi@edulearn.com'
  ];

  const isAdmin = (email) => ADMIN_EMAILS.includes(email?.toLowerCase());

  // Google OAuth Login
  const loginWithGoogle = async () => {
    if (!isFirebaseReady()) {
      throw new Error('Firebase belum dikonfigurasi. Silakan isi file .env atau gunakan Login Cepat Demo.');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Simpan info user ke Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const assignedRole = isAdmin(user.email) ? 'admin' : 'student';

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: assignedRole,
          createdAt: new Date().toISOString(),
        });
      }
      setUserRole(assignedRole);
    } catch (err) {
      console.warn('Error saving user to firestore:', err);
    }

    return result;
  };

  // Email / Password Login
  const loginWithEmail = async (email, password) => {
    if (!isFirebaseReady()) {
      // Demo fallback login jika Firebase belum diset
      const role = isAdmin(email) ? 'admin' : 'student';
      const demoUser = {
        uid: 'demo-' + Date.now(),
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, role }));
      dataService.saveLocalUser({ ...demoUser, role });
      setCurrentUser(demoUser);
      setUserRole(role);
      return { user: demoUser };
    }

    return signInWithEmailAndPassword(auth, email, password);
  };

  // Register with Email
  const registerWithEmail = async (email, password, displayName) => {
    if (!isFirebaseReady()) {
      const role = isAdmin(email) ? 'admin' : 'student';
      const demoUser = {
        uid: 'demo-' + Date.now(),
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, role }));
      dataService.saveLocalUser({ ...demoUser, role });
      setCurrentUser(demoUser);
      setUserRole(role);
      return { user: demoUser };
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const role = isAdmin(user.email) ? 'admin' : 'student';
    
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
      role: role,
      createdAt: new Date().toISOString(),
    });
    
    setUserRole(role);
    return result;
  };

  // Instant Demo Login (Mudah untuk testing & preview tanpa Firebase)
  const loginAsDemo = (role = 'admin') => {
    const demoUser = role === 'admin' 
      ? {
          uid: 'admin-1',
          email: 'admin@edulearn.com',
          displayName: 'Administrator (Demo)',
          photoURL: null,
        }
      : {
          uid: 'student-1',
          email: 'pelajar@edulearn.com',
          displayName: 'Pelajar Aktif (Demo)',
          photoURL: null,
        };

    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, role }));
    dataService.saveLocalUser({ ...demoUser, role });
    setCurrentUser(demoUser);
    setUserRole(role);
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    if (isFirebaseReady()) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Signout error:', err);
      }
    }
    setCurrentUser(null);
    setUserRole(null);
  };

  useEffect(() => {
    // Periksa apakah ada sesi demo di localStorage
    const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (savedDemo) {
      try {
        const { user, role } = JSON.parse(savedDemo);
        setCurrentUser(user);
        setUserRole(role);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }
    }

    // Jika Firebase tersedia, dengarkan state auth
    if (isFirebaseReady()) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserRole(userSnap.data().role);
            } else {
              setUserRole(isAdmin(user.email) ? 'admin' : 'student');
            }
          } catch {
            setUserRole(isAdmin(user.email) ? 'admin' : 'student');
          }
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      });

      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdminUser: userRole === 'admin',
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAsDemo,
    logout,
    loading,
    isFirebaseConnected: isFirebaseReady(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
