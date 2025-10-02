import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-purple-600 text-lg">
        Checking authentication...
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}
