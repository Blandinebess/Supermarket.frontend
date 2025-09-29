import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaShoppingBag } from "react-icons/fa"; // valid icons

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav className="bg-purple-700 text-white flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <FaShoppingBag className="w-6 h-6 text-yellow-300" />
        <span className="font-bold text-xl">Supermarket</span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="hover:text-yellow-300">
          Dashboard
        </Link>
        <Link to="/inventory" className="hover:text-yellow-300">
          Inventory
        </Link>
        <Link to="/customers" className="hover:text-yellow-300">
          Customers
        </Link>
        <Link to="/sales" className="hover:text-yellow-300">
          Sales
        </Link>
        <div className="flex items-center gap-2">
          <FaUser />
          <span>{username}</span>
          <button
            onClick={handleLogout}
            className="ml-2 bg-red-500 px-2 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
