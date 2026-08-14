import React, { useState, useEffect } from 'react';
import './RiwayatPengajuan.css';
import api from '../../../config/api';

const RiwayatPengajuan = () => {
  const [listCuti, setListCuti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/cuti/status/${userId}`);
        setListCuti(res.data);
      } catch (err) {
        console.error('Gagal mengambil riwayat:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const renderStatusDetail = (item) => {
    const sFinal = (item.status || 'pending').toLowerCase();
    const sUser = (item.status_user || 'pending').toLowerCase();
    const sHrd = (item.status_hrd || 'pending').toLowerCase();

    if (sUser === 'rejected') {
      return (
        <div className="status-cell">
          <span className="status-badge rejected">
            <i className="bi bi-x-circle me-1"></i> DITOLAK ATASAN
          </span>
          <span className="status-subtext text-danger">Ditolak oleh Atasan Langsung</span>
        </div>
      );
    }

    if (sHrd === 'rejected') {
      return (
        <div className="status-cell">
          <span className="status-badge rejected">
            <i className="bi bi-x-circle me-1"></i> DITOLAK HRD
          </span>
          <span className="status-subtext text-danger">Ditolak oleh HRD</span>
        </div>
      );
    }

    if (sHrd === 'approved' || sFinal === 'approved') {
      return (
        <div className="status-cell">
          <span className="status-badge approved">
            <i className="bi bi-check-circle me-1"></i> DISETUJUI (APPROVED)
          </span>
          <span className="status-subtext text-success">Disetujui Atasan & HRD</span>
        </div>
      );
    }

    if (sUser === 'pending') {
      return (
        <div className="status-cell">
          <span className="status-badge pending-user">
            <i className="bi bi-hourglass-split me-1"></i> PENDING ATASAN
          </span>
          <span className="status-subtext text-warning">Menunggu approval Atasan</span>
        </div>
      );
    }

    if (sUser === 'approved' && sHrd === 'pending') {
      return (
        <div className="status-cell">
          <span className="status-badge pending-hrd">
            <i className="bi bi-clock-history me-1"></i> PENDING HRD
          </span>
          <span className="status-subtext text-info">Disetujui Atasan, menunggu HRD</span>
        </div>
      );
    }

    return (
      <div className="status-cell">
        <span className={`status-badge ${sFinal}`}>
          {sFinal.toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="riwayat-container">
      <div className="riwayat-card">
        <div className="riwayat-header">
          <h2>Riwayat Pengajuan Cuti & Izin</h2>
          <p>Pantau status permohonan ijin dan cuti Anda secara real-time.</p>
        </div>

        <div className="table-wrapper">
          <table className="elite-table">
            <thead>
              <tr>
                <th>Tanggal Pengajuan</th>
                <th>Tipe</th>
                <th>Periode Cuti</th>
                <th>Alasan</th>
                <th>Status Pengajuan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : listCuti.length > 0 ? (
                listCuti.map((item) => (
                  <tr key={item.id_cuti}>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <span className="tipe-cuti-badge">
                        {item.tipe || 'Cuti'}
                      </span>
                    </td>
                    <td>
                      <strong>{formatDate(item.tanggal_mulai)}</strong> s/d <strong>{formatDate(item.tanggal_selesai)}</strong>
                    </td>
                    <td>{item.alasan}</td>
                    <td>{renderStatusDetail(item)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    🚫 Belum ada riwayat pengajuan cuti/izin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatPengajuan;
