import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import KomponenTable from './components/KomponenTable';
import KomponenModal from './components/KomponenModal';
import {
  getMasterKomponen,
  createMasterKomponen,
  updateMasterKomponen,
  deleteMasterKomponen,
  toggleStatusKomponen,
} from './services/komponenService';
import './MasterKomponenRab.css';

const MasterKomponenRab = () => {
  const [komponenList, setKomponenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedTipe, setSelectedTipe] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const fetchKomponen = async () => {
    try {
      setLoading(true);
      const res = await getMasterKomponen();
      setKomponenList(res.data || []);
    } catch (err) {
      console.error('Error fetching master komponen:', err);
      Swal.fire('Error', 'Gagal memuat data master komponen RAB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKomponen();
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
        await updateMasterKomponen(editingData.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data komponen berhasil diperbarui!',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createMasterKomponen(formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Komponen baru berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      handleCloseModal();
      fetchKomponen();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data', 'error');
    }
  };

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({
      title: 'Hapus Komponen?',
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
        await deleteMasterKomponen(id);
        Swal.fire({
          icon: 'success',
          title: 'Dihapus',
          text: 'Komponen berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchKomponen();
      } catch (err) {
        Swal.fire('Gagal', err.response?.data?.error || 'Gagal menghapus komponen', 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleStatusKomponen(id);
      fetchKomponen();
    } catch (err) {
      Swal.fire('Gagal', 'Gagal mengubah status komponen', 'error');
    }
  };

  const kategoriOptions = useMemo(() => {
    const list = Array.from(new Set(komponenList.map((item) => item.kategori).filter(Boolean)));
    return list;
  }, [komponenList]);

  const filteredData = useMemo(() => {
    return (komponenList || []).filter((item) => {
      const matchSearch =
        (item.nama_komponen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.kategori || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchKategori = selectedKategori ? item.kategori === selectedKategori : true;
      const matchTipe = selectedTipe ? item.tipe_komponen === selectedTipe : true;
      const matchStatus = selectedStatus ? String(item.status_komponen_rab) === String(selectedStatus) : true;
      return matchSearch && matchKategori && matchTipe && matchStatus;
    });
  }, [komponenList, searchTerm, selectedKategori, selectedTipe, selectedStatus]);

  return (
    <div className="hrd-page-container">
      <div className="hrd-card">
        {/* Header */}
        <div className="hrd-page-header">
          <div>
            <h2>Master Komponen RAB</h2>
            <p>Kelola daftar komponen anggaran standar untuk perjalanan dinas</p>
          </div>
          <div>
            <button type="button" className="btn-primary-custom" onClick={handleOpenAdd}>
              + Tambah Komponen
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="hrd-filter-bar">
          <div className="filter-group search-group">
            <label>Cari Komponen:</label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Ketik nama komponen atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group select-group">
            <label>Filter Kategori:</label>
            <select
              className="form-control-clean"
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group select-group">
            <label>Filter Tipe:</label>
            <select
              className="form-control-clean"
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="harian">Harian</option>
              <option value="sekali">Sekali</option>
            </select>
          </div>

          <div className="filter-group select-group">
            <label>Filter Status:</label>
            <select
              className="form-control-clean"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Non-Aktif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <KomponenTable
          data={filteredData}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </div>

      <KomponenModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingData={editingData}
      />
    </div>
  );
};

export default MasterKomponenRab;
