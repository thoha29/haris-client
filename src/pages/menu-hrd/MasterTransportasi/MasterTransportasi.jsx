import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import TransportasiTable from './components/TransportasiTable';
import TransportasiModal from './components/TransportasiModal';
import {
  getTransportasi,
  createTransportasi,
  updateTransportasi,
  deleteTransportasi,
} from './services/transportasiService';
import '../MasterKomponenRab/MasterKomponenRab.css';
import './MasterTransportasi.css';

const MasterTransportasi = () => {
  const [transportasiList, setTransportasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const fetchTransportasi = async () => {
    try {
      setLoading(true);
      const res = await getTransportasi();
      setTransportasiList(res.data || []);
    } catch (err) {
      console.error('Error fetching transportasi:', err);
      Swal.fire('Error', 'Gagal memuat data transportasi perusahaan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportasi();
  }, []);

  const handleOpenAdd = () => {
    setEditingData(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingData(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingData(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editingData) {
        await updateTransportasi(editingData.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data kendaraan berhasil diperbarui!',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createTransportasi(formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Kendaraan baru berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      handleCloseModal();
      fetchTransportasi();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data', 'error');
    }
  };

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({
      title: 'Hapus Kendaraan?',
      text: `Apakah Anda yakin ingin menghapus "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await deleteTransportasi(id);
        Swal.fire({
          icon: 'success',
          title: 'Dihapus',
          text: 'Data transportasi berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchTransportasi();
      } catch (err) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus data transportasi', 'error');
      }
    }
  };

  const filteredData = useMemo(() => {
    return (transportasiList || []).filter((item) => {
      return (
        (item.nama_transportasi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.no_transportasi || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [transportasiList, searchTerm]);

  return (
    <div className="hrd-page-container">
      <div className="hrd-card">
        {/* Header */}
        <div className="hrd-page-header">
          <div>
            <h2>Master Transportasi Perusahaan</h2>
            <p>Kelola daftar kendaraan operasional dinas milik perusahaan</p>
          </div>
          <div>
            <button type="button" className="btn-primary-custom" onClick={handleOpenAdd}>
              + Tambah Kendaraan
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hrd-filter-bar">
          <div className="filter-group search-group" style={{ maxWidth: '450px' }}>
            <label>Cari Kendaraan:</label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Ketik plat nomor atau nama kendaraan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <TransportasiTable
          data={filteredData}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      <TransportasiModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingData={editingData}
      />
    </div>
  );
};

export default MasterTransportasi;
