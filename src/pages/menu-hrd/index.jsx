//Dashboard
import DashboardHRD from './Dashboard/dashboard';

//Karyawan
import DataKaryawan from '../menu-pimpinan/DataKaryawan';
import TambahDataPribadi from './Karyawan/TambahDataPribadi';

//absensi
import HrdApproval from './Absensi/HrdApproval';
import HrdMonitoring from './Absensi/HrdMonitoring';
import HrdKaryawanDetail from './Absensi/HrdKaryawanDetail';
import ProsesAbsensi from './Absensi/ProsesAbsensi';

//Cuti
import HrdApprovalCuti from './Cuti/HrdApprovalCuti';
import HrdRiwayatCuti from './Cuti/HrdCutiHistory';
import HrdCutiRiwayatDetail from './Cuti/HrdCutiRiwayatDetail';

//Skema Manager
// Moved to menu-userkaryawan

export {
  DashboardHRD,
  DataKaryawan,
  HrdApproval,
  HrdMonitoring,
  HrdApprovalCuti,
  TambahDataPribadi,
  HrdKaryawanDetail,
  HrdRiwayatCuti,
  HrdCutiRiwayatDetail,
  ProsesAbsensi,
};
