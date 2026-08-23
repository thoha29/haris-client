import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './HrdKaryawanDetail.css';
import api from '../../../config/api';
import SelectSearch from '../../../components/SelectSearch';
import SummaryCards from './components/SummaryCards';
import DistributionCards from './components/DistributionCards';
import ReportTable from './components/ReportTable';
import { exportToPDF, exportToExcel } from './utils/exportReport';
import { calculateLemburKonversi } from '../../../utils/overtimeCalculator';

const HrdKaryawanDetail = () => {
  const { id_user } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // --- State untuk Filter Periode ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/absensi/hrd/report-lengkap/${id_user}?month=${selectedMonth + 1}&year=${selectedYear}`
      );
      
      const rawData = res.data;
      if (rawData && rawData.items) {
        let totalKonversi = 0;
        const recalculatedItems = rawData.items.map((it) => {
          const lemburAktual = parseFloat(it.lembur_aktual) || 0;
          const konversi = it.type === 'cuti' ? 0 : calculateLemburKonversi(lemburAktual, it.is_holiday);
          totalKonversi += konversi;
          return {
            ...it,
            lembur_konversi: konversi,
          };
        });

        setReportData({
          ...rawData,
          summary: {
            ...rawData.summary,
            total_lembur_konversi: Number(totalKonversi.toFixed(1)),
          },
          items: recalculatedItems,
        });
      } else {
        setReportData(rawData);
      }
    } catch (err) {
      console.error('Gagal ambil data report lengkap:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: err.response?.data?.error || 'Terjadi kesalahan saat memuat data report absensi.',
      });
    } finally {
      setLoading(false);
    }
  }, [id_user, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrintPDF = () => {
    if (!reportData) return;
    exportToPDF({
      karyawan: reportData.karyawan,
      periode: reportData.periode,
      summary: reportData.summary,
      items: reportData.items,
      monthName: months[selectedMonth],
    });
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    exportToExcel({
      karyawan: reportData.karyawan,
      periode: reportData.periode,
      summary: reportData.summary,
      items: reportData.items,
      monthName: months[selectedMonth],
    });
  };

  const handleDeleteItem = async (item) => {
    const confirm = await Swal.fire({
      title: 'Hapus Data Ini?',
      text: `Apakah Anda yakin ingin menghapus data ${item.status_label} pada tanggal ${new Date(
        item.tanggal
      ).toLocaleDateString('id-ID')}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (!confirm.isConfirmed) return;

    try {
      if (item.type === 'absensi') {
        await api.delete(`/absensi/hrd/hapus/${item.raw_id}`);
      } else if (item.type === 'lembur') {
        await api.delete(`/absensi-lembur/hrd/hapus/${item.raw_id}`);
      }
      Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
      fetchReport();
    } catch (err) {
      console.error('Gagal menghapus data:', err);
      Swal.fire('Error', err.response?.data?.error || 'Gagal menghapus data.', 'error');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDeleteAll = async () => {
    const confirm = await Swal.fire({
      title: 'Hapus Semua Histori?',
      text: `PERHATIAN: Semua data absensi dan lembur untuk ${reportData?.karyawan?.nama_lengkap || 'karyawan'
        } pada periode ${months[selectedMonth]} ${selectedYear} akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Semua!',
      cancelButtonText: 'Batal',
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(
        `/absensi/hrd/hapus-semua/${id_user}?month=${selectedMonth + 1}&year=${selectedYear}`
      );
      Swal.fire('Terhapus!', 'Semua data histori pada periode ini berhasil dihapus.', 'success');
      fetchReport();
    } catch (err) {
      console.error('Gagal menghapus semua data:', err);
      Swal.fire('Error', err.response?.data?.error || 'Gagal menghapus semua data histori.', 'error');
    }
  };

  const namaKaryawan =
    reportData?.karyawan?.nama_lengkap || reportData?.karyawan?.username || 'Karyawan';

  return (
    <div className="histori-report-wrapper">
      {/* Top Header */}
      <div className="report-main-header">
        <div className="header-titles">
          <div className="title-row">
            <h1>Histori Absen & Rincian Lembur: {namaKaryawan}</h1>
          </div>
          <p className="subtitle">
            Data otomatis terurut kronologis dengan ringkasan total di bawah.
          </p>
        </div>

        <div className="header-actions">
          <div className="period-filter-wrap">
            <div className="filter-select-box month-select">
              <SelectSearch
                options={months.map((m, i) => ({ value: i, label: m }))}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.value))}
                placeholder="Bulan"
              />
            </div>
            <div className="filter-select-box year-select">
              <SelectSearch
                options={years.map((y) => ({ value: y, label: String(y) }))}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.value))}
                placeholder="Tahun"
              />
            </div>
          </div>

          <button className="btn-action-print" onClick={handlePrintPDF}>
            Cetak (Print)
          </button>

          <button className="btn-action-excel" onClick={handleExportExcel}>
            Unduh CSV/Excel
          </button>

          <button className="btn-action-close" onClick={() => navigate(-1)} title="Tutup / Kembali">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="report-loading-box">
          <div className="spinner-border text-primary" role="status"></div>
          <span>Memuat data laporan absensi & lembur...</span>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <SummaryCards summary={reportData?.summary} />

          {/* Distribution Recap Card */}
          <DistributionCards summary={reportData?.summary} periode={reportData?.periode} />

          {/* Table Action Bar */}
          {/* <div className="table-action-bar">
            <button
              className="btn-delete-all"
              onClick={handleDeleteAll}
              disabled={!reportData?.items || reportData.items.length === 0}
            >
              <i className="bi bi-trash-fill"></i> Hapus Semua Histori
            </button>
          </div> */}

          {/* Chronological Table */}
          <ReportTable items={reportData?.items} onDeleteItem={handleDeleteItem} />
        </>
      )}
    </div>
  );
};

export default HrdKaryawanDetail;
