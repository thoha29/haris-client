import "./Header.css";
import Navbar from "./Navbar";

function Header({ onLogout, onToggleSidebar }) {
  return (
    <header className="Header fixed-top">
      <Navbar onLogout={onLogout} onToggleSidebar={onToggleSidebar} />
    </header>
  );
}

export default Header;
