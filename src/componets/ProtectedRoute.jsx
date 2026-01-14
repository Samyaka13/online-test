import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAdmin = sessionStorage.getItem("isAdmin");

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}