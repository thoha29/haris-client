import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  getDinasTodayStatus,
  postCheckInDinas,
  getDinasAbsensiHistory,
} from '../services/dinasService';

const DinasAbsensiPanel = ({ userId }) => {
  const [statusToday, setStatusToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchStatusAndHistory = useCallback(async () => {
    try {
      setLoading(true);
      const [resToday, resHistory] = await Promise.all([
        getDinasTodayStatus(userId),
        getDinasAbsensiHistory(userId),
      ]);
      setStatusToday(resToday.data);
      setHistory(resHistory.data || []);
    } catch (err) {
      console.error('Error fetching dinas absensi:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchStatusAndHistory();
    }
  }, [userId, fetchStatusAndHistory]);

  const handleCheckIn = async () => {
    let latitude = null;
    let longitude = null;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch (e) {
        console.warn('Geolocation not available or denied:', e);
      }
    }

    try {
      setSubmitting(true);
      await postCheckInDinas({
        id_user: userId,
        latitude,
        longitude,
        lokasi_absensi: statusToday?.sppd?.alamat_tujuan || 'Lokasi Dinas',
      });

      Swal.fire({
        icon: 'success',
        title: 'Check-In Berhasil',
        text: 'Presensi harian dinas Anda telah tercatat (tanpa perlu clock-out).',
        timer: 2000,
        showConfirmButton: false,
      });

      fetchStatusAndHistory();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal melakukan check-in dinas', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dinas-absensi-box text-center py-3">
        <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
        <span className="ms-2 small text-muted">Memeriksa status penugasan dinas hari ini...</span>
      </div>
    );
  }

  const hasActiveDinas = statusToday?.hasActiveDinas;
  const hasCheckedIn = statusToday?.hasCheckedIn;
  const absensiToday = statusToday?.absensiToday;
  const sppd = statusToday?.sppd;

  return (
    <div className="dinas-absensi-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3>Presensi Harian Perjalanan Dinas</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            Check-in harian selama masa dinas aktif (sistem satu kali presensi per hari, tanpa clock-out).
          </p>
        </div>
        <div style={{ backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#1f4e78' }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {hasActiveDinas ? (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <div style={{ fontWeight: '700', color: '#0f5132', marginBottom: '4px' }}>
                Penugasan Dinas Aktif Hari Ini
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', marginBottom: '2px' }}>
                <strong>No. SPPD:</strong> <span style={{ fontFamily: 'monospace' }}>{sppd.nomor_sppd}</span> | <strong>Tujuan:</strong> {sppd.alamat_tujuan}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                <strong>Periode:</strong> {sppd.tanggal_mulai} s/d {sppd.tanggal_selesai}
              </div>
            </div>

            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              {hasCheckedIn ? (
                <div style={{ display: 'inline-block', textAlign: 'center', background: '#d1e7dd', border: '1px solid #badbcc', padding: '8px 16px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '700', color: '#0f5132', fontSize: '0.88rem' }}>SUDAH CHECK-IN</div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{absensiToday?.jam_masuk} WIB</div>
                  <small style={{ color: '#0f5132', fontSize: '0.75rem' }}>Presensi dinas tercatat</small>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-success-custom"
                  style={{ padding: '10px 22px', fontSize: '0.92rem' }}
                  onClick={handleCheckIn}
                  disabled={submitting}
                >
                  {submitting ? 'Memproses...' : 'Check-In Dinas Hari Ini'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '10px', color: '#64748b', fontSize: '0.88rem', background: '#f8fafc', borderRadius: '6px' }}>
          Tidak ada surat perjalanan dinas yang aktif untuk hari ini.
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Riwayat Presensi Dinas Terakhir
          </div>
          <div className="table-responsive">
            <table className="hrd-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jam Check-In</th>
                  <th>No. SPPD & Tujuan</th>
                  <th>Lokasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.tanggal}</td>
                    <td style={{ fontWeight: '700', color: '#0f5132' }}>{row.jam_masuk}</td>
                    <td>{row.nomor_sppd ? `${row.nomor_sppd} (${row.alamat_tujuan})` : '-'}</td>
                    <td>{row.lokasi_absensi || '-'}</td>
                    <td><span className="badge-status approved">Hadir</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DinasAbsensiPanel;
