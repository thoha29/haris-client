import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../../config/api';
import './DataPribadi.css';

export default function DataPribadi() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('userId');
      const res = await api.get(`/api/data-pribadi/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Object.keys(res.data).length > 0) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Gagal mengambil data pribadi:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(val);
    }
  };

  // ==========================================
  // 1. UNDUH PDF (jsPDF + autoTable)
  // ==========================================
  const handleDownloadPDF = () => {
    if (!user) {
      Swal.fire('Perhatian', 'Data pribadi belum tersedia untuk diunduh.', 'warning');
      return;
    }

    try {
      setDownloadingPDF(true);
      Swal.fire({
        title: 'Menyiapkan PDF...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();

      // HEADER PERUSAHAAN (KOP SURAT)
      pdf.setFillColor(31, 78, 120); // Deep Navy #1F4E78
      pdf.rect(0, 0, pageWidth, 28, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('PT. BANGGAI SENTRAL SULAWESI', pageWidth / 2, 12, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('BIODATA & DATA PRIBADI KARYAWAN', pageWidth / 2, 19, { align: 'center' });

      pdf.setFontSize(8);
      pdf.text(
        `Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        pageWidth / 2,
        25,
        { align: 'center' }
      );

      // SECTION 1: INFORMASI PRIBADI
      const pribadiRows = [
        ['NIK', user.nik || '-'],
        ['Nama Lengkap', user.nama_lengkap || '-'],
        ['Tempat, Tanggal Lahir', user.tanggal_lahir ? `${user.tempat_lahir || '-'}, ${formatDate(user.tanggal_lahir)}` : (user.tempat_lahir || '-')],
        ['Jenis Kelamin', user.jenis_kelamin === 'L' ? 'Laki-laki' : user.jenis_kelamin === 'P' ? 'Perempuan' : (user.jenis_kelamin || '-')],
        ['Agama', user.agama || '-'],
        ['Status Perkawinan', user.status_perkawinan || '-'],
        ['Kewarganegaraan', user.kewarganegaraan || 'Indonesia'],
        ['Alamat Lengkap', user.alamat || '-'],
      ];

      autoTable(pdf, {
        startY: 34,
        head: [['I. INFORMASI PRIBADI / BIODATA', '']],
        body: pribadiRows,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold', fillColor: [245, 247, 250], textColor: [50, 50, 50] },
          1: { cellWidth: 125, textColor: [30, 30, 30] },
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: 'middle',
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        margin: { left: 15, right: 15 },
      });

      // SECTION 2: INFORMASI KEPEGAWAIAN
      const kepegawaianRows = [
        ['NIP', user.nip || '-'],
        ['Jabatan', user.jabatan || '-'],
        ['Divisi', user.divisi || '-'],
        ['Status Karyawan', user.status_karyawan ? user.status_karyawan.toUpperCase() : '-'],
        ['Tipe Kerja', (user.tipe_kerja || 'NON-SHIFT').toUpperCase()],
        ['Tanggal Masuk', formatDate(user.tanggal_masuk)],
        ['Tanggal Kontrak Berakhir', formatDate(user.tanggal_kontrak_berakhir)],
        ['Lokasi Kerja', user.lokasi_kerja || '-'],
        ['Lokasi Proyek', user.lokasi_proyek || '-'],
        ['Atasan Langsung', user.atasan_langsung || '-'],
        ['Nama Atasan', user.nama_atasan || '-'],
      ];

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 6,
        head: [['II. INFORMASI KEPEGAWAIAN & PENEMPATAN', '']],
        body: kepegawaianRows,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold', fillColor: [245, 247, 250], textColor: [50, 50, 50] },
          1: { cellWidth: 125, textColor: [30, 30, 30] },
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: 'middle',
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        margin: { left: 15, right: 15 },
      });

      // SECTION 3: PENDIDIKAN & KONTAK
      const pendidikanRows = [
        ['Jenjang Pendidikan', user.jenjang_pendidikan || '-'],
        ['Institusi / Universitas', user.institusi || '-'],
        ['Jurusan', user.jurusan || '-'],
        ['Tahun Lulus', user.tahun_lulus ? String(user.tahun_lulus) : '-'],
        ['Nomor HP / WhatsApp', user.no_hp || '-'],
        ['Email', user.email || '-'],
      ];

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 6,
        head: [['III. PENDIDIKAN & KONTAK', '']],
        body: pendidikanRows,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold', fillColor: [245, 247, 250], textColor: [50, 50, 50] },
          1: { cellWidth: 125, textColor: [30, 30, 30] },
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: 'middle',
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          // Footer
          const pageHeight = pdf.internal.pageSize.getHeight();
          pdf.setFontSize(8);
          pdf.setTextColor(130, 130, 130);
          pdf.text(
            'Dokumen ini dicetak secara otomatis dari Sistem HRIS PT. Banggai Sentral Sulawesi.',
            15,
            pageHeight - 8
          );
          pdf.text(
            `Halaman ${data.pageNumber} dari ${pdf.internal.getNumberOfPages()}`,
            pageWidth - 15,
            pageHeight - 8,
            { align: 'right' }
          );
        },
      });

      const safeName = (user.nama_lengkap || user.username || 'Karyawan').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Data_Pribadi_${safeName}.pdf`);

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'File PDF Data Pribadi berhasil diunduh!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Gagal generate PDF:', err);
      Swal.fire('Error', 'Gagal membuat dokumen PDF: ' + err.message, 'error');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // ==========================================
  // 2. UNDUH EXCEL
  // ==========================================
  const handleDownloadExcel = async () => {
    if (!user) {
      Swal.fire('Perhatian', 'Data pribadi belum tersedia untuk diunduh.', 'warning');
      return;
    }

    try {
      setDownloadingExcel(true);
      Swal.fire({
        title: 'Menyiapkan Excel...',
        text: 'Sedang mengunduh file',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const userId = localStorage.getItem('userId');
      const response = await api.get(`/api/karyawan/export-excel/detail/${userId}`, {
        responseType: 'blob',
      });

      const safeName = (user.nama_lengkap || user.username || 'Karyawan').replace(/[^a-zA-Z0-9]/g, '_');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Data_Pribadi_${safeName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'File Excel Data Pribadi berhasil diunduh!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Gagal download Excel:', err);
      Swal.fire('Error', 'Gagal mengunduh file Excel: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="data-container">
        <div className="loading-card">
          <div className="spinner-border text-primary me-2" role="status"></div>
          <span>Memuat Informasi Profil...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="data-container">
        <div className="empty-state-card">
          <div className="empty-icon">
            <i className="bi bi-person-x"></i>
          </div>
          <h2>Data Pribadi Belum Tersedia</h2>
          <p>Data profil Anda belum dilengkapi oleh HRD. Silakan hubungi bagian HRD untuk melengkapi biodata.</p>
        </div>
      </div>
    );
  }

  // Komponen Baris Informasi yang Rapi
  const InfoItem = ({ label, value }) => (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '-'}</span>
    </div>
  );

  return (
    <div className="data-container">
      <div className="profile-card">
        {/* Profile Header dengan Tombol Download */}
        <div className="profile-header">
          <div className="header-info">
            <h2>Profil Data Pribadi</h2>
            <p className="subtitle">Biodata dan informasi kepegawaian Anda di PT. Banggai Sentral Sulawesi</p>
          </div>
          <div className="header-actions">
            <button
              className="btn-download-pdf"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || downloadingExcel}
              title="Unduh Data Pribadi dalam format PDF"
            >
              <i className="bi bi-file-earmark-pdf-fill me-2"></i>
              {downloadingPDF ? 'Membuat PDF...' : 'Unduh PDF'}
            </button>
            <button
              className="btn-download-excel"
              onClick={handleDownloadExcel}
              disabled={downloadingPDF || downloadingExcel}
              title="Unduh Data Pribadi dalam format Excel"
            >
              <i className="bi bi-file-earmark-excel-fill me-2"></i>
              {downloadingExcel ? 'Mengunduh...' : 'Unduh Excel'}
            </button>
          </div>
        </div>

        {/* Highlight Card Karyawan */}
        <div className="profile-highlight">
          <div className="avatar-circle">
            {(user.nama_lengkap || user.username || 'K').charAt(0).toUpperCase()}
          </div>
          <div className="highlight-text">
            <h3>{user.nama_lengkap || user.username}</h3>
            <div className="highlight-tags">
              <span className="badge badge-dept">
                <i className="bi bi-briefcase me-1"></i>
                {user.jabatan || 'Karyawan'} - {user.divisi || 'Umum'}
              </span>
              <span className="badge badge-status">
                <i className="bi bi-person-check me-1"></i>
                Status: {user.status_karyawan || 'Tetap'}
              </span>
              <span className="badge badge-tipe">
                <i className="bi bi-clock-history me-1"></i>
                Tipe: {(user.tipe_kerja || 'non-shift').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Bagian 1: Informasi Pribadi */}
        <section className="profile-section">
          <h3 className="section-title">
            <i className="bi bi-person-lines-fill me-2"></i>Informasi Pribadi / Biodata
          </h3>
          <div className="info-grid">
            <InfoItem label="NIK" value={user.nik} />
            <InfoItem label="Nama Lengkap" value={user.nama_lengkap} />
            <InfoItem
              label="Tempat, Tgl Lahir"
              value={
                user.tanggal_lahir
                  ? `${user.tempat_lahir || '-'}, ${formatDate(user.tanggal_lahir)}`
                  : user.tempat_lahir || '-'
              }
            />
            <InfoItem
              label="Jenis Kelamin"
              value={user.jenis_kelamin === 'L' ? 'Laki-laki' : user.jenis_kelamin === 'P' ? 'Perempuan' : user.jenis_kelamin}
            />
            <InfoItem label="Agama" value={user.agama} />
            <InfoItem label="Status Perkawinan" value={user.status_perkawinan} />
            <InfoItem label="Kewarganegaraan" value={user.kewarganegaraan || 'Indonesia'} />
            <InfoItem label="Alamat Lengkap" value={user.alamat} />
          </div>
        </section>

        {/* Bagian 2: Informasi Kepegawaian */}
        <section className="profile-section">
          <h3 className="section-title">
            <i className="bi bi-building me-2"></i>Informasi Kepegawaian & Penempatan
          </h3>
          <div className="info-grid">
            <InfoItem label="NIP" value={user.nip} />
            <InfoItem label="Jabatan" value={user.jabatan} />
            <InfoItem label="Divisi" value={user.divisi} />
            <InfoItem label="Status Karyawan" value={user.status_karyawan} />
            <InfoItem label="Tipe Kerja" value={(user.tipe_kerja || 'non-shift').toUpperCase()} />
            <InfoItem label="Tanggal Masuk" value={formatDate(user.tanggal_masuk)} />
            <InfoItem label="Kontrak Berakhir" value={formatDate(user.tanggal_kontrak_berakhir)} />
            <InfoItem label="Lokasi Kerja" value={user.lokasi_kerja} />
            <InfoItem label="Lokasi Proyek" value={user.lokasi_proyek} />
            <InfoItem label="Atasan Langsung" value={user.atasan_langsung} />
            <InfoItem label="Nama Atasan" value={user.nama_atasan} />
          </div>
        </section>

        {/* Bagian 3: Informasi Pendidikan & Kontak */}
        <section className="profile-section">
          <h3 className="section-title">
            <i className="bi bi-mortarboard me-2"></i>Pendidikan & Kontak
          </h3>
          <div className="info-grid">
            <InfoItem label="Jenjang Pendidikan" value={user.jenjang_pendidikan} />
            <InfoItem label="Institusi / Universitas" value={user.institusi} />
            <InfoItem label="Jurusan" value={user.jurusan} />
            <InfoItem label="Tahun Lulus" value={user.tahun_lulus} />
            <InfoItem label="Nomor HP / WhatsApp" value={user.no_hp} />
            <InfoItem label="Email" value={user.email} />
          </div>
        </section>
      </div>
    </div>
  );
}
