import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import api from "../../config/api";
import logo from "../../images/logo.png";
import "./login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  // State tetap menggunakan nama username sesuai keinginanmu
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Di sini kuncinya: kita kirim variabel 'username' ke field 'email' di backend
      const res = await api.post("/api/auth/login", {
        username: username, // Memetakan username (input) ke email (backend)
        password: password,
      });

      // Simpan data login ke localStorage
      localStorage.setItem("access_token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.id_user);
      localStorage.setItem("username", username);
      // Arahkan halaman berdasarkan role dari response backend
      const userRole = res.data.role;
      
      if (userRole === "hrd") {
        navigate("/dashboard-hrd");
      } else if (userRole === "karyawan") {
        navigate("/dashboard-karyawan");
      } else if (userRole === "pimpinan") {
        navigate("/dashboard-pimpinan");
      } else {
        navigate("/dashboard-user");
      }

      // Jalankan fungsi onLogin jika dilempar dari App.js
      if (onLogin) onLogin();

    } catch (err) {
      // Mengambil pesan error dari backend jika ada (misal: "Email tidak terdaftar")
      const errorMsg = err.response?.data?.message || "Login gagal";
      Swal.fire('Login Gagal', errorMsg, 'error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <img src={logo} alt="Logo" />
        </div>

        <h4 className="login-title">
          PT. BANGGAI SENTRAL SULAWESI
        </h4>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="login-input"
            placeholder="Username" // Label tetap Username
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button className="login-button" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}