import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import api from '../../../config/api';
import PTKPTable from './components/PTKPTable';
import PTKPModal from './components/PTKPModal';

export const MasterPTKP = () => {
  const [ptkpList, setPtkpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const fetchPTKP = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/master-ptkp');
      setPtkpList(res.data || []);
    } catch (err) {
      console.error('Error fetching PTKP:', err);
      Swal.fire('Error', 'Gagal memuat data PTKP perusahaan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTKP();
  }, []);

  const handleOpenAdd = () => {
    setEditingData(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    // console.log('DATA EDIT:', item);
    // console.log('ID EDIT:', item.id);
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
        await api.put(`/api/master-ptkp/${editingData.id_ptkp}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data PTKP berhasil diperbarui!',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post(`/api/master-ptkp`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'PTKP baru berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      handleCloseModal();
      fetchPTKP();
    } catch (err) {
      Swal.fire(
        'Gagal',
        err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data',
        'error'
      );
    }
  };

  const handleDelete = async (id, status) => {
    const result = await Swal.fire({
      title: 'Hapus PTKP?',
      text: `Apakah Anda yakin ingin menghapus "${status}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/master-ptkp/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'Dihapus',
          text: 'Data PTKP berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchPTKP();
      } catch (err) {
        Swal.fire(
          'Gagal',
          err.response?.data?.error || 'Gagal menghapus data PTKP',
          'error'
        );
      }
    }
  };

  const filteredData = useMemo(() => {
    return (ptkpList || []).filter((item) => {
      return (
        (item.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ptkp || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [ptkpList, searchTerm]);

  return (
    <div className="hrd-page-container">
      <div className="hrd-card">
        {/* Header */}
        <div className="hrd-page-header">
          <div>
            <h2>Master PTKP</h2>
            <p>Kelola daftar PTKP milik perusahaan</p>
          </div>
          <div>
            <button
              type="button"
              className="btn-primary-custom"
              onClick={handleOpenAdd}
            >
              + Tambah PTKP
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hrd-filter-bar">
          <div
            className="filter-group search-group"
            style={{ maxWidth: '450px' }}
          >
            <label>Cari PTKP:</label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Ketik status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <PTKPTable
          data={filteredData}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
      <PTKPModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingData={editingData}
      />
    </div>
  );
};
