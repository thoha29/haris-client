import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import SppdFormFieldsKaryawan from './components/SppdFormFieldsKaryawan';
import UserRabFormSection from '../../menu-userkaryawan/Sppd/components/UserRabFormSection';
import {
  createSppd,
  submitRab,
  getMasterTransportasiList,
  getActiveMasterKomponen,
} from './services/dinasService';
import '../../menu-userkaryawan/Sppd/UserSppd.css';

const PengajuanSppd = () => {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');
  const currentUsername = localStorage.getItem('username') || 'Karyawan';

  const [transportasiList, setTransportasiList] = useState([]);
  const [masterKomponenList, setMasterKomponenList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_user: currentUserId,
    id_creator: currentUserId || null,
    nomor_sppd: '',
    alamat_tujuan: '',
    tugas: '',
    transportasi_perusahaan: '',
    transportasi_umum: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    total_hari: 1,
    tempat_tinggal: 'Hotel',
    konsumsi: 'Nota/Kwitansi',
    barang_bawaan_pt: '',
    satuan_barang_pt: '',
    barang_bawaan_karyawan: '',
    satuan_barang_karyawan: '',
    ditujuan_melapor_kepada: 'Atasan',
    keterangan: '',
  });

  const [rabDetails, setRabDetails] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingData(true);
        const [resTransportasi, resKomponen] = await Promise.allSettled([
          getMasterTransportasiList(),
          getActiveMasterKomponen(),
        ]);

        if (resTransportasi.status === 'fulfilled') {
          setTransportasiList(resTransportasi.value?.data || []);
        } else {
          console.warn('Transportasi load warning:', resTransportasi.reason);
        }

        if (resKomponen.status === 'fulfilled') {
          setMasterKomponenList(resKomponen.value?.data || []);
        } else {
          console.warn('Master komponen load warning:', resKomponen.reason);
        }
      } catch (err) {
        console.error('Error init form pengajuan SPPD:', err);
      } finally {
        setLoadingData(false);
      }
    };

    initData();
  }, []);

  const handleReset = () => {
    setFormData({
      id_user: currentUserId,
      id_creator: currentUserId || null,
      nomor_sppd: '',
      alamat_tujuan: '',
      tugas: '',
      transportasi_perusahaan: '',
      transportasi_umum: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      total_hari: 1,
      tempat_tinggal: 'Hotel',
      konsumsi: 'Nota/Kwitansi',
      barang_bawaan_pt: '',
      satuan_barang_pt: '',
      barang_bawaan_karyawan: '',
      satuan_barang_karyawan: '',
      ditujuan_melapor_kepada: 'Atasan',
      keterangan: '',
    });
    setRabDetails([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.alamat_tujuan || !formData.alamat_tujuan.trim()) {
      Swal.fire('Peringatan', 'Silakan isi alamat / kota tujuan perjalanan dinas!', 'warning');
      return;
    }

    if (!formData.tanggal_mulai || !formData.tanggal_selesai) {
      Swal.fire('Peringatan', 'Silakan lengkapi tanggal mulai dan tanggal selesai dinas!', 'warning');
      return;
    }

    if (new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)) {
      Swal.fire('Peringatan', 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai!', 'warning');
      return;
    }

    if (rabDetails.length === 0) {
      const confirmResult = await Swal.fire({
        title: 'Rincian RAB Belum Diisi',
        text: 'Anda belum mengisi estimasi komponen biaya pada bagian RAB. Apakah Anda yakin ingin mengajukan SPPD tanpa rincian RAB?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Tetap Ajukan Tanpa RAB',
        cancelButtonText: 'Lengkapi RAB Sekarang',
        confirmButtonColor: '#0284c7',
        cancelButtonColor: '#16a34a',
      });
      if (!confirmResult.isConfirmed) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        nomor_sppd: formData.nomor_sppd ? formData.nomor_sppd.trim() : '',
        id_user: Number(currentUserId),
        id_creator: Number(currentUserId),
        barang_bawaan_pt: formData.barang_bawaan_pt ? Number(formData.barang_bawaan_pt) : null,
        barang_bawaan_karyawan: formData.barang_bawaan_karyawan ? Number(formData.barang_bawaan_karyawan) : null,
        transportasi_perusahaan: formData.transportasi_perusahaan ? Number(formData.transportasi_perusahaan) : null,
      };

      const resSppd = await createSppd(payload);
      const idSppd = resSppd.data.id_sppd;

      // Submit RAB jika ada rincian biaya yang diisi
      if (idSppd && rabDetails.length > 0) {
        await submitRab(idSppd, rabDetails);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Pengajuan SPPD & RAB Berhasil!',
        text: 'Surat Perjalanan Dinas dan Rencana Anggaran Biaya telah diajukan ke Atasan untuk direview.',
        confirmButtonText: 'Lihat Riwayat SPPD',
      });

      handleReset();
      navigate('/dinas');
    } catch (err) {
      console.error('Error submit SPPD:', err);
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal mengajukan SPPD & RAB', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sppd-page-container">
      <div className="sppd-card">
        {/* Header */}
        <div className="sppd-page-header">
          <div>
            <h2>Pengajuan Surat Perjalanan Dinas (SPPD) & RAB</h2>
            <p>Formulir pengajuan perjalanan dinas mandiri dan estimasi rincian anggaran biaya (RAB) untuk persetujuan atasan</p>
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Memuat data referensi...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <SppdFormFieldsKaryawan
              formData={formData}
              setFormData={setFormData}
              transportasiList={transportasiList}
              userInfo={{ username: currentUsername, userId: currentUserId }}
            />

            <UserRabFormSection
              tanggalMulai={formData.tanggal_mulai}
              tanggalSelesai={formData.tanggal_selesai}
              masterKomponenList={masterKomponenList}
              rabDetails={rabDetails}
              setRabDetails={setRabDetails}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn-secondary-custom"
                onClick={handleReset}
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="btn-primary-custom"
                disabled={submitting}
              >
                {submitting ? 'Mengajukan...' : 'Ajukan SPPD & RAB'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PengajuanSppd;
