import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${username}:${password}`),
          "Content-Type": "application/json", 
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        navigate("/dashboard"); 
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <form
        className="p-8 bg-white rounded-xl shadow-lg w-96"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-purple-800 flex items-center gap-2 mb-6">
          <FaUser className="text-purple-600" /> Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-800 transition"
        >
          Login
        </button>

        {message && (
          <p className="mt-3 text-red-500 text-sm text-center">{message}</p>
        )}
      </form>
    </div>
  );
}
