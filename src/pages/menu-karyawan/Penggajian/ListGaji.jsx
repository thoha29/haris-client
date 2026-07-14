import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import './SlipGaji.css';

export const ListGaji = () => {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data dari localStorage
  const id_user = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  const formatRupiah = (val) => {
    if (val === null || val === undefined) return '-';
    return Number(val).toLocaleString('id-ID');
  };

  useEffect(() => {
    const fetchRiwayat = async () => {
      if (!id_user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Memanggil API yang sudah di-JOIN dengan tabel data_pribadi di backend
        const res = await api.get(`/api/gaji/gaji-karyawan/${id_user}`);
        console.log(res);
        setRiwayat(res.data.data);
      } catch (err) {
        console.error('Gagal ambil riwayat gaji:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, [id_user]);

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
      <div className="history-header-simple">
        <h1>Arsip Slip Gaji Digital</h1>
        <p>Halo, {username}!</p>
      </div>

      {loading ? (
        <div
          className="loading-container"
          style={{ textAlign: 'center', padding: '50px' }}
        >
          <p>Sedang memuat data gaji...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th rowSpan="2">Karyawan</th>
                <th colSpan="3">Upah Yang Dibayarkan</th>
                <th rowSpan="2">Status Perkawinan</th>
                <th colSpan="8">Kehadiran</th>
                <th colSpan="5">Lembur</th>
                <th colSpan="3">Potongan</th>
              </tr>
              <tr>
                <th>UP</th>
                <th>TAUP</th>
                <th>Total</th>

                <th>Pagi</th>
                <th>Malam</th>
                <th>HK</th>
                <th>Tunj Kehadiran</th>
                <th>Premi Shift</th>
                <th>KJK</th>
                <th>Extra Fooding</th>
                <th>Total Tunj</th>

                <th>Jam</th>
                <th>Hari</th>
                <th>Upah</th>
                <th>Makan</th>
                <th>Total</th>

                <th>JHT</th>
                <th>JP</th>
                <th>JKes</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.nama}</strong>
                    </td>

                    <td>{formatRupiah(item.upah)}</td>
                    <td>{formatRupiah(item.tunj)}</td>
                    <td>{formatRupiah(item.upah_tetap)}</td>

                    <td className="text-center">{item.status_perkawinan}</td>

                    <td>{item.pagi}</td>
                    <td>{item.malam}</td>
                    <td>{item.hari}</td>
                    <td>{formatRupiah(item.tunj_kehadiran)}</td>
                    <td>{formatRupiah(item.premi_shift)}</td>
                    <td>{formatRupiah(item.kelebihan_jam_kerja)}</td>
                    <td>{formatRupiah(item.extra_fooding)}</td>
                    <td>{formatRupiah(item.total_tunjangan)}</td>

                    <td>{item.jml_jam_lembur ?? '-'}</td>
                    <td>{item.hr_lembur ?? '-'}</td>
                    <td>{formatRupiah(item.upah_lembur)}</td>
                    <td>{formatRupiah(item.uang_makan_lembur)}</td>
                    <td>{formatRupiah(item.jumlah_lembur)}</td>

                    <td>{formatRupiah(item.jht)}</td>
                    <td>{formatRupiah(item.jp)}</td>
                    <td>{formatRupiah(item.jkes)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    Gaji belum diproses HRD.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListGaji;
