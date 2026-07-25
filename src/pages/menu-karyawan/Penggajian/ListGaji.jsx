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
        <h1>Slip Gaji Digital</h1>
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
        // <div className="table-container">
        //   <table className="styled-table">
        //     <thead>
        //       <tr>
        //         <th rowSpan="2">Karyawan</th>
        //         <th colSpan="3">Upah Yang Dibayarkan</th>
        //         <th rowSpan="2">Status Perkawinan</th>
        //         <th colSpan="8">Kehadiran</th>
        //         <th colSpan="5">Lembur</th>
        //         <th colSpan="3">Potongan</th>
        //       </tr>
        //       <tr>
        //         <th>UP</th>
        //         <th>TAUP</th>
        //         <th>Total</th>

        //         <th>Pagi</th>
        //         <th>Malam</th>
        //         <th>HK</th>
        //         <th>Tunj Kehadiran</th>
        //         <th>Premi Shift</th>
        //         <th>KJK</th>
        //         <th>Extra Fooding</th>
        //         <th>Total Tunj</th>

        //         <th>Jam</th>
        //         <th>Hari</th>
        //         <th>Upah</th>
        //         <th>Makan</th>
        //         <th>Total</th>

        //         <th>JHT</th>
        //         <th>JP</th>
        //         <th>JKes</th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {riwayat.length > 0 ? (
        //         riwayat.map((item) => (
        //           <tr key={item.id}>
        //             <td>
        //               <strong>{item.nama}</strong>
        //             </td>

        //             <td>{formatRupiah(item.upah)}</td>
        //             <td>{formatRupiah(item.tunj)}</td>
        //             <td>{formatRupiah(item.upah_tetap)}</td>

        //             <td className="text-center">{item.status_perkawinan}</td>

        //             <td>{item.pagi}</td>
        //             <td>{item.malam}</td>
        //             <td>{item.hari}</td>
        //             <td>{formatRupiah(item.tunj_kehadiran)}</td>
        //             <td>{formatRupiah(item.premi_shift)}</td>
        //             <td>{formatRupiah(item.kelebihan_jam_kerja)}</td>
        //             <td>{formatRupiah(item.extra_fooding)}</td>
        //             <td>{formatRupiah(item.total_tunjangan)}</td>

        //             <td>{item.jml_jam_lembur ?? '-'}</td>
        //             <td>{item.hr_lembur ?? '-'}</td>
        //             <td>{formatRupiah(item.upah_lembur)}</td>
        //             <td>{formatRupiah(item.uang_makan_lembur)}</td>
        //             <td>{formatRupiah(item.jumlah_lembur)}</td>

        //             <td>{formatRupiah(item.jht)}</td>
        //             <td>{formatRupiah(item.jp)}</td>
        //             <td>{formatRupiah(item.jkes)}</td>
        //           </tr>
        //         ))
        //       ) : (
        //         <tr>
        //           <td
        //             colSpan="8"
        //             style={{ textAlign: 'center', padding: '20px' }}
        //           >
        //             Gaji belum diproses HRD.
        //           </td>
        //         </tr>
        //       )}
        //     </tbody>
        //   </table>
        // </div>
        <div className=" mt-3">
          {riwayat.length > 0 ? (
            riwayat.map((item) => (
              <div key={item.id} className="mb-4">
                {/* ================= INFO KARYAWAN (FULL) ================= */}
                <div className="card mb-3 shadow-sm">
                  <div className="card-header">
                    <strong>Informasi Karyawan</strong>
                  </div>
                  <div className="card-body d-flex justify-content-between">
                    <div>
                      <strong>Nama:</strong> {item.nama}
                    </div>
                    <div>
                      <strong>Status:</strong> {item.status_perkawinan}
                    </div>
                  </div>
                </div>

                {/* ================= GRID 2 KOLOM ================= */}
                <div className="row g-3">
                  {/* UPAH */}
                  <div className="col-12 col-md-6">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header">
                        <strong>Upah Yang Dibayarkan</strong>
                      </div>
                      <div className="card-body">
                        <div className="row text-center">
                          <div className="col">
                            <small>UP</small>
                            <div>{formatRupiah(item.upah)}</div>
                          </div>
                          <div className="col">
                            <small>TAUP</small>
                            <div>{formatRupiah(item.tunj)}</div>
                          </div>
                          <div className="col">
                            <small>Total</small>
                            <div>{formatRupiah(item.upah_tetap)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KEHADIRAN */}
                  <div className="col-12 col-md-6">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header">
                        <strong>Kehadiran</strong>
                      </div>
                      <div className="card-body">
                        <div className="row text-center mb-2">
                          <div className="col">Pagi: {item.pagi}</div>
                          <div className="col">Malam: {item.malam}</div>
                          <div className="col">HK: {item.hari}</div>
                        </div>
                        <div className="row text-center">
                          <div className="col">
                            Tunj: {formatRupiah(item.tunj_kehadiran)}
                          </div>
                          <div className="col">
                            Shift: {formatRupiah(item.premi_shift)}
                          </div>
                          <div className="col">
                            KJK: {formatRupiah(item.kelebihan_jam_kerja)}
                          </div>
                          <div className="col">
                            Food: {formatRupiah(item.extra_fooding)}
                          </div>
                          <div className="col">
                            Total: {formatRupiah(item.total_tunjangan)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LEMBUR */}
                  <div className="col-12 col-md-6">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header">
                        <strong>Lembur</strong>
                      </div>
                      <div className="card-body">
                        <div className="row text-center">
                          <div className="col">
                            Jam: {item.jml_jam_lembur ?? '-'}
                          </div>
                          <div className="col">
                            Hari: {item.hr_lembur ?? '-'}
                          </div>
                          <div className="col">
                            Upah: {formatRupiah(item.upah_lembur)}
                          </div>
                          <div className="col">
                            Makan: {formatRupiah(item.uang_makan_lembur)}
                          </div>
                          <div className="col">
                            Total: {formatRupiah(item.jumlah_lembur)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* POTONGAN */}
                  <div className="col-12 col-md-6">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header">
                        <strong>Potongan</strong>
                      </div>
                      <div className="card-body">
                        <div className="row text-center">
                          <div className="col">
                            JHT: {formatRupiah(item.jht)}
                          </div>
                          <div className="col">JP: {formatRupiah(item.jp)}</div>
                          <div className="col">
                            JKes: {formatRupiah(item.jkes)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center mt-5">Gaji belum diproses HRD.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListGaji;
