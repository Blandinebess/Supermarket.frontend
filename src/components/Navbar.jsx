// Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username"); // optional; set on login

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav className="bg-purple-700 text-white">
      <div className="container mx-auto flex items-center justify-between p-3">
        {/* Left links */}
        <div>
          <Link to="/" className="font-bold text-lg mr-4">
            Supermarket
          </Link>
          <Link to="/inventory" className="mr-3 hover:underline">
            Inventory
          </Link>
          <Link to="/customers" className="mr-3 hover:underline">
            Customers
          </Link>
          <Link to="/sales" className="mr-3 hover:underline">
            Sales
          </Link>
        </div>

        {/* Right side: login/logout */}
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="hidden sm:inline-block">
                Hi, {username || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-purple-700 px-3 py-1 rounded font-semibold hover:bg-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-white text-purple-700 px-3 py-1 rounded font-semibold hover:bg-gray-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
