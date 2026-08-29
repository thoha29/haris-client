import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../../config/api';
import './daftarGaji.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DaftarGaji = () => {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          { content: 'Upah Dinas', colSpan: 3 },
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
        formatRupiah(item.upah_tetap),
        item.status_perkawinan,
        item.pagi,
        item.malam,
        item.hari,
        formatRupiah(item.tunj_kehadiran),
        formatRupiah(item.premi_shift),
        formatRupiah(item.kelebihan_jam_kerja),
        formatRupiah(item.extra_fooding),
        formatRupiah(item.total_tunjangan),
        item.jml_jam_lembur ?? '-',
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

      <div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDownloadPDF}
        >
          Download PDF
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

                      <td>{formatRupiah(item.uharian)}</td>
                      <td>{formatRupiah(item.upagi)}</td>
                      <td>{formatRupiah(item.usiang)}</td>
                      <td>{formatRupiah(item.umalam)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="20" className="text-center">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaftarGaji;
