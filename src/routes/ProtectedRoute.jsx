import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FullScreenSpinner from "../components/common/Spinner";

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <FullScreenSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedRoute;