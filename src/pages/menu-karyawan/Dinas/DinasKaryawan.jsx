import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DinasSppdCard from './components/DinasSppdCard';
import DinasSppdDetailModal from './components/DinasSppdDetailModal';
import RabDetailViewModal from './components/RabDetailViewModal';
import RabFormModal from './components/RabFormModal';
import DinasAbsensiPanel from './components/DinasAbsensiPanel';
import {
  getMySppdList,
  getSppdDetail,
  requestCancelSppd,
  getRabBySppd,
  submitRab,
} from './services/dinasService';
import './DinasKaryawan.css';

const DinasKaryawan = () => {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');


  const [sppdList, setSppdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedSppd, setSelectedSppd] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showRabViewModal, setShowRabViewModal] = useState(false);
  const [selectedRab, setSelectedRab] = useState(null);

  // Form RAB (submit baru atau revisi)
  const [showRabFormModal, setShowRabFormModal] = useState(false);
  const [rabFormSppdId, setRabFormSppdId] = useState(null);
  const [rabFormExistingData, setRabFormExistingData] = useState(null);
  const [selectedSppdForRab, setSelectedSppdForRab] = useState(null);

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

  // Karyawan submit atau revisi RAB
  const handleOpenRabForm = async (id_sppd) => {
    try {
      const [resSppd, resRab] = await Promise.allSettled([
        getSppdDetail(id_sppd),
        getRabBySppd(id_sppd),
      ]);

      const sppdData = resSppd.status === 'fulfilled' ? resSppd.value?.data : null;
      const rabData = resRab.status === 'fulfilled' ? resRab.value?.data : null;

      setSelectedSppdForRab(sppdData);
      setRabFormExistingData(rabData);
      setRabFormSppdId(id_sppd);
      setShowDetailModal(false);
      setShowRabViewModal(false);
      setShowRabFormModal(true);
    } catch (err) {
      console.error('Error opening RAB form:', err);
      Swal.fire('Error', 'Gagal membuka formulir revisi RAB', 'error');
    }
  };

  const handleSubmitRab = async (id_sppd, details) => {
    try {
      await submitRab(id_sppd, details);
      Swal.fire('Berhasil', 'RAB berhasil diajukan ke atasan untuk disetujui!', 'success');
      setShowRabFormModal(false);
      fetchSppd();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal mengajukan RAB', 'error');
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
            <h2>Perjalanan Dinas Saya</h2>
            <p>
              Daftar SPPD dan RAB yang Anda ajukan. Klik tombol + untuk mengajukan SPPD baru.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Cari nomor SPPD / tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '260px' }}
            />
            <button
              className="btn-primary"
              onClick={() => navigate('/PengajuanSppd')}
              title="Ajukan SPPD Baru"
            >
              <i className="bi bi-plus-lg me-1"></i> Ajukan SPPD
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Memuat daftar tugas dinas...</p>
          </div>
        ) : filteredSppd.length === 0 ? (
          <div className="text-center py-5 text-muted bg-light rounded border">
            <div className="fw-semibold mb-1">Belum ada perjalanan dinas.</div>
            <p className="small">Klik <strong>Ajukan SPPD</strong> untuk membuat pengajuan baru.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredSppd.map((sppd) => (
              <div className="col-lg-4 col-md-6" key={sppd.id_sppd}>
                <DinasSppdCard
                  sppd={sppd}
                  onViewDetail={handleViewDetail}
                  onViewRab={handleViewRab}
                  onSubmitRab={handleOpenRabForm}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form submit/revisi RAB */}
      {showRabFormModal && (
        <RabFormModal
          show={showRabFormModal}
          onClose={() => setShowRabFormModal(false)}
          sppd={selectedSppdForRab}
          idSppd={rabFormSppdId}
          existingRab={rabFormExistingData}
          onSubmit={handleSubmitRab}
          onSubmitRab={handleSubmitRab}
          isRevisi={rabFormExistingData?.status === 'revisi_atasan'}
        />
      )}

      <DinasSppdDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sppd={selectedSppd}
        onCancelRequest={handleCancelRequest}
        onViewRab={handleViewRab}
        onSubmitRab={handleOpenRabForm}
      />

      <RabDetailViewModal
        show={showRabViewModal}
        onClose={() => setShowRabViewModal(false)}
        rab={selectedRab}
        onEditRab={handleOpenRabForm}
      />
    </div>
  );
};

export default DinasKaryawan;
