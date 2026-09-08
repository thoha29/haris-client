import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../../config/api';
import './daftarGaji.css';
import './daftarGajiAction.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SlipGajiView from '../../../components/SlipGajiView';

const DaftarGaji = () => {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [slipLoading, setSlipLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/api/gaji/list-gaji');
      setListData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Gagal mengambil data gaji.');
    } finally {
      setLoading(false);
    }
  }, []);

  const formatRupiah = (val) => {
    if (val === null || val === undefined) return '-';
    return Number(val).toLocaleString('id-ID');
  };

  // Ambil detail slip gaji satu karyawan
  const handleLihatSlip = async (id_user) => {
    setSlipLoading(true);
    try {
      const res = await api.get(`/api/gaji/gaji-karyawan/${id_user}`);
      const rows = res.data?.data;
      if (!rows || rows.length === 0) {
        Swal.fire('Info', 'Data slip gaji tidak ditemukan', 'info');
        return;
      }
      setSelectedSlip(rows[0]);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal mengambil data slip gaji', 'error');
    } finally {
      setSlipLoading(false);
    }
  };

  // Download Excel slip per karyawan
  const handleDownloadSlipExcel = async (id_user, nama) => {
    try {
      Swal.fire({
        title: 'Menyiapkan Excel...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await api.get(`/api/gaji/export-slip-excel/${id_user}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      const safeName = (nama || 'karyawan').replace(/\s+/g, '_');
      link.setAttribute('download', `Slip_Gaji_${safeName}_${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Swal.close();
      Swal.fire({ icon: 'success', title: 'Berhasil diunduh', timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal mengunduh slip Excel', 'error');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      Swal.fire({
        title: 'Membuat laporan...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const pdf = new jsPDF('l', 'mm', 'a3');

      // 🔥 HEADER LAPORAN
      pdf.setFontSize(16);
      pdf.text('LAPORAN GAJI KARYAWAN', 14, 15);

      pdf.setFontSize(10);
      pdf.text(
        `Dibuat Pada Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
        14,
        22
      );

      // 🔥 HEADER TABLE (MULTI ROW)
      const head = [
        [
          { content: 'Karyawan', rowSpan: 2 },
          { content: 'Upah Yang Dibayarkan', colSpan: 3 },
          { content: 'Status', rowSpan: 2 },
          { content: 'Kehadiran', colSpan: 8 },
          { content: 'Lembur', colSpan: 5 },
          { content: 'Potongan', colSpan: 3 },
          { content: 'Upah Dinas', colSpan: 4 },
        ],
        [
          'UP',
          'TAUP',
          'Total',
          'Pagi',
          'Malam',
          'HK',
          'Tunj Kehadiran',
          'Premi Shift',
          'KJK',
          'Extra Fooding',
          'Total Tunj',
          'Jam',
          'Hari',
          'Upah',
          'Makan',
          'Total',
          'JHT',
          'JP',
          'JKes',
          'Harian',
          'Pagi',
          'Siang',
          'Malam',
        ],
      ];

      // 🔥 BODY DATA
      const body = listData.map((item) => [
        item.nama,
        formatRupiah(item.upah),
        formatRupiah(item.tunj),
        formatRupiah(item.upah_tetap ?? (Number(item.upah || 0) + Number(item.tunj || 0))),
        item.status_perkawinan,
        item.pagi,
        item.malam,
        item.hari,
        formatRupiah(item.tunj_kehadiran),
        formatRupiah(item.premi_shift),
        formatRupiah(item.kelebihan_jam_kerja),
        formatRupiah(item.extra_fooding),
        formatRupiah(item.total_tunjangan),
        item.jml_jam_lembur ?? item.jml_lembur ?? '-',
        item.hr_lembur ?? '-',
        formatRupiah(item.upah_lembur),
        formatRupiah(item.uang_makan_lembur),
        formatRupiah(item.jumlah_lembur),
        formatRupiah(item.jht),
        formatRupiah(item.jp),
        formatRupiah(item.jkes),
        formatRupiah(item.uharian),
        formatRupiah(item.upagi),
        formatRupiah(item.usiang),
        formatRupiah(item.umalam),
      ]);

      // 🔥 GENERATE TABLE
      autoTable(pdf, {
        startY: 28,
        head: head,
        body: body,
        styles: {
          fontSize: 7,
          cellPadding: 2,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          lineWidth: 0.5,
        },
        theme: 'grid',
        didDrawPage: (data) => {
          // footer halaman
          const pageCount = pdf.internal.getNumberOfPages();
          pdf.setFontSize(8);
          pdf.text(
            `Halaman ${data.pageNumber} dari ${pageCount}`,
            data.settings.margin.left,
            pdf.internal.pageSize.height - 5
          );
        },
      });

      pdf.save('laporan-gaji.pdf');

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Laporan berhasil dibuat',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal membuat PDF', 'error');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      Swal.fire({
        title: 'Menyiapkan Excel...',
        text: 'Sedang mengekspor data gaji karyawan...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.get('/api/gaji/export-excel', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Daftar_Gaji_Karyawan_${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Laporan berhasil diunduh',
        text: 'File Excel daftar gaji berhasil diunduh!',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Download excel error:', err);
      Swal.fire('Error', 'Gagal mengunduh file Excel daftar gaji', 'error');
    } finally {
      setDownloadingExcel(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <div className="hrd-container">
      <div className="header">
        <h2>Daftar Gaji</h2>

        <button onClick={fetchData} className="btn-refresh" disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="d-flex gap-2 flex-wrap mb-3">
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={handleDownloadPDF}
        >
          <i className="bi bi-file-earmark-pdf-fill"></i>
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          className="btn btn-success d-flex align-items-center gap-1"
          onClick={handleDownloadExcel}
          disabled={downloadingExcel || loading}
        >
          <i className="bi bi-file-earmark-excel-fill"></i>
          <span>{downloadingExcel ? 'Mengunduh...' : 'Download Excel'}</span>
        </button>
      </div>

      {/* BODY CARD */}
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-primary text-center align-middle">
                <tr>
                  <th rowSpan="2" className="col-aksi-header">Aksi</th>
                  <th rowSpan="2">Karyawan</th>
                  <th colSpan="3">Upah Yang Dibayarkan</th>
                  <th rowSpan="2">Status Perkawinan</th>
                  <th colSpan="8">Kehadiran</th>
                  <th colSpan="5">Lembur</th>
                  <th colSpan="3">Potongan</th>
                  <th colSpan="4">Upah Dinas</th>
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

                  <th>Harian</th>
                  <th>Pagi</th>
                  <th>Siang</th>
                  <th>Malam</th>
                </tr>
              </thead>

              <tbody>
                {listData.length > 0 ? (
                  listData.map((item) => (
                    <tr key={item.id}>
                      <td className="col-aksi-body" style={{ whiteSpace: 'nowrap' }}>
                        <div className="btn-action-group">
                          <button
                            type="button"
                            className="btn-action btn-action-slip"
                            title="Lihat Slip Gaji"
                            disabled={slipLoading}
                            onClick={() => handleLihatSlip(item.id)}
                          >
                            <i className="bi bi-file-earmark-text"></i>
                            <span>Slip</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-action-excel"
                            title="Download Excel Slip Gaji"
                            onClick={() => handleDownloadSlipExcel(item.id, item.nama)}
                          >
                            <i className="bi bi-file-earmark-excel"></i>
                            <span>Excel</span>
                          </button>
                        </div>
                      </td>

                      <td>
                        <strong>{item.nama}</strong>
                      </td>

                      <td>{formatRupiah(item.upah)}</td>
                      <td>{formatRupiah(item.tunj)}</td>
                      <td>{formatRupiah(item.upah_tetap ?? (Number(item.upah || 0) + Number(item.tunj || 0)))}</td>

                      <td className="text-center">{item.status_perkawinan}</td>

                      <td>{item.pagi}</td>
                      <td>{item.malam}</td>
                      <td>{item.hari}</td>
                      <td>{formatRupiah(item.tunj_kehadiran)}</td>
                      <td>{formatRupiah(item.premi_shift)}</td>
                      <td>{formatRupiah(item.kelebihan_jam_kerja)}</td>
                      <td>{formatRupiah(item.extra_fooding)}</td>
                      <td>{formatRupiah(item.total_tunjangan)}</td>

                      <td>{item.jml_jam_lembur ?? item.jml_lembur ?? '-'}</td>
                      <td>{item.hr_lembur ?? '-'}</td>
                      <td>{formatRupiah(item.upah_lembur)}</td>
                      <td>{formatRupiah(item.uang_makan_lembur)}</td>
                      <td>{formatRupiah(item.jumlah_lembur)}</td>

                      <td>{formatRupiah(item.jht)}</td>
                      <td>{formatRupiah(item.jp)}</td>
                      <td>{formatRupiah(item.jkes)}</td>

                      <td>{formatRupiah(item.uharian)}</td>
                      <td>{formatRupiah(item.upagi)}</td>
                      <td>{formatRupiah(item.usiang)}</td>
                      <td>{formatRupiah(item.umalam)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="26" className="text-center">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL SLIP GAJI ── */}
      {selectedSlip && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.55)', zIndex: 1050, overflowY: 'auto', padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSlip(null); }}
        >
          <div style={{ width: '100%', maxWidth: '880px', margin: 'auto' }}>
            {/* Header Modal */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-white mb-0 fw-bold">
                Slip Gaji — {selectedSlip.nama_lengkap || selectedSlip.nama || ''}
              </h6>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedSlip(null)}
              >
                ✕ Tutup
              </button>
            </div>
            <SlipGajiView
              data={selectedSlip}
              showDownload={true}
              onDownloadExcel={() =>
                handleDownloadSlipExcel(
                  selectedSlip.id,
                  selectedSlip.nama_lengkap || selectedSlip.nama
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarGaji;
