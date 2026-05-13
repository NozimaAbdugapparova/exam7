import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Token tekshirilguncha hech narsa ko'rsatma
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f6fa]">
        <div className="w-8 h-8 border-4 border-[#3d5af1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Token yo'q bo'lsa login sahifasiga yo'naltir
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Token bor bo'lsa bolalar componentlarini ko'rsat
  return children;
}