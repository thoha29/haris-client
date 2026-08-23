import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import SppdFormFields from './components/SppdFormFields';
import UserRabFormSection from './components/UserRabFormSection';
import {
  createSppd,
  submitRab,
  getKaryawanList,
  getTransportasiList,
  getMasterKomponenActive,
} from './services/userSppdService';
import './UserSppd.css';

const FormSppd = () => {
  const currentUserId = localStorage.getItem('userId');

  const [karyawanList, setKaryawanList] = useState([]);
  const [transportasiList, setTransportasiList] = useState([]);
  const [masterKomponenList, setMasterKomponenList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_user: '',
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
        const [resKaryawan, resTransportasi, resKomponen] = await Promise.all([
          getKaryawanList(),
          getTransportasiList(),
          getMasterKomponenActive(),
        ]);
        setKaryawanList(resKaryawan.data || []);
        setTransportasiList(resTransportasi.data || []);
        setMasterKomponenList(resKomponen.data || []);

        setFormData((prev) => ({
          ...prev,
          nomor_sppd: '',
        }));
      } catch (err) {
        console.error('Error init form:', err);
        Swal.fire('Error', 'Gagal memuat data referensi', 'error');
      } finally {
        setLoadingData(false);
      }
    };

    initData();
  }, []);

  const handleReset = () => {
    setFormData({
      id_user: '',
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

    if (!formData.id_user) {
      Swal.fire('Peringatan', 'Silakan pilih karyawan yang ditugaskan!', 'warning');
      return;
    }

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

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        nomor_sppd: formData.nomor_sppd ? formData.nomor_sppd.trim() : '',
        id_user: Number(formData.id_user),
        id_creator: currentUserId ? Number(currentUserId) : null,
        barang_bawaan_pt: formData.barang_bawaan_pt ? Number(formData.barang_bawaan_pt) : null,
        barang_bawaan_karyawan: formData.barang_bawaan_karyawan ? Number(formData.barang_bawaan_karyawan) : null,
        transportasi_perusahaan: formData.transportasi_perusahaan ? Number(formData.transportasi_perusahaan) : null,
      };

      const resSppd = await createSppd(payload);
      const idSppd = resSppd.data.id_sppd;

      // Submit RAB if any items were configured
      if (idSppd && rabDetails.length > 0) {
        await submitRab(idSppd, rabDetails);
      }

      Swal.fire({
        icon: 'success',
        title: 'SPPD & RAB Berhasil Diterbitkan',
        text: 'Surat Perjalanan Dinas beserta rincian RAB telah dikirimkan ke HRD untuk diverifikasi.',
        timer: 2000,
        showConfirmButton: false,
      });

      handleReset();
    } catch (err) {
      console.error('Error create SPPD:', err);
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal membuat SPPD & RAB', 'error');
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
            <h2>Penerbitan Surat Perjalanan Dinas (SPPD) & RAB</h2>
            <p>Formulir penerbitan surat tugas dinas dan rincian anggaran biaya untuk verifikasi final HRD</p>
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Memuat data referensi...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <SppdFormFields
              formData={formData}
              setFormData={setFormData}
              karyawanList={karyawanList}
              transportasiList={transportasiList}
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
                {submitting ? 'Mengirim Data...' : 'Terbitkan SPPD & Ajukan RAB'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FormSppd;
