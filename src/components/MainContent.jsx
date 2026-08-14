import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import Default
import Profile from '../pages/Profile/Profile';
import UserApproval from '../pages/menu-userkaryawan/UserApproval';
import UserApprovalCuti from '../pages/menu-userkaryawan/UserApprovalCuti';
import { SkemaManager, SetJadwalKaryawan } from '../pages/menu-userkaryawan';
import Skemagaji from '../pages/menu-keuangan/Gaji/Skemagaji';
import ApprovalGaji from '../pages/menu-pimpinan/ApprovalGaji';
import UserApprovalLembur from '../pages/menu-userkaryawan/UserApprovalLembur';
import UserApprovalRiwayat from '../pages/menu-userkaryawan/UserApprovalRiwayat';
import './MainContent.css';

// Named Imports dari Folder menu-hrd
import {
  DashboardHRD,
  HrdApproval,
  DataKaryawan,
  HrdApprovalCuti,
  TambahDataPribadi,
  ListKaryawanView,
  HrdMonitoring,
  HrdKaryawanDetail,
  HrdRiwayatCuti,
  HrdCutiRiwayatDetail,
  HrdRiwayatPengajuanCuti,
  ProsesAbsensi,
  DaftarGaji,
} from '../pages/menu-hrd';

// Named Imports dari Folder menu-keuangan
import {
  HrdPayroll,
  RiwayatGaji,
  DashboardKeuangan,
} from '../pages/menu-keuangan';

// Named Imports dari Folder menu-karyawan
import {
  Absensi,
  RiwayatAbsensi,
  DashboardKaryawan,
  DataPribadi,
  DokumenPribadi,
  Karyawan,
  Pengajuan,
  RiwayatKarier,
  RiwayatPengajuan,
  SlipGaji,
  AbsensiLembur,
  RiwayatAbsensiLembur,
  ListGaji,
} from '../pages/menu-karyawan';

function MainContent({ isSidebarOpen }) {
  const currentUserId = localStorage.getItem('userId');

  return (
    <main id="main" className={`main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Routes>
        {/* Profile */}
        <Route path="Profile" element={<Profile />} />

        {/* Menu Pimpinan */}
        <Route path="datakaryawan" element={<DataKaryawan />} />
        <Route path="ApprovalGaji" element={<ApprovalGaji />} />

        {/* Menu Karyawan */}
        <Route path="Dashboard-Karyawan" element={<DashboardKaryawan />} />
        <Route path="Karyawan" element={<Karyawan />} />
        <Route path="data-pribadi" element={<DataPribadi />} />
        <Route path="riwayat-karier" element={<RiwayatKarier />} />

        <Route
          path="dokumen-pribadi"
          element={<DokumenPribadi idUser={currentUserId} />}
        />

        <Route path="Absensi" element={<Absensi />} />
        <Route path="Riwayat-Absensi" element={<RiwayatAbsensi />} />
        <Route path="Pengajuan" element={<Pengajuan />} />
        <Route path="riwayat-pengajuan" element={<RiwayatPengajuan />} />
        <Route path="SlipGaji" element={<SlipGaji />} />
        <Route path="listGaji" element={<ListGaji />}></Route>

        {/* untuk Lembur */}
        <Route path="Absensi-Lembur" element={<AbsensiLembur />} />
        <Route
          path="riwayat-absensi-lembur"
          element={<RiwayatAbsensiLembur />}
        ></Route>

        {/* Menu HRD */}
        <Route path="Dashboard-HRD" element={<DashboardHRD />} />
        <Route path="HrdApproval" element={<HrdApproval />} />
        <Route path="DataKaryawan" element={<DataKaryawan />} />
        <Route path="ListKaryawanView" element={<ListKaryawanView />} />
        <Route path="HrdApprovalCuti" element={<HrdApprovalCuti />} />
        <Route path="HrdRiwayatPengajuanCuti" element={<HrdRiwayatPengajuanCuti />} />
        <Route path="TambahDataPribadi" element={<TambahDataPribadi />} />
        <Route path="HrdMonitoring" element={<HrdMonitoring />} />
        <Route path="hrd/riwayat/:id_user" element={<HrdKaryawanDetail />} />
        <Route path="HrdRiwayatCuti" element={<HrdRiwayatCuti />} />
        <Route path="Proses-Absensi" element={<ProsesAbsensi />} />
        <Route path="Daftar-Gaji" element={<DaftarGaji />}></Route>

        <Route
          path="hrd/cuti/riwayat/:id_user"
          element={<HrdKaryawanDetail />}
        />

        <Route path="SkemaManager" element={<SkemaManager />} />
        <Route path="SetJadwalKaryawan" element={<SetJadwalKaryawan />} />
        <Route path="HrdPayroll" element={<HrdPayroll />} />
        <Route path="riwayat-gaji/:id_user" element={<RiwayatGaji />} />

        {/* Menu Approval Tahap 1 (Atasan/User) */}
        <Route path="UserApproval" element={<UserApproval />} />
        <Route path="UserApprovalCuti" element={<UserApprovalCuti />} />
        <Route path="UserApprovalLembur" element={<UserApprovalLembur />} />
        <Route path="UserApprovalRiwayat" element={<UserApprovalRiwayat />} />

        {/* Menu Keuangan */}
        <Route path="Dashboard-Keuangan" element={<DashboardKeuangan />} />
        <Route path="Skemagaji" element={<Skemagaji />} />
      </Routes>
    </main>
  );
}

export default MainContent;
