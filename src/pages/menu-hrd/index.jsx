//Dashboard
import DashboardHRD from './Dashboard/dashboard';

//Karyawan
import DataKaryawan from '../menu-pimpinan/DataKaryawan';
import TambahDataPribadi from './Karyawan/TambahDataPribadi';
import ListKaryawanView from './Karyawan/ListKaryawanView';

//absensi
import HrdApproval from './Absensi/HrdApproval';
import HrdMonitoring from './Absensi/HrdMonitoring';
import HrdKaryawanDetail from './Absensi/HrdKaryawanDetail';
import ProsesAbsensi from './Absensi/ProsesAbsensi';

//Cuti
import HrdApprovalCuti from './Cuti/HrdApprovalCuti';
import HrdRiwayatCuti from './Cuti/HrdCutiHistory';
import HrdCutiRiwayatDetail from './Cuti/HrdCutiRiwayatDetail';
import HrdRiwayatPengajuanCuti from './Cuti/HrdRiwayatPengajuanCuti';

import DaftarGaji from './DaftarGaji/DaftarGaji';

// SPPD, Master & Settings
import MasterKomponenRab from './MasterKomponenRab';
import MasterTransportasi from './MasterTransportasi';
import PengaturanSkema from './PengaturanSkema';
import HrdSppdApproval from './HrdSppd';
import MasterSkemaGajiHRD from './MasterSkemaGaji/MasterSkemaGaji';
import { MasterPTKP } from './MasterPTKP/MasterPTKP';

export {
  DashboardHRD,
  DataKaryawan,
  HrdApproval,
  HrdMonitoring,
  HrdApprovalCuti,
  TambahDataPribadi,
  ListKaryawanView,
  HrdKaryawanDetail,
  HrdRiwayatCuti,
  HrdCutiRiwayatDetail,
  HrdRiwayatPengajuanCuti,
  ProsesAbsensi,
  DaftarGaji,
  MasterKomponenRab,
  MasterTransportasi,
  PengaturanSkema,
  HrdSppdApproval,
  MasterSkemaGajiHRD,
  MasterPTKP,
};
