import { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Attach token globally for every axios request
  useEffect(() => {
    axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          
          const res = await axios.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed:", err);
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post("/auth/login", { username, password });
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    navigate("/dashboard"); 
  };

  const register = async (username, password, profile_pic = null) => {
    await axios.post("/auth/register", { username, password, profile_pic });
    await login(username, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
