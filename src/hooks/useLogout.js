import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return async () => {
    await logout();
    navigate('/admin/login');
  };
}