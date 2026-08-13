import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  TargetModeSelector,
  SingleUserSelector,
  MultipleUserSelector,
  AllUsersBanner,
  BulkActionPanel,
  DailyWorkersTable,
} from './components';
import SelectSearch from '../../../components/SelectSearch';
import {
  getKaryawanList,
  getSkemaList,
  getDailyWorkers,
  getJadwalDetail,
  assignJadwal,
  assignJadwalBulk,
  deleteJadwal,
  deleteJadwalBulk,
} from './services/jadwalService';
import './SetJadwalKaryawan.css';

const SetJadwalKaryawan = () => {
  const [activeTab, setActiveTab] = useState('kalender');
  const [targetMode, setTargetMode] = useState('single'); // 'single', 'multiple', 'all'
  const [karyawanList, setKaryawanList] = useState([]);
  const [daftarSkema, setDaftarSkema] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedSkema, setSelectedSkema] = useState('');
  const [events, setEvents] = useState([]);
  const [dailyWorkers, setDailyWorkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDates, setSelectedDates] = useState([]);

  // Filter Target Penugasan States
  const [filterTipeKerja, setFilterTipeKerja] = useState('');
  const [filterLokasiKerja, setFilterLokasiKerja] = useState('');

  const lokasiOptions = useMemo(() => {
    const locations = Array.from(
      new Set(
        (karyawanList || [])
          .map((k) => k.lokasi_kerja)
          .filter((loc) => loc && loc.trim() !== '')
      )
    );
    return locations.map((loc) => ({ value: loc, label: loc }));
  }, [karyawanList]);

  const filteredKaryawanList = useMemo(() => {
    return (karyawanList || []).filter((k) => {
      const matchTipe = filterTipeKerja
        ? (k.tipe_kerja || 'non-shift') === filterTipeKerja
        : true;
      const matchLokasi = filterLokasiKerja
        ? k.lokasi_kerja === filterLokasiKerja
        : true;
      return matchTipe && matchLokasi;
    });
  }, [karyawanList, filterTipeKerja, filterLokasiKerja]);

  const initData = useCallback(async () => {
    try {
      const [resKaryawan, resSkema] = await Promise.all([
        getKaryawanList(),
        getSkemaList(),
      ]);
      setKaryawanList(resKaryawan.data);
      setDaftarSkema(resSkema.data);
    } catch (err) {
      console.error('Error API:', err);
    }
  }, []);

  const fetchDailyWorkers = useCallback(async (date) => {
    try {
      const res = await getDailyWorkers(date);
      setDailyWorkers(res.data);
      setSelectedDate(date);
    } catch (err) {
      setDailyWorkers([]);
    }
  }, []);

  const fetchUserEvents = useCallback(async () => {
    if (targetMode === 'single') {
      if (!selectedUser) {
        setEvents([]);
        return;
      }
      try {
        const res = await getJadwalDetail(selectedUser);
        const formattedEvents = res.data.map((item) => ({
          id: `${item.id_user}-${item.tanggal}-${item.id_skema}`,
          title: item.nama_skema,
          start: item.tanggal,
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          allDay: true,
          extendedProps: {
            id_user: item.id_user,
            tanggal: item.tanggal,
          },
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setEvents([]);
      }
    } else if (targetMode === 'multiple') {
      if (!selectedUsers || selectedUsers.length === 0) {
        setEvents([]);
        return;
      }
      try {
        const resArray = await Promise.all(
          selectedUsers.map((uid) =>
            getJadwalDetail(uid).catch(() => ({ data: [] }))
          )
        );
        const allEvents = resArray.flatMap((res, idx) => {
          const uid = selectedUsers[idx];
          const uObj = karyawanList.find(
            (k) => String(k.id_user) === String(uid)
          );
          const uName = uObj ? uObj.username : `User ${uid}`;
          return (res.data || []).map((item) => ({
            id: `${item.id_user}-${item.tanggal}-${item.id_skema}`,
            title: `${uName}: ${item.nama_skema}`,
            start: item.tanggal,
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            allDay: true,
            extendedProps: {
              id_user: item.id_user,
              tanggal: item.tanggal,
            },
          }));
        });
        setEvents(allEvents);
      } catch (err) {
        setEvents([]);
      }
    } else if (targetMode === 'all') {
      if (!karyawanList || karyawanList.length === 0) {
        setEvents([]);
        return;
      }
      try {
        const resArray = await Promise.all(
          karyawanList.map((k) =>
            getJadwalDetail(k.id_user).catch(() => ({ data: [] }))
          )
        );
        const allEvents = resArray.flatMap((res, idx) => {
          const uObj = karyawanList[idx];
          const uName = uObj ? uObj.username : 'Karyawan';
          return (res.data || []).map((item) => ({
            id: `${item.id_user}-${item.tanggal}-${item.id_skema}`,
            title: `${uName}: ${item.nama_skema}`,
            start: item.tanggal,
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            allDay: true,
            extendedProps: {
              id_user: item.id_user,
              tanggal: item.tanggal,
            },
          }));
        });
        setEvents(allEvents);
      } catch (err) {
        setEvents([]);
      }
    }
  }, [targetMode, selectedUser, selectedUsers, karyawanList]);

  useEffect(() => {
    initData();
    fetchDailyWorkers(selectedDate);
  }, [initData, fetchDailyWorkers, selectedDate]);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  const handleToggleUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uId) => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleDateClick = async (arg) => {
    if (targetMode === 'single' && !selectedUser) {
      fetchDailyWorkers(arg.dateStr);
      setActiveTab('daftar');
      return;
    }

    if (targetMode === 'multiple' && selectedUsers.length === 0) {
      Swal.fire(
        'Peringatan',
        'Pilih minimal 1 Karyawan terlebih dahulu.',
        'warning'
      );
      return;
    }

    if (!selectedSkema) {
      Swal.fire(
        'Peringatan',
        'Pilih Shift / Skema terlebih dahulu!',
        'warning'
      );
      return;
    }

    const skemaTerpilih = daftarSkema.find(
      (s) => String(s.id_skema) === String(selectedSkema)
    );

    let targetText = '';
    if (targetMode === 'all') {
      targetText = 'SELURUH Karyawan (Role Karyawan)';
    } else if (targetMode === 'multiple') {
      targetText = `${selectedUsers.length} Karyawan terpilih`;
    } else {
      const uObj = karyawanList.find(
        (k) => String(k.id_user) === String(selectedUser)
      );
      targetText = uObj ? uObj.username : `User #${selectedUser}`;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Penugasan Shift',
      text: `Set shift ${skemaTerpilih?.nama_skema} pada ${arg.dateStr} untuk ${targetText}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Set Shift',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        let payload = {
          id_skema: Number(selectedSkema),
          tanggal: arg.dateStr,
        };

        if (targetMode === 'all') {
          payload.target_all = true;
        } else if (targetMode === 'multiple') {
          payload.id_users = selectedUsers.map(Number);
        } else {
          payload.id_user = Number(selectedUser);
        }

        await assignJadwal(payload);
        fetchUserEvents();
        fetchDailyWorkers(arg.dateStr);
        Swal.fire('Berhasil!', 'Shift berhasil dijadwalkan', 'success');
      } catch (err) {
        Swal.fire(
          'Error',
          err.response?.data?.error || 'Gagal update shift',
          'error'
        );
      }
    }
  };

  const handleDateSelect = (selectionInfo) => {
    if (targetMode === 'single' && !selectedUser) {
      Swal.fire('Peringatan', 'Pilih Karyawan terlebih dahulu.', 'warning');
      return;
    }
    if (targetMode === 'multiple' && selectedUsers.length === 0) {
      Swal.fire(
        'Peringatan',
        'Pilih minimal 1 Karyawan terlebih dahulu.',
        'warning'
      );
      return;
    }

    let start = new Date(selectionInfo.startStr);
    let end = new Date(selectionInfo.endStr);
    let dateArray = [];

    while (start < end) {
      let year = start.getFullYear();
      let month = String(start.getMonth() + 1).padStart(2, '0');
      let day = String(start.getDate()).padStart(2, '0');
      dateArray.push(`${year}-${month}-${day}`);
      start.setDate(start.getDate() + 1);
    }

    if (dateArray.length === 1) {
      setSelectedDates([]);
      return;
    }

    setSelectedDates(dateArray);
  };

  const handleBulkAssign = async () => {
    if (!selectedSkema) {
      Swal.fire(
        'Peringatan',
        'Pilih Shift / Skema terlebih dahulu!',
        'warning'
      );
      return;
    }
    if (targetMode === 'single' && !selectedUser) {
      Swal.fire('Peringatan', 'Pilih Karyawan terlebih dahulu!', 'warning');
      return;
    }
    if (targetMode === 'multiple' && selectedUsers.length === 0) {
      Swal.fire(
        'Peringatan',
        'Pilih minimal 1 Karyawan terlebih dahulu!',
        'warning'
      );
      return;
    }

    const skemaTerpilih = daftarSkema.find(
      (s) => String(s.id_skema) === String(selectedSkema)
    );

    let targetText = '';
    if (targetMode === 'all') {
      targetText = 'SELURUH Karyawan (Role Karyawan)';
    } else if (targetMode === 'multiple') {
      targetText = `${selectedUsers.length} Karyawan terpilih`;
    } else {
      const uObj = karyawanList.find(
        (k) => String(k.id_user) === String(selectedUser)
      );
      targetText = uObj ? uObj.username : `User #${selectedUser}`;
    }

    const result = await Swal.fire({
      title: 'Plot Massal Shift',
      text: `Plot shift ${skemaTerpilih?.nama_skema} untuk ${selectedDates.length} hari (${selectedDates[0]} s/d ${selectedDates[selectedDates.length - 1]}) pada ${targetText}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Plot!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        let payload = {
          id_skema: Number(selectedSkema),
          tanggalArray: selectedDates,
        };

        if (targetMode === 'all') {
          payload.target_all = true;
        } else if (targetMode === 'multiple') {
          payload.id_users = selectedUsers.map(Number);
        } else {
          payload.id_user = Number(selectedUser);
        }

        await assignJadwalBulk(payload);
        fetchUserEvents();
        fetchDailyWorkers(selectedDates[0]);
        Swal.fire('Berhasil!', 'Berhasil plot jadwal massal!', 'success');
        setSelectedDates([]);
      } catch (err) {
        Swal.fire(
          'Gagal',
          'Gagal plotting massal: ' +
          (err.response?.data?.error || err.message),
          'error'
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    let targetText = '';
    if (targetMode === 'all') {
      targetText = 'SELURUH Karyawan';
    } else if (targetMode === 'multiple') {
      targetText = `${selectedUsers.length} Karyawan terpilih`;
    } else {
      const uObj = karyawanList.find(
        (k) => String(k.id_user) === String(selectedUser)
      );
      targetText = uObj ? uObj.username : `User #${selectedUser}`;
    }

    const result = await Swal.fire({
      title: 'Hapus Massal Shift',
      text: `Hapus jadwal shift untuk ${selectedDates.length} hari terpilih (${selectedDates[0]} s/d ${selectedDates[selectedDates.length - 1]}) pada ${targetText}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        let payload = {
          tanggalArray: selectedDates,
        };

        if (targetMode === 'all') {
          payload.target_all = true;
        } else if (targetMode === 'multiple') {
          payload.id_users = selectedUsers.map(Number);
        } else {
          payload.id_user = Number(selectedUser);
        }

        await deleteJadwalBulk(payload);
        fetchUserEvents();
        fetchDailyWorkers(selectedDates[0]);
        Swal.fire('Dihapus!', 'Shift berhasil dihapus!', 'success');
        setSelectedDates([]);
      } catch (err) {
        Swal.fire(
          'Gagal',
          'Gagal hapus massal: ' + (err.response?.data?.error || err.message),
          'error'
        );
      }
    }
  };

  const handleEventClick = async (clickInfo) => {
    const { id_user, tanggal } = clickInfo.event.extendedProps;
    const skemaName = clickInfo.event.title;

    const d = new Date(tanggal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const correctDate = `${year}-${month}-${day}`;

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus Shift',
      text: `Yakin ingin menghapus shift ${skemaName} pada tanggal ${correctDate}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await deleteJadwal({
          id_user: id_user,
          tanggal: correctDate,
        });
        fetchUserEvents();
        fetchDailyWorkers(selectedDate);
        Swal.fire('Dihapus!', 'Shift berhasil dihapus!', 'success');
      } catch (err) {
        Swal.fire(
          'Gagal',
          'Gagal menghapus shift: ' +
          (err.response?.data?.error || err.message),
          'error'
        );
      }
    }
  };

  return (
    <div className="jadwal-container">
      <div className="header-section">
        <h2>Manajemen Jadwal Shift</h2>
        <p className="subtitle">Kelola penugasan karyawan PT. BSS</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'kalender' ? 'active' : ''}`}
          onClick={() => setActiveTab('kalender')}
        >
          🗓️ Atur Jadwal (Kalender)
        </button>
        <button
          className={`tab-btn ${activeTab === 'daftar' ? 'active' : ''}`}
          onClick={() => setActiveTab('daftar')}
        >
          📋 Daftar Kerja Harian
        </button>
      </div>

      <div className="tab-content">
        {/* Tab Atur Jadwal */}
        <div style={{ display: activeTab === 'kalender' ? 'block' : 'none' }}>
          <div className="filter-card">
            <TargetModeSelector
              targetMode={targetMode}
              setTargetMode={setTargetMode}
            />

            <div className="input-group">
              <label className="filter-label">Shift / Skema</label>
              <SelectSearch
                options={daftarSkema.map((s) => ({
                  value: s.id_skema,
                  label: `${s.nama_skema} (${s.jam_masuk ? s.jam_masuk.substring(0, 5) : ''} - ${s.jam_keluar ? s.jam_keluar.substring(0, 5) : ''})`,
                }))}
                value={selectedSkema}
                onChange={(e) => setSelectedSkema(e.value)}
                placeholder="-- Pilih Shift --"
                searchPlaceholder="Cari shift/skema..."
                isClearable={true}
              />
            </div>

            <div className="input-group">
              <label className="filter-label">Filter Tipe Kerja Target</label>
              <SelectSearch
                options={[
                  { value: '', label: 'Semua Tipe Kerja' },
                  { value: 'non-shift', label: 'Non-Shift' },
                  { value: 'shift', label: 'Shift' },
                ]}
                value={filterTipeKerja}
                onChange={(e) => setFilterTipeKerja(e.value)}
                placeholder="Semua Tipe Kerja"
                isClearable={true}
              />
            </div>

            <div className="input-group">
              <label className="filter-label">Filter Lokasi Kerja Target</label>
              <SelectSearch
                options={[{ value: '', label: 'Semua Lokasi Kerja' }, ...lokasiOptions]}
                value={filterLokasiKerja}
                onChange={(e) => setFilterLokasiKerja(e.value)}
                placeholder="Semua Lokasi Kerja"
                isClearable={true}
              />
            </div>
          </div>

          {/* Area Pemilihan Target Dynamic */}
          {targetMode === 'single' && (
            <SingleUserSelector
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              karyawanList={filteredKaryawanList}
            />
          )}

          {targetMode === 'multiple' && (
            <MultipleUserSelector
              karyawanList={filteredKaryawanList}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              handleToggleUser={handleToggleUser}
              userSearchTerm={userSearchTerm}
              setUserSearchTerm={setUserSearchTerm}
            />
          )}

          {targetMode === 'all' && (
            <AllUsersBanner totalKaryawan={filteredKaryawanList.length} />
          )}

          <div className="calendar-card animate-fade-in" style={{ marginTop: '20px' }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              selectable={true}
              unselectAuto={false}
              select={handleDateSelect}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              locale="id"
              height="650px"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
            />
          </div>

          <BulkActionPanel
            selectedDates={selectedDates}
            handleBulkAssign={handleBulkAssign}
            handleBulkDelete={handleBulkDelete}
            onCancel={() => setSelectedDates([])}
          />
        </div>

        {/* Tab Daftar Kerja (Table Version) */}
        <div style={{ display: activeTab === 'daftar' ? 'block' : 'none' }}>
          <DailyWorkersTable
            selectedDate={selectedDate}
            fetchDailyWorkers={fetchDailyWorkers}
            dailyWorkers={dailyWorkers}
          />
        </div>
      </div>
    </div>
  );
};

export default SetJadwalKaryawan;
