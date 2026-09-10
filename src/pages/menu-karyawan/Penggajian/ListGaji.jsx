import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import SlipGajiView from '../../../components/SlipGajiView';
import './SlipGaji.css';

export const ListGaji = () => {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  // Ambil data dari localStorage
  const id_user = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchRiwayat = async () => {
      if (!id_user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/api/gaji/gaji-karyawan/${id_user}`);
        setRiwayat(res.data?.data || []);
      } catch (err) {
        console.error('Gagal ambil riwayat gaji:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, [id_user]);

  const handleDownloadExcel = async (id_user, nama) => {
    try {
      setDownloadingId(id_user);
      const response = await api.get(`/api/gaji/export-slip-excel/${id_user}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      const safeName = (nama || 'slip').replace(/\s+/g, '_');
      link.setAttribute('download', `Slip_Gaji_${safeName}_${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download slip Excel error:', err);
      alert('Gagal mengunduh file Excel slip gaji');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!id_user && !loading) {
    return (
      <div className="history-page-wrapper">
        <div
          className="error-box"
          style={{ textAlign: 'center', marginTop: '50px' }}
        >
          <h2>Sesi Berakhir</h2>
          <p>Silakan login kembali untuk melihat data gaji.</p>
          <button onClick={() => navigate('/login')} className="btn-print">
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page-wrapper">
      {/* ── Header ── */}
      <div className="history-header-simple">
        <h1>Slip Gaji Digital</h1>
        <p>
          Halo, <strong>{username}</strong>! Berikut adalah data slip gaji Anda.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Memuat...</span>
          </div>
          <p className="mt-3" style={{ color: '#666' }}>
            Sedang memuat data slip gaji...
          </p>
        </div>
      ) : riwayat.length === 0 ? (
        <div
          style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ marginBottom: '16px', opacity: 0.4 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
            />
          </svg>
          <p>Gaji belum diproses oleh HRD.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            padding: '0 0 40px',
          }}
        >
          {riwayat.map((item, index) => (
            <div key={item.id || index}>
              {/* Label urutan */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  padding: '0 4px',
                }}
              >
                <span
                  style={{
                    background: '#1f3864',
                    color: '#fff',
                    borderRadius: '20px',
                    padding: '4px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '0.3px',
                  }}
                >
                  Data Gaji #{index + 1}
                </span>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    background: downloadingId === item.id ? '#aaa' : '#217346',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor:
                      downloadingId === item.id ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                  disabled={!!downloadingId}
                  onClick={() =>
                    handleDownloadExcel(item.id, item.nama_lengkap || item.nama)
                  }
                >
                  {downloadingId === item.id ? (
                    <>⏳ Mengunduh...</>
                  ) : (
                    <>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      </svg>
                      Download Excel
                    </>
                  )}
                </button>
              </div>
              {/* Slip Component */}
              <SlipGajiView data={item} showDownload={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListGaji;
