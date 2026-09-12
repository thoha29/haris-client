import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './RiwayatAbsensi.css';
import SelectSearch from '../../../components/SelectSearch';
import Pagination from '../../../components/Pagination';
import {
  formatJamMenit,
  formatMenitKeJamMenit,
} from '../../../utils/formatTime';

const RiwayatAbsensi = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Default bulan sekarang
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default tahun sekarang

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  // Generate list tahun (dari 3 tahun lalu sampai sekarang)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const getAuthData = () => ({
    userId: localStorage.getItem('userId'),
    token: localStorage.getItem('access_token'),
    username: localStorage.getItem('username') || 'Karyawan',
    role: localStorage.getItem('role') || 'karyawan',
  });

  const fetchFullHistory = useCallback(async () => {
    const { userId, token } = getAuthData();

    if (!userId || !token) {
      setError('Sesi habis, silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/absensi/riwayat/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRiwayat(res.data);
      setError(null);
    } catch (err) {
      console.error('Gagal load riwayat:', err.response);
      setError('Gagal mengambil data riwayat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFullHistory();
  }, [fetchFullHistory]);

  // Logic Filtering: Memfilter data berdasarkan bulan dan tahun terpilih
  const filteredRiwayat = useMemo(() => {
    return riwayat.filter((item) => {
      const date = new Date(item.tanggal);
      return (
        date.getMonth() === parseInt(selectedMonth) &&
        date.getFullYear() === parseInt(selectedYear)
      );
    });
  }, [riwayat, selectedMonth, selectedYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  const paginatedRiwayat = useMemo(() => {
    if (pageSize === 'Semua') return filteredRiwayat;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredRiwayat.slice(start, start + size);
  }, [filteredRiwayat, currentPage, pageSize]);

  if (loading) return <div className="loading">Memuat Riwayat...</div>;

  return (
    <div className="absensi-container">
      <div className="absensi-card" style={{ maxWidth: '1100px' }}>
        <div className="header">
          <h1>Riwayat Absensi Lengkap</h1>
          <p className="subtitle">
            {getAuthData().username} ({getAuthData().role.toUpperCase()})
          </p>
        </div>

        {/* SECTION FILTER */}
        <div
          className="filter-container"
          style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <label>Filter Periode:</label>
          <div style={{ width: '160px' }}>
            <SelectSearch
              options={months.map((m, idx) => ({ value: idx, label: m }))}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.value))}
              placeholder="Bulan"
            />
          </div>
          <div style={{ width: '120px' }}>
            <SelectSearch
              options={years.map((y) => ({ value: y, label: String(y) }))}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.value))}
              placeholder="Tahun"
            />
          </div>
        </div>

        {error && <div className="message error">{error}</div>}

        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Masuk</th>
                <th>Keluar</th>
                <th>Telat</th>
                <th>Lembur</th>
                <th>Total Jam</th>
                <th>Status Final</th>
                <th>Waktu Proses HRD</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRiwayat.length > 0 ? (
                paginatedRiwayat.map((item, i) => (
                  <tr key={i}>
                    <td>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td>{item.jam_masuk || '--:--'}</td>
                    <td>{item.jam_keluar || '--:--'}</td>
                    <td
                      style={{
                        color: item.keterlambatan > 0 ? '#d9534f' : 'inherit',
                        fontWeight: item.keterlambatan > 0 ? 'bold' : 'normal',
                      }}
                    >
                      {item.keterlambatan > 0
                        ? formatMenitKeJamMenit(item.keterlambatan)
                        : '0 menit'}
                    </td>
                    <td
                      style={{ color: item.lembur > 0 ? '#5cb85c' : 'inherit' }}
                    >
                      {formatJamMenit(item.lembur)}
                    </td>
                    <td>{formatJamMenit(item.total_jam_kerja)}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'Alpha' ? 'alpha' : item.is_approved
                        }`}
                      >
                        {item.status === 'Alpha'
                          ? 'ALPHA'
                          : item.is_approved?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.85rem', color: '#666' }}>
                      {item.is_approved !== 'pending' ? (
                        new Date(item.updated_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      ) : (
                        <span style={{ fontStyle: 'italic', color: '#aaa' }}>
                          Menunggu...
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    Tidak ada data absensi untuk bulan{' '}
                    <strong>
                      {months[selectedMonth]} {selectedYear}
                    </strong>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredRiwayat.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />

        <button
          onClick={() => window.history.back()}
          className="btn-back"
          style={{ marginTop: '20px' }}
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default RiwayatAbsensi;
