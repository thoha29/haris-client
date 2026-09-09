import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import UserSppdTable from './components/UserSppdTable';
import UserSppdDetailModal from './components/UserSppdDetailModal';
import UserRabReviewModal from './components/UserRabReviewModal';
import {
  getSppdListUser,
  getSppdDetailUser,
  getRabBySppd,
  approveSppdAtasan,
  cancelSppdAtasan,
  reviewRabAtasan,
  approveCancelAtasan,
} from './services/userSppdService';
import './UserSppd.css';

const UserSppdMonitoring = () => {
  const [sppdList, setSppdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [selectedSppd, setSelectedSppd] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedRab, setSelectedRab] = useState(null);
  const [showRabModal, setShowRabModal] = useState(false);

  const fetchSppd = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSppdListUser();
      setSppdList(res.data || []);
    } catch (err) {
      console.error('Error fetching SPPD:', err);
      Swal.fire('Error', 'Gagal memuat daftar SPPD', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSppd();
  }, [fetchSppd]);

  const handleViewDetail = async (id_sppd) => {
    try {
      const res = await getSppdDetailUser(id_sppd);
      setSelectedSppd(res.data);
      setShowDetailModal(true);
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat detail SPPD', 'error');
    }
  };

  // ─── ATASAN: APPROVE SPPD ────────────────────────────────────────────────
  const handleApproveSppd = async (id_sppd) => {
    const result = await Swal.fire({
      title: 'Setujui SPPD?',
      text: 'SPPD akan disetujui. Setelah ini, Anda dapat meninjau rincian biaya (RAB).',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Setujui SPPD',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await approveSppdAtasan(id_sppd, 'approved');
      Swal.fire('Berhasil', 'SPPD berhasil disetujui! Silakan lanjutkan review RAB.', 'success');
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menyetujui SPPD', 'error');
    }
  };

  // ─── ATASAN: TOLAK SPPD ──────────────────────────────────────────────────
  const handleRejectSppd = async (id_sppd) => {
    const { value: catatan } = await Swal.fire({
      title: 'Tolak SPPD',
      input: 'textarea',
      inputLabel: 'Alasan Penolakan SPPD (Wajib Diisi):',
      inputPlaceholder: 'Tuliskan alasan penolakan secara jelas...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Tolak SPPD & RAB',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan penolakan wajib diisi!';
        }
      },
    });

    if (!catatan) return;

    try {
      await approveSppdAtasan(id_sppd, 'rejected', catatan);
      Swal.fire('Ditolak', 'SPPD dan RAB terkait telah ditolak.', 'info');
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menolak SPPD', 'error');
    }
  };

  // ─── ATASAN: BATALKAN SPPD ───────────────────────────────────────────────
  const handleCancelSppd = async (id_sppd) => {
    const result = await Swal.fire({
      title: 'Batalkan SPPD & RAB?',
      text: 'SPPD dan RAB akan dibatalkan (status menjadi Cancelled) dan kendaraan perusahaan (jika ada) akan dibebaskan kembali.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#991b1b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Batalkan SPPD',
      cancelButtonText: 'Kembali',
    });

    if (!result.isConfirmed) return;

    try {
      await cancelSppdAtasan(id_sppd);
      Swal.fire('Dibatalkan', 'SPPD dan RAB telah berhasil dibatalkan.', 'success');
      setShowDetailModal(false);
      setShowRabModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal membatalkan SPPD', 'error');
    }
  };

  // ─── ATASAN: REVIEW RAB ──────────────────────────────────────────────────
  const handleReviewRab = async (id_sppd) => {
    try {
      const res = await getRabBySppd(id_sppd);
      setSelectedRab(res.data);
      setShowRabModal(true);
    } catch (err) {
      Swal.fire('Info', 'RAB belum tersedia untuk SPPD ini', 'info');
    }
  };

  // ─── ATASAN: APPROVE RAB (teruskan ke HRD) ──────────────────────────────
  const handleApproveRab = async (id_rab) => {
    const result = await Swal.fire({
      title: 'Setujui RAB & Teruskan ke HRD?',
      text: 'RAB akan diteruskan ke HRD untuk verifikasi dan penyesuaian nominal akhir.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Teruskan ke HRD',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await reviewRabAtasan(id_rab, 'approve');
      Swal.fire('Berhasil', 'RAB berhasil disetujui dan diteruskan ke HRD.', 'success');
      setShowRabModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menyetujui RAB', 'error');
    }
  };

  // ─── ATASAN: MINTA REVISI RAB ───────────────────────────────────────────
  const handleRequestRevisiRab = async (id_rab) => {
    const { value: catatan } = await Swal.fire({
      title: 'Minta Revisi RAB',
      input: 'textarea',
      inputLabel: 'Catatan Revisi untuk Karyawan (Wajib Diisi):',
      inputPlaceholder: 'Tuliskan catatan perbaikan rincian biaya yang perlu disesuaikan...',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Kirim Catatan Revisi',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Catatan revisi wajib diisi!';
        }
      },
    });

    if (!catatan) return;

    try {
      await reviewRabAtasan(id_rab, 'revisi', catatan);
      Swal.fire('Terkirim', 'RAB telah dikembalikan ke karyawan dengan status revisi_atasan.', 'info');
      setShowRabModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal meminta revisi RAB', 'error');
    }
  };

  // ─── CANCEL APPROVAL DARI KARYAWAN REQUEST ──────────────────────────────
  const handleApproveCancel = async (id_sppd) => {
    const result = await Swal.fire({
      title: 'Setujui Pembatalan SPPD?',
      text: 'SPPD akan dibatalkan secara final (status Cancelled), kendaraan (jika ada) akan dibebaskan kembali, dan jadwal kerja akan dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Setujui Pembatalan',
      cancelButtonText: 'Kembali',
    });

    if (!result.isConfirmed) return;

    try {
      await approveCancelAtasan(id_sppd, 'approved');
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Pembatalan SPPD telah disetujui.',
        timer: 1500,
        showConfirmButton: false,
      });
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menyetujui pembatalan', 'error');
    }
  };

  const handleRejectCancel = async (id_sppd) => {
    const result = await Swal.fire({
      title: 'Tolak Pembatalan SPPD?',
      text: 'Permohonan pembatalan SPPD dari karyawan akan ditolak.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Tolak Pembatalan',
      cancelButtonText: 'Kembali',
    });

    if (!result.isConfirmed) return;

    try {
      await approveCancelAtasan(id_sppd, 'rejected');
      Swal.fire({
        icon: 'info',
        title: 'Ditolak',
        text: 'Permohonan pembatalan ditolak.',
        timer: 1500,
        showConfirmButton: false,
      });
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal memproses penolakan', 'error');
    }
  };

  const filteredData = useMemo(() => {
    return (sppdList || []).filter((item) => {
      const matchSearch =
        (item.nomor_sppd || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nama_karyawan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.alamat_tujuan || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? item.status_sppd === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [sppdList, searchTerm, statusFilter]);

  return (
    <div className="sppd-page-container">
      <div className="sppd-card">
        {/* Header */}
        <div className="sppd-page-header">
          <div>
            <h2>Persetujuan & Monitoring Perjalanan Dinas (SPPD)</h2>
            <p>Tinjau pengajuan SPPD & RAB dari tim, berikan persetujuan atau catatan revisi</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="sppd-filter-bar">
          <div className="filter-group search-group">
            <label>Cari SPPD:</label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Ketik nomor SPPD, nama karyawan, tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group select-group">
            <label>Filter Status SPPD:</label>
            <select
              className="form-control-clean"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status SPPD</option>
              <option value="pending_atasan">Menunggu Persetujuan Atasan</option>
              <option value="approved_atasan">Disetujui Atasan</option>
              <option value="approved">Disetujui HRD</option>
              <option value="active">Active (Sedang Dinas)</option>
              <option value="completed">Completed (Selesai)</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <UserSppdTable
          data={filteredData}
          onViewDetail={handleViewDetail}
          onReviewRab={handleReviewRab}
          onApproveCancel={handleApproveCancel}
          onRejectCancel={handleRejectCancel}
          loading={loading}
        />
      </div>

      <UserSppdDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sppd={selectedSppd}
        onApproveSppd={handleApproveSppd}
        onRejectSppd={handleRejectSppd}
        onCancelSppd={handleCancelSppd}
        onReviewRab={handleReviewRab}
        onApproveCancel={handleApproveCancel}
        onRejectCancel={handleRejectCancel}
      />

      <UserRabReviewModal
        show={showRabModal}
        onClose={() => setShowRabModal(false)}
        rab={selectedRab}
        onApproveRab={handleApproveRab}
        onRequestRevisi={handleRequestRevisiRab}
        onCancelSppd={handleCancelSppd}
      />
    </div>
  );
};

export default UserSppdMonitoring;

