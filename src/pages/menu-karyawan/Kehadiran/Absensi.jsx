import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Absensi.css';

const Absensi = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [riwayatSingkat, setRiwayatSingkat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jadwalAktif, setJadwalAktif] = useState(null);
const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false);
const [lokasi, setLokasi] = useState(null);

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

  // FIX: Mengembalikan ke /api/jadwal karena di app.js backend menggunakan app.use('/api/jadwal', ...)
  const fetchMySchedule = useCallback(async () => {
    if (!userId || role === 'user' || role === 'hrd') return;
    try {
      const today = formatDate(new Date());
      const res = await axios.get(
        `http://localhost:3000/api/jadwal/check/${userId}?tanggal=${today}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJadwalAktif(res.data);
    } catch (err) {
      setJadwalAktif(null);
    }
  }, [userId, token, role]);

  // FIX: Hapus /api/absensi menjadi /absensi
  const fetchTodayStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/absensi/riwayat/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRiwayatSingkat(res.data.slice(0, 5));

      const today = formatDate(new Date());
      const todayData = res.data.find(
        (item) => formatDate(item.tanggal) === today
      );

      if (todayData) {
        setHasCheckedInToday(!!todayData.jam_masuk);
        setHasCheckedOutToday(!!todayData.jam_keluar);
      } else {
        setHasCheckedInToday(false);
        setHasCheckedOutToday(false);
      }
    } catch (err) {
      console.error('Gagal load riwayat.');
    }
  }, [userId, token]);

  useEffect(() => {
    fetchTodayStatus();
    fetchMySchedule();
  }, [fetchTodayStatus, fetchMySchedule]);

const handleAbsen = async (type) => {
  if (!userId) {
    Swal.fire('Akses Ditolak', 'Silakan login ulang!', 'error');
    return;
  }


  setLoading(true);

  try {
    // Ambil GPS
    const locationData = await getLocation();

    setLokasi(locationData);

    // Payload lengkap
const payload = {
  id_user: userId,
  role: role,

id_skema: jadwalAktif ? jadwalAktif.id_skema : null,

  tanggal: formatDate(currentTime),

  lokasi_absensi: 'GPS Aktif',

  latitude: locationData.latitude,
  longitude: locationData.longitude,

  [type === 'in'
    ? 'jam_masuk'
    : 'jam_keluar']: formatTime(currentTime),
};

    const url = `http://localhost:3000/absensi/${
      type === 'in' ? 'checkin' : 'checkout'
    }`;

    const response = await axios({
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
      error.response?.data?.error ||
      error.message ||
      'Gagal absen!'
    );

    setMessageType('error');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="absensi-container">
      <div className="absensi-card">
        <div className="header">
          <h1>Halo, {username}!</h1>
          <p className="subtitle">PT. Banggai Sentral Sulawesi</p>
          <span className="role-indicator">Akses: {role.toUpperCase()}</span>
        </div>

        {role !== 'user' && role !== 'hrd' && (
          <div className={`schedule-card ${!jadwalAktif ? 'warning' : ''}`}>
            {jadwalAktif ? (
              <div className="schedule-content">
                <div className="schedule-header">
                  <span className="schedule-label">Shift Hari Ini</span>
                </div>
                <h3 className="schedule-name">{jadwalAktif.nama_skema}</h3>
                <div className="schedule-time-box">
                  <span className="schedule-time">
                    {jadwalAktif.jam_masuk.substring(0, 5)}{' '}
                    <span className="time-divider">-</span>{' '}
                    {jadwalAktif.jam_keluar.substring(0, 5)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="schedule-empty">
                <span className="schedule-error">Jadwal Belum Diatur</span>
              </div>
            )}
          </div>
        )}

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
  <div
    style={{
      marginTop: '10px',
      fontSize: '13px',
      color: '#666',
    }}
  >
    📍 {lokasi.latitude.toFixed(6)},
    {lokasi.longitude.toFixed(6)}
  </div>
)}
        </div>

        <div className="button-group">
          <button
                    disabled={
              loading ||
              hasCheckedInToday
            }
            onClick={() => handleAbsen('in')}
            className="btn btn-checkin"
          >
            📥{' '}
          {loading
  ? '...'
  : hasCheckedInToday
  ? 'Sudah Check In'
  : 'Absen Masuk'}
          </button>

          <button
            disabled={loading || !hasCheckedInToday || hasCheckedOutToday}
            onClick={() => handleAbsen('out')}
            className="btn btn-checkout"
          >
            📤{' '}
            {loading
              ? '...'
              : hasCheckedOutToday
              ? 'Sudah Check Out'
              : 'Absen Keluar'}
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
                    {formatDate(item.tanggal)}
                  </span>
                  <span className="history-time">
                    {item.jam_masuk} - {item.jam_keluar || '--:--'}
                  </span>
                </div>
                <div className="history-stats">
                  <span
                    className={`badge ${
                      item.status === 'Alpha'
                        ? 'alpha'
                        : item.is_approved || 'pending'
                    }`}
                  >
                    {item.status === 'Alpha'
                      ? 'ALPHA'
                      : (item.is_approved || 'pending').toUpperCase()}
                  </span>
                  {item.is_approved !== 'pending' && (
                    <small className="timestamp-info">
                      Diproses:{' '}
                      {new Date(item.updated_at).toLocaleString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Absensi;
