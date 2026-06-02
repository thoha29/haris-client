import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function SideBar({ isOpen }) {

  const role = localStorage.getItem("role");

    return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <ul className="sidebar-nav" id="sidebar-nav">

        {role === "karyawan" && (
        <>
            {/* DASHBOARD */}
        <li className="nav-item">
          <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")
            }>
            <i className="bi bi-grid"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* Karyawan */}
        <li className="nav-item">
          <a
            href="Karyawan"
            className="nav-link collapsed"
            data-bs-toggle="collapse" 
            data-bs-target="#karyawan-nav" 
            onClick={(e) => e.preventDefault()}
          >
            <i className="bi bi-person-workspace"></i>
            <span>Karyawan</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>

          <ul
            id="karyawan-nav"
            className="nav-content collapse"
            data-bs-parent="#sidebar-nav"
          >
            <li>
              <NavLink to="data-pribadi" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Data Pribadi</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="riwayat-karier" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Riwayat Karier</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="dokumen-pribadi" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Dokumen Pribadi</span>
              </NavLink>
            </li>
          </ul>
        </li>

        {/* Kehadiran */}
        <li className="nav-item">
          <a
            href="/"
            className="nav-link collapsed"
            data-bs-toggle="collapse"
            data-bs-target="#kehadiran-nav"
            onClick={(e) => e.preventDefault()}
          >
            <i className="bi bi-clock-fill"></i>
            <span>Kehadiran</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>

          <ul
            id="kehadiran-nav"
            className="nav-content collapse"
            data-bs-parent="#sidebar-nav"
          >
            <li>
              <NavLink
                to="/absensi" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Absensi</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/riwayat-absensi" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Riwayat Absensi</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/jamkerja" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Jam Kerja & Lembur</span>
              </NavLink>
            </li>
          </ul>
        </li>

        {/* Cuti dan Izin */}
        <li className="nav-item">
          <a
            href="/"
            className="nav-link collapsed"
            data-bs-toggle="collapse"
            data-bs-target="#cuti-nav"
            onClick={(e) => e.preventDefault()}
          >
            <i className="bi bi-calendar-range-fill"></i>
            <span>Cuti & Izin</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>

          <ul
            id="cuti-nav"
            className="nav-content collapse"
            data-bs-parent="#sidebar-nav"
          >
            <li>
              <NavLink
                to="/pengajuan" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Pengajuan Cuti & Izin</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/status-pengajuan" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Status Pengajuan</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/riwayat-cuti" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Riwayat & Sisa Cuti</span>
              </NavLink>
            </li>
          </ul>
        </li>

    {/* Penggajian */}
      <li className="nav-item">
          <a
            href="/"
            className="nav-link collapsed"
            data-bs-toggle="collapse"
            data-bs-target="#gaji-nav"
            onClick={(e) => e.preventDefault()}
          >
            <i className="bi bi-currency-dollar"></i>
            <span>Penggajian</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>

          <ul
            id="gaji-nav"
            className="nav-content collapse"
            data-bs-parent="#sidebar-nav"
          >
            <li>
              <NavLink
                to="/slipgaji" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Slip Gaji</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/histori-gaji" className={({ isActive }) => (isActive ? "active" : "")} >
                <i className="bi bi-circle"></i>
                <span>Histori Penggajian</span>
              </NavLink>
            </li>
          </ul>
        </li>

        {/* Kinerja */}
        <li className="nav-item">
            <a
              href="/"
              className="nav-link collapsed"
              data-bs-toggle="collapse"
              data-bs-target="#kinerja-nav"
              onClick={(e) => e.preventDefault()}
            >
              <i className="bi bi-bar-chart-fill"></i>
              <span>Kinerja</span>
              <i className="bi bi-chevron-down ms-auto"></i>
            </a>

            <ul
              id="kinerja-nav"
              className="nav-content collapse"
              data-bs-parent="#sidebar-nav"
            >
              <li>
                <NavLink
                  to="/target" className={({ isActive }) => (isActive ? "active" : "")} >
                  <i className="bi bi-circle"></i>
                  <span>Target Kinerja</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/hasil-penilaian" className={({ isActive }) => (isActive ? "active" : "")} >
                  <i className="bi bi-circle"></i>
                  <span>Hasil Penilaian</span>
                </NavLink>
              </li>
            </ul>
          </li>
          </>
        )}


        {role === "hrd" && (
          <>
            {/* Dashboard HRD */}
            <li className="nav-item">
              <NavLink to="/dashboard-hrd" end
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }>
                <i className="bi bi-grid"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Karyawan HRD */}
            <li className="nav-item">
              <a
                href="/"
                className="nav-link collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#hrd-nav"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-people-fill"></i>
                <span>Karyawan</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>

              <ul id="hrd-nav" className="nav-content collapse">
                <li>
                  <NavLink to="/data-karyawan">
                    <i className="bi bi-circle"></i>
                    <span>Data Karyawan</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/riwayat-karier-hrd">
                    <i className="bi bi-circle"></i>
                    <span>Riwayat Karier</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/kompetensi">
                    <i className="bi bi-circle"></i>
                    <span>Kompetensi & Kepelatihan</span>
                  </NavLink>
                </li>
              </ul>
            </li>
          </>
        )}

      </ul>
    </aside>
  );
}

export default SideBar;
