import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";
import "./Navbar.css";

export default function Navbar({ onLogout, onToggleSidebar }) {
  const username = localStorage.getItem("username");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown saat klik link
  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        {/* HAMBURGER */}
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <span className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <img src={logo} alt="Logo" className="navbar-logo" />
        <span className="navbar-title">
          PT. BANGGAI SENTRAL SULAWESI
        </span>
      </div>

      <div className="navbar-right" ref={dropdownRef}>
        <div className="profile" onClick={() => setOpen(!open)}>
          <img
            src="https://i.pravatar.cc/40"
            alt="User"
            className="navbar-avatar"
          />
          <span className="profile-name">
            {username || "User"}
          </span>
        </div>

        {open && (
          <div className="dropdown">
            {/* Profile */}
            <Link to="Profile" className="dropdown-link" onClick={handleLinkClick}>
              <i className="bi bi-person-circle"></i>
              <span>Profile</span>
            </Link>

            <hr />

            {/* Logout */}
            <button className="dropdown-link logout" onClick={onLogout}>
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}