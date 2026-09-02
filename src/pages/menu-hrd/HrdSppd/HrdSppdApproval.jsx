import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import HrdSppdTable from './components/HrdSppdTable';
import HrdSppdDetailModal from './components/HrdSppdDetailModal';
import HrdRabReviewModal from './components/HrdRabReviewModal';
import {
  getAllSppdHRD,
  getSppdDetailHRD,
  approveSppdHRD,
  approveCancelHRD,
  getRabBySppd,
  reviewRabHRD,
  getMasterKomponenActive,
} from './services/hrdSppdService';
import '../MasterKomponenRab/MasterKomponenRab.css';
import './HrdSppdApproval.css';

const HrdSppdApproval = () => {
  const [sppdList, setSppdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statusHrdFilter, setStatusHrdFilter] = useState('');

  // Modal States
  const [selectedSppd, setSelectedSppd] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedRab, setSelectedRab] = useState(null);
  const [showRabModal, setShowRabModal] = useState(false);
  const [masterKomponenList, setMasterKomponenList] = useState([]);

  const fetchSppd = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllSppdHRD();
      setSppdList(res.data || []);
    } catch (err) {
      console.error('Error fetching SPPD:', err);
      Swal.fire('Error', 'Gagal memuat data SPPD', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMasterKomponen = async () => {
    try {
      const res = await getMasterKomponenActive();
      setMasterKomponenList(res.data || []);
    } catch (err) {
      console.error('Error fetching active komponen:', err);
    }
  };

  useEffect(() => {
    fetchSppd();
    fetchMasterKomponen();
  }, [fetchSppd]);

  const handleViewDetail = async (id_sppd) => {
    try {
      const res = await getSppdDetailHRD(id_sppd);
      setSelectedSppd(res.data);
      setShowDetailModal(true);
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat detail SPPD', 'error');
    }
  };

  const handleApproveSppd = async (id_sppd) => {
    const result = await Swal.fire({
      title: 'Persetujuan SPPD',
      text: 'Apakah Anda yakin ingin menyetujui surat perjalanan dinas ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await approveSppdHRD(id_sppd, 'approved');
        Swal.fire({
          icon: 'success',
          title: 'Disetujui',
          text: 'SPPD berhasil disetujui dan diteruskan ke karyawan.',
          timer: 1500,
          showConfirmButton: false,
        });
        setShowDetailModal(false);
        fetchSppd();
      } catch (err) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menyetujui SPPD', 'error');
      }
    }
  };

  const handleRejectSppd = async (id_sppd) => {
    const { value: alasan } = await Swal.fire({
      title: 'Tolak SPPD & RAB',
      text: 'Harap masukkan alasan penolakan surat perjalanan dinas ini:',
      input: 'textarea',
      inputPlaceholder: 'Tuliskan alasan penolakan...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Tolak SPPD',
      cancelButtonText: 'Batal',
      inputValidator: (val) => {
        if (!val || !val.trim()) {
          return 'Alasan penolakan wajib diisi oleh HRD!';
        }
      },
    });

    if (alasan) {
      try {
        await approveSppdHRD(id_sppd, 'rejected', alasan);
        Swal.fire({
          icon: 'info',
          title: 'SPPD Ditolak',
          text: 'SPPD dan RAB telah ditolak.',
          timer: 1500,
          showConfirmButton: false,
        });
        setShowDetailModal(false);
        fetchSppd();
      } catch (err) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menolak SPPD', 'error');
      }
    }
  };

  const handleApproveCancel = async (id_sppd) => {
    const result = await Swal.fire({
      title: 'Setujui Pembatalan SPPD?',
      text: 'Permohonan pembatalan dari karyawan akan disetujui dan diteruskan ke Atasan untuk persetujuan akhir.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Setujui Pembatalan',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await approveCancelHRD(id_sppd, 'approved');
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Persetujuan pembatalan SPPD berhasil diteruskan ke Atasan.',
        timer: 1500,
        showConfirmButton: false,
      });
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memproses pembatalan', 'error');
    }
  };

  const handleRejectCancel = async (id_sppd) => {
    const result = await Swal.fire({
      title: 'Tolak Pembatalan SPPD?',
      text: 'Permohonan pembatalan SPPD dari karyawan akan ditolak.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Tolak Pembatalan',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await approveCancelHRD(id_sppd, 'rejected');
      Swal.fire({
        icon: 'info',
        title: 'Ditolak',
        text: 'Permohonan pembatalan SPPD telah ditolak.',
        timer: 1500,
        showConfirmButton: false,
      });
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memproses penolakan pembatalan', 'error');
    }
  };

  const handleReviewRab = async (id_sppd) => {
    try {
      const res = await getRabBySppd(id_sppd);
      setSelectedRab(res.data);
      setShowRabModal(true);
    } catch (err) {
      Swal.fire('Info', 'RAB belum tersedia untuk SPPD ini', 'info');
    }
  };

  const handleReviewRabSubmit = async (id_rab, catatan) => {
    try {
      await reviewRabHRD(id_rab, catatan);
      Swal.fire({
        icon: 'success',
        title: 'RAB & SPPD Disetujui',
        text: 'RAB dan SPPD berhasil disetujui secara final.',
        timer: 1800,
        showConfirmButton: false,
      });
      setShowRabModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memproses persetujuan RAB', 'error');
    }
  };

  const filteredData = useMemo(() => {
    return (sppdList || []).filter((item) => {
      const matchSearch =
        (item.nomor_sppd || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nama_karyawan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.alamat_tujuan || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? item.status_sppd === statusFilter : true;
      const matchStatusHrd = statusHrdFilter ? item.status_hrd === statusHrdFilter : true;
      return matchSearch && matchStatus && matchStatusHrd;
    });
  }, [sppdList, searchTerm, statusFilter, statusHrdFilter]);

  return (
    <div className="hrd-page-container">
      <div className="hrd-card">
        {/* Header */}
        <div className="hrd-page-header">
          <div>
            <h2>Approval SPPD & RAB (HRD)</h2>
            <p>Verifikasi penugasan perjalanan dinas dan sesuaikan rincian anggaran biaya (RAB)</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="hrd-filter-bar">
          <div className="filter-group search-group">
            <label>Cari SPPD:</label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Ketik nomor SPPD, karyawan, tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group select-group">
            <label>Approval HRD:</label>
            <select
              className="form-control-clean"
              value={statusHrdFilter}
              onChange={(e) => setStatusHrdFilter(e.target.value)}
            >
              <option value="">Semua Approval HRD</option>
              <option value="pending">Pending HRD</option>
              <option value="approved">Approved HRD</option>
              <option value="rejected">Rejected HRD</option>
            </select>
          </div>

          <div className="filter-group select-group">
            <label>Status SPPD:</label>
            <select
              className="form-control-clean"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status SPPD</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <HrdSppdTable
          data={filteredData}
          onViewDetail={handleViewDetail}
          onReviewRab={handleReviewRab}
          onApproveCancel={handleApproveCancel}
          onRejectCancel={handleRejectCancel}
          loading={loading}
        />
      </div>

      <HrdSppdDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sppd={selectedSppd}
        onApprove={handleApproveSppd}
        onReject={handleRejectSppd}
        onApproveCancel={handleApproveCancel}
        onRejectCancel={handleRejectCancel}
      />

      <HrdRabReviewModal
        show={showRabModal}
        onClose={() => setShowRabModal(false)}
        rab={selectedRab}
        masterKomponenList={masterKomponenList}
        onReviewSubmit={handleReviewRabSubmit}
      />
    </div>
  );
};

export default HrdSppdApproval;
