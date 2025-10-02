import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  

  // ✅ Redirect to login only after loading completes
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // ✅ Show loading screen while fetching user
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-purple-700 animate-pulse">
        Loading your dashboard...
      </div>
    );
  }

  // ✅ Graceful fallback if user is still null after loading
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-red-600">
        Failed to load user. Please try logging in again.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-100 to-purple-200 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 text-center w-full max-w-md animate-fadeIn">
        <h1 className="text-4xl font-extrabold text-purple-700 mb-4">
          Welcome to Blandine Supermarket 🎉
        </h1>

        {/* ✅ Profile picture or fallback */}
        {user.profile_pic ? (
          <img
            src={`http://localhost:3000${user.profile_pic}`}
            alt={`${user.username}'s profile`}
            className="w-28 h-28 rounded-full mx-auto border-4 border-purple-400 shadow-md mb-6 object-cover"
          />
        ) : (
          <div
            className="w-28 h-28 mx-auto rounded-full bg-purple-300 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-md"
            aria-label="User avatar fallback"
          >
            {user.username ? user.username.charAt(0).toUpperCase() : "?"}
          </div>
        )}

        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          🌟 Hello{" "}
          <span className="font-semibold text-purple-600">
            {user.username || "User"}
          </span>
          , manage your products, customers, and sales with ease.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/inventory")}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition"
          >
            🛒 Manage Products
          </button>
          <button
            onClick={() => navigate("/sales")}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition"
          >
            📊 View Sales
            
          </button>
          <button
            onClick={() => navigate("/customers")}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            👥 Manage Customers
          </button>
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
