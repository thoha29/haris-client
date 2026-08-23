import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import DinasSppdCard from './components/DinasSppdCard';
import DinasSppdDetailModal from './components/DinasSppdDetailModal';
import RabDetailViewModal from './components/RabDetailViewModal';
import DinasAbsensiPanel from './components/DinasAbsensiPanel';
import {
  getMySppdList,
  getSppdDetail,
  requestCancelSppd,
  getRabBySppd,
} from './services/dinasService';
import './DinasKaryawan.css';

const DinasKaryawan = () => {
  const currentUserId = localStorage.getItem('userId');

  const [sppdList, setSppdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedSppd, setSelectedSppd] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showRabViewModal, setShowRabViewModal] = useState(false);
  const [selectedRab, setSelectedRab] = useState(null);

  const fetchSppd = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMySppdList();
      setSppdList(res.data || []);
    } catch (err) {
      console.error('Error fetching SPPD:', err);
      Swal.fire('Error', 'Gagal memuat daftar perjalanan dinas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSppd();
  }, [fetchSppd]);

  const handleViewDetail = async (id_sppd) => {
    try {
      const res = await getSppdDetail(id_sppd);
      setSelectedSppd(res.data);
      setShowDetailModal(true);
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat detail SPPD', 'error');
    }
  };

  const handleCancelRequest = async (id_sppd, alasan) => {
    try {
      await requestCancelSppd(id_sppd, alasan);
      Swal.fire('Terkirim', 'Permohonan pembatalan SPPD berhasil dikirim ke HRD & Atasan.', 'success');
      setShowDetailModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal mengajukan pembatalan', 'error');
    }
  };

  const handleViewRab = async (id_sppd) => {
    try {
      const res = await getRabBySppd(id_sppd);
      setSelectedRab(res.data);
      setShowDetailModal(false);
      setShowRabViewModal(true);
    } catch (err) {
      Swal.fire('Info', 'RAB belum tersedia untuk tugas dinas ini', 'info');
    }
  };

  const filteredSppd = useMemo(() => {
    return (sppdList || []).filter((item) => {
      return (
        (item.nomor_sppd || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.alamat_tujuan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tugas || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [sppdList, searchTerm]);

  return (
    <div className="dinas-page-container">
      {/* Attendance Panel on top */}
      <DinasAbsensiPanel userId={currentUserId} />

      <div className="dinas-card">
        {/* Header */}
        <div className="dinas-page-header">
          <div>
            <h2>Penugasan Perjalanan Dinas (SPPD) & RAB</h2>
            <p>
              Informasi surat perjalanan dinas dan rincian anggaran biaya yang telah diterbitkan untuk Anda
            </p>
          </div>

          <div style={{ maxWidth: '320px', width: '100%' }}>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Cari nomor SPPD / tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Memuat daftar tugas dinas...</p>
          </div>
        ) : filteredSppd.length === 0 ? (
          <div className="text-center py-5 text-muted bg-light rounded border">
            <div className="fw-semibold mb-1">Belum ada penugasan perjalanan dinas untuk Anda.</div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredSppd.map((sppd) => (
              <div className="col-lg-4 col-md-6" key={sppd.id_sppd}>
                <DinasSppdCard
                  sppd={sppd}
                  onViewDetail={handleViewDetail}
                  onViewRab={handleViewRab}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <DinasSppdDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sppd={selectedSppd}
        onCancelRequest={handleCancelRequest}
        onViewRab={handleViewRab}
      />

      <RabDetailViewModal
        show={showRabViewModal}
        onClose={() => setShowRabViewModal(false)}
        rab={selectedRab}
      />
    </div>
  );
};

export default DinasKaryawan;
