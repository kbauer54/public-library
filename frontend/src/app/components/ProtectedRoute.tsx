import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();

  const isStaffRoute = location.pathname.startsWith("/staff");

  // Staff section protection
  if (isStaffRoute && user?.role !== "staff") {
    return <Navigate to="/login" replace />;
  }

  // Patron section protection
  if (!isStaffRoute && user?.role !== "patron") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
