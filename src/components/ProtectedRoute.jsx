import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { currentUser, isAdminUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdminUser) return <Navigate to="/" replace />;
  return children;
};
