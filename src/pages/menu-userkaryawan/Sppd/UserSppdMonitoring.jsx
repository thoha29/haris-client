import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import UserSppdTable from './components/UserSppdTable';
import UserSppdDetailModal from './components/UserSppdDetailModal';
import UserRabReviewModal from './components/UserRabReviewModal';
import {
  getSppdListUser,
  getSppdDetailUser,
  getRabBySppd,
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

  const handleApproveCancel = async (id_sppd) => {
    try {
      await approveCancelAtasan(id_sppd, 'approved');
      Swal.fire('Berhasil', 'Pembatalan SPPD telah disetujui.', 'success');
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', 'Gagal menyetujui pembatalan', 'error');
    }
  };

  const handleRejectCancel = async (id_sppd) => {
    try {
      await approveCancelAtasan(id_sppd, 'rejected');
      Swal.fire('Ditolak', 'Permohonan pembatalan ditolak.', 'info');
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', 'Gagal memproses penolakan', 'error');
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
            <h2>Monitoring SPPD & Approval Final RAB</h2>
            <p>Pantau status perjalanan dinas tim dan lakukan persetujuan akhir Rencana Anggaran Biaya (RAB)</p>
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
        <UserSppdTable
          data={filteredData}
          onViewDetail={handleViewDetail}
          onReviewRab={handleReviewRab}
          loading={loading}
        />
      </div>

      <UserSppdDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sppd={selectedSppd}
        onApproveCancel={handleApproveCancel}
        onRejectCancel={handleRejectCancel}
      />

      <UserRabReviewModal
        show={showRabModal}
        onClose={() => setShowRabModal(false)}
        rab={selectedRab}
      />
    </div>
  );
};

export default UserSppdMonitoring;
