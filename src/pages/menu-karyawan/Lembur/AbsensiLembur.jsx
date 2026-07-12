import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import './Lembur.css';
import api from '../../../config/api';

const AbsensiLembur = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [riwayatSingkat, setRiwayatSingkat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false);
  const [lokasi, setLokasi] = useState(null);
  const [jenisLembur, setJenisLembur] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('access_token');
  const username = localStorage.getItem('username') || 'Karyawan';
  const role = (localStorage.getItem('role') || 'karyawan')
    .toLowerCase()
    .trim();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toTimeString().split(' ')[0];

  const formatDate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Browser tidak mendukung GPS');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error.message),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const fetchTodayStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await api.get(`/absensi-lembur/riwayat/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRiwayatSingkat(res.data.slice(0, 5));

      // 🔥 cari lembur yang masih aktif (BELUM checkout)
      const activeLembur = res.data.find((item) => !item.jam_keluar);

      if (activeLembur) {
        // ✅ sudah checkin (walaupun beda hari)
        setHasCheckedInToday(true);
        setHasCheckedOutToday(false);

        // lock jenis lembur
        if (activeLembur.id_skema !== undefined) {
          setJenisLembur(String(activeLembur.id_skema));
        }
      } else {
        // ✅ tidak ada lembur aktif
        setHasCheckedInToday(false);
        setHasCheckedOutToday(false);
      }
    } catch (err) {
      console.error('Gagal load riwayat.');
    }
  }, [userId, token]);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  const handleAbsen = async (type) => {
    if (!userId) {
      Swal.fire('Akses Ditolak', 'Silakan login ulang!', 'error');
      return;
    }

    if (!jenisLembur && type === 'in') {
      return Swal.fire(
        'Peringatan',
        'Pilih jenis waktu lembur terlebih dahulu!',
        'warning'
      );
    }

    setLoading(true);

    try {
      const locationData = await getLocation();
      setLokasi(locationData);

      const payload = {
        id_user: userId,
        role: role,
        id_skema: jenisLembur, // ⬅️ selalu dikirim (IN & OUT)

        lokasi_absensi: 'GPS Aktif',
        latitude: locationData.latitude,
        longitude: locationData.longitude,

        ...(type === 'in'
          ? { tanggal: formatDate(currentTime) }
          : { tanggal_keluar: formatDate(currentTime) }),

        ...(type === 'in'
          ? { jam_masuk: formatTime(currentTime) }
          : { jam_keluar: formatTime(currentTime) }),
      };

      const url =
        type === 'in' ? '/absensi-lembur/checkin' : '/absensi-lembur/checkout';

      const response = await api({
        method: type === 'in' ? 'post' : 'put',
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
      setMessageType('success');

      fetchTodayStatus();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error || error.message || 'Gagal absen!'
      );

      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getJenisBadge = (id) => {
    if (id === 0 || id === '0') return 'badge bg-success'; // hari kerja
    if (id === 1 || id === '1') return 'badge bg-primary'; // hari libur
    return 'badge bg-secondary';
  };

  const getJenisLabel = (id) => {
    if (id === 0 || id === '0') return 'Hari Kerja';
    if (id === 1 || id === '1') return 'Hari Libur';
    return '-';
  };

  return (
    <div className="absensi-container">
      {' '}
      <div className="absensi-card">
        {' '}
        <div className="header">
          {' '}
          <h1>Halo, {username}!</h1>{' '}
          <p className="subtitle">PT. Banggai Sentral Sulawesi</p>{' '}
          <span className="role-indicator">Akses: {role.toUpperCase()}</span>{' '}
        </div>
        <div className="clock-display">
          <div className="date">
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="time">{formatTime(currentTime)}</div>

          {lokasi && (
            <div className="lokasi-text">
              📍 {lokasi.latitude.toFixed(6)}, {lokasi.longitude.toFixed(6)}
            </div>
          )}

          <div className="mt-3">
            <label className="form-label">Jenis Waktu Lembur</label>
            <select
              value={jenisLembur}
              onChange={(e) => setJenisLembur(e.target.value)}
              className="form-select"
              disabled={hasCheckedInToday} // ⬅️ kunci setelah checkin
            >
              <option value="">-- Pilih Jenis Lembur --</option>
              <option value="0">Lembur Hari Kerja</option>
              <option value="1">Lembur Hari Libur</option>
            </select>
          </div>
        </div>
        <div className="button-group">
          <button
            disabled={loading || hasCheckedInToday}
            onClick={() => handleAbsen('in')}
            className="btn btn-success"
          >
            📥{' '}
            {loading
              ? 'Memproses...'
              : hasCheckedInToday
              ? 'Sudah Check In'
              : 'Absen Lembur Masuk'}
          </button>

          <button
            disabled={loading || !hasCheckedInToday || hasCheckedOutToday}
            onClick={() => handleAbsen('out')}
            className="btn btn-danger"
          >
            📤{' '}
            {loading
              ? 'Memproses...'
              : hasCheckedOutToday
              ? 'Sudah Check Out'
              : 'Absen Lembur Keluar'}
          </button>
        </div>
        {message && <div className={`message ${messageType}`}>{message}</div>}
        <div className="mini-history">
          <h4>Aktivitas Terakhir</h4>
          <div className="history-list">
            {riwayatSingkat.map((item, i) => (
              <div key={i} className="history-item">
                <div className="history-info">
                  <span className="history-date">
                    {formatDate(item.tanggal)} -{' '}
                    {item.tanggal_keluar
                      ? formatDate(item.tanggal_keluar)
                      : 'BELUM PULANG'}
                  </span>
                  <span className="history-time">
                    {item.jam_masuk} - {item.jam_keluar || '--:--'}
                  </span>
                </div>

                <div className="history-stats d-flex gap-2">
                  {/* jenis lembur */}
                  <span className={getJenisBadge(item.id_skema)}>
                    {getJenisLabel(item.id_skema)}
                  </span>

                  {/* status */}
                  <span
                    className={`badge ${
                      item.status === 'Alpha'
                        ? 'bg-danger'
                        : item.is_approved === 'approved'
                        ? 'bg-success'
                        : 'bg-warning text-dark'
                    }`}
                  >
                    {item.status === 'Alpha'
                      ? 'ALPHA'
                      : (item.is_approved || 'pending').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsensiLembur;
