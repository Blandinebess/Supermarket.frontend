import { useState } from "react";
import { FaFlower } from "react-icons/fa";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registered successfully!");
      } else {
        setMessage(data.message || "Error registering");
      }
    } catch (err) {
        console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded-xl shadow-lg w-96"
      >
        <h2 className="text-3xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaFlower className="text-accent" /> Register
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition">
          Register
        </button>

        {message && <p className="mt-3 text-red-500">{message}</p>}
      </form>
    </div>
  );
}
