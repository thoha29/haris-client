import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function SideBar({ isOpen }) {
  const role = localStorage.getItem('role');

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <ul className="sidebar-nav" id="sidebar-nav">
        {/* ==================== MENU KARYAWAN ==================== */}
        {role === 'karyawan' && (
          <>
            <li className="nav-item">
              <NavLink
                to="Dashboard-Karyawan"
                end
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active' : '')
                }
              >
                <i className="bi bi-grid"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <a
                href="/"
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
                  <NavLink to="data-pribadi">
                    <span>Data Pribadi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="riwayat-karier">
                    <span>Riwayat Karier</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dokumen-pribadi">
                    <span>Dokumen Pribadi</span>
                  </NavLink>
                </li>
              </ul>
            </li>

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
                  <NavLink to="absensi">
                    <span>Absensi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="absensi-lembur">
                    <span>Absensi Lembur</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="riwayat-absensi">
                    <span>Riwayat Absensi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="riwayat-absensi-lembur">
                    <span>Riwayat Absensi Lembur</span>
                  </NavLink>
                </li>
              </ul>
            </li>

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
                  <NavLink to="Pengajuan">
                    <span>Pengajuan Cuti & Izin</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="riwayat-pengajuan">
                    <span>Status Pengajuan</span>
                  </NavLink>
                </li>
              </ul>
            </li>

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
                  <NavLink to="SlipGaji">
                    <span>Slip Gaji</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/histori-gaji">
                    <span>Next Section</span>
                  </NavLink>
                </li>
              </ul>
            </li>
          </>
        )}

        {/* ==================== MENU PIMPINAN ==================== */}
        {role === 'pimpinan' && (
          <>
            <li className="nav-item">
              <NavLink
                to="datakaryawan"
                className={({ isActive }) =>
                  'nav-link' + (isActive ? '' : ' collapsed')
                }
              >
                <i className="bi bi-person-plus-fill"></i>
                <span>Tambah User Karyawan</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="ApprovalGaji"
                className={({ isActive }) =>
                  'nav-link' + (isActive ? '' : ' collapsed')
                }
              >
                <i className="bi bi-cash-coin"></i>
                <span>Approval Gaji</span>
              </NavLink>
            </li>
          </>
        )}
        {/* ==================== MENU HRD ==================== */}
        {role === 'hrd' && (
          <>
            <li className="nav-item">
              <NavLink
                to="/dashboard-hrd"
                end
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active' : '')
                }
              >
                <i className="bi bi-grid"></i>
                <span>Dashboard HRD</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <a
                href="/"
                className="nav-link collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#user-absen-nav"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-clock-fill"></i>
                <span>Kehadiran Saya</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="user-absen-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="absensi">
                    <span>Absensi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="riwayat-absensi">
                    <span>Riwayat Absensi</span>
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <NavLink
                to="TambahDataPribadi"
                className={({ isActive }) =>
                  'nav-link' + (isActive ? '' : ' collapsed')
                }
              >
                <i className="bi bi-person-lines-fill"></i>
                <span>Tambah Data Pribadi</span>
              </NavLink>
            </li>

            {/* Group Approval Absensi */}
            <li className="nav-item">
              <a
                href="/"
                className="nav-link collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#hrd-absensi-nav"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-fingerprint"></i>
                <span>Approval Absensi</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="hrd-absensi-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="hrdapproval">
                    <span>Konfirmasi Absensi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="Proses-Absensi">
                    <span>Proses Absensi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="hrdmonitoring">
                    <span>Riwayat & Monitoring</span>
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Group Approval Cuti */}
            <li className="nav-item">
              <a
                href="/"
                className="nav-link collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#hrd-cuti-nav"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-calendar-check-fill"></i>
                <span>Approval Cuti & Izin</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="hrd-cuti-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="HrdApprovalCuti">
                    <span>Konfirmasi Cuti</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="HrdRiwayatCuti">
                    <span>Riwayat Cuti</span>
                  </NavLink>
                </li>
              </ul>
            </li>
          </>
        )}

        {/* ==================== MENU KEUANGAN (WIDE VERSION) ==================== */}
        {role === 'keuangan' && (
          <>
            <li className="nav-item">
              <NavLink
                to="Dashboard-Keuangan"
                className={({ isActive }) =>
                  'nav-link' + (isActive ? '' : ' collapsed')
                }
              >
                <i className="bi bi-grid-fill"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* ===== MODUL KEHADIRAN ===== */}
            <li className="nav-item">
              <a
                className="nav-link collapsed"
                data-bs-target="#keuangan-absen-nav"
                data-bs-toggle="collapse"
                href="/"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-clock-history"></i>
                <span>Kehadiran & Absensi</span>{' '}
                {/* Nama diperpanjang agar memenuhi ruang kanan */}
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="keuangan-absen-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="absensi">
                    <i className="bi bi-circle"></i>
                    <span>Presensi Harian Karyawan</span>{' '}
                    {/* Teks lebih panjang ke kanan */}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="riwayat-absensi">
                    <i className="bi bi-circle"></i>
                    <span>Log Riwayat Kehadiran Lengkap</span>
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* ===== MODUL GAJI KARYAWAN ===== */}
            <li className="nav-item">
              <a
                className="nav-link collapsed"
                data-bs-target="#keuangan-gaji-nav"
                data-bs-toggle="collapse"
                href="/"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-cash-stack"></i>
                <span>Payroll & Penggajian Karyawan</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="keuangan-gaji-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="Skemagaji">
                    <i className="bi bi-circle"></i>
                    <span>Master Skema Gaji & Tunjangan</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="HrdPayroll">
                    <i className="bi bi-circle"></i>
                    <span>Generate & Cetak Slip Gaji</span>
                  </NavLink>
                </li>
              </ul>
            </li>
          </>
        )}

        {/* ==================== MENU USER (ATASAN) ==================== */}
        {role === 'user' && (
          <>
            <li className="nav-item">
              <a
                href="/"
                className="nav-link collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#user-absen-nav"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-clock-fill"></i>
                <span>Kehadiran Saya</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="user-absen-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="absensi">
                    <span>Absensi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="riwayat-absensi">
                    <span>Riwayat Absensi</span>
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Group Approval User */}
            <li className="nav-item">
              <a
                href="/"
                className="nav-link collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#user-approval-nav"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-check2-square"></i>
                <span>Approval Menu</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="user-approval-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="UserApproval">
                    <span>Approve Absensi</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="UserApprovalLembur">
                    <span>Approve Absensi Lembur</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="UserApprovalCuti">
                    <span>Approve Cuti & Izin</span>
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <a
                href="/"
                className="nav-link collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#user-config-nav"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-gear-fill"></i>
                <span>Konfigurasi</span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="user-config-nav"
                className="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <NavLink to="SkemaManager">
                    <span>Skema Kerja</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="SetJadwalKaryawan">
                    <span>Atur Jadwal</span>
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
