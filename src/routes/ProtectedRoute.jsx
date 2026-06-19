import { Navigate } from "react-router-dom";
import FullScreenSpinner from "../components/common/Spinner";
import { useAuth } from "../hooks/useAuth";

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