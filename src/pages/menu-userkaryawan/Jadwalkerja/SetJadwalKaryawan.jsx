import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './SetJadwalKaryawan.css';

const SetJadwalKaryawan = () => {
  const [activeTab, setActiveTab] = useState('kalender');
  const [karyawanList, setKaryawanList] = useState([]);
  const [daftarSkema, setDaftarSkema] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSkema, setSelectedSkema] = useState('');
  const [events, setEvents] = useState([]);
  const [dailyWorkers, setDailyWorkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDates, setSelectedDates] = useState([]);

  const initData = useCallback(async () => {
    try {
      const [resKaryawan, resSkema] = await Promise.all([
        axios.get('http://localhost:3000/api/jadwal/list'),
        axios.get('http://localhost:3000/api/skema'),
      ]);
      setKaryawanList(resKaryawan.data);
      setDaftarSkema(resSkema.data);
    } catch (err) {
      console.error('Error API:', err);
    }
  }, []);

  const fetchDailyWorkers = useCallback(async (date) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/jadwal/daily?tanggal=${date}`
      );
      setDailyWorkers(res.data);
      setSelectedDate(date);
    } catch (err) {
      setDailyWorkers([]);
    }
  }, []);

  const fetchUserEvents = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/api/jadwal/detail/${userId}`
      );
      const formattedEvents = res.data.map((item) => ({
        id: `${item.id_user}-${item.tanggal}`,
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
  }, []);

  useEffect(() => {
    initData();
    fetchDailyWorkers(selectedDate);
  }, [initData, fetchDailyWorkers, selectedDate]);

  const handleDateClick = async (arg) => {
    if (!selectedUser || !selectedSkema) {
      fetchDailyWorkers(arg.dateStr);
      setActiveTab('daftar');
      return;
    }

    const skemaTerpilih = daftarSkema.find(
      (s) => String(s.id_skema) === String(selectedSkema)
    );

    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: `Set shift ${skemaTerpilih?.nama_skema} pada ${arg.dateStr}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.post('http://localhost:3000/api/jadwal/assign', {
          id_user: selectedUser,
          id_skema: selectedSkema,
          tanggal: arg.dateStr,
        });
        fetchUserEvents(selectedUser);
        fetchDailyWorkers(arg.dateStr);
        Swal.fire('Berhasil!', 'Shift dijadwalkan', 'success');
      } catch (err) {
        Swal.fire('Error', 'Gagal update', 'error');
      }
    }
  };

  const handleDateSelect = (selectionInfo) => {
    if (!selectedUser) {
      Swal.fire('Peringatan', 'Pilih Karyawan terlebih dahulu.', 'warning');
      return;
    }

    let start = new Date(selectionInfo.startStr);
    let end = new Date(selectionInfo.endStr);
    let dateArray = [];

    // FullCalendar endStr is exclusive, so we loop until start < end
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
    const skemaTerpilih = daftarSkema.find(
      (s) => String(s.id_skema) === String(selectedSkema)
    );

    const result = await Swal.fire({
      title: 'Plot Massal',
      text: `Plot shift ${skemaTerpilih?.nama_skema} untuk ${selectedDates.length} hari?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Plot!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.post('http://localhost:3000/api/jadwal/assign-bulk', {
          id_user: selectedUser,
          id_skema: selectedSkema,
          tanggalArray: selectedDates,
        });
        fetchUserEvents(selectedUser);
        fetchDailyWorkers(selectedDates[0]);
        Swal.fire('Berhasil!', 'Berhasil plot jadwal!', 'success');
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
    const result = await Swal.fire({
      title: 'Hapus Massal',
      text: `Hapus jadwal shift untuk ${selectedDates.length} hari terpilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/jadwal/delete-bulk`, {
          data: {
            id_user: selectedUser,
            tanggalArray: selectedDates,
          },
        });
        fetchUserEvents(selectedUser);
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

    // Extract localized YYYY-MM-DD to prevent timezone shifting (UTC Z to local time)
    const d = new Date(tanggal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const correctDate = `${year}-${month}-${day}`;

    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: `Yakin ingin menghapus shift ${skemaName} pada tanggal ${correctDate}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/jadwal/delete`, {
          data: {
            id_user: id_user,
            tanggal: correctDate,
          },
        });
        fetchUserEvents(selectedUser);
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
            <div className="input-group">
              <label>Karyawan</label>
              <select
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  fetchUserEvents(e.target.value);
                }}
                className="select-elite"
              >
                <option value="">-- Pilih Karyawan --</option>
                {karyawanList.map((k) => (
                  <option key={k.id_user} value={k.id_user}>
                    {k.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Shift / Skema</label>
              <select
                value={selectedSkema}
                onChange={(e) => setSelectedSkema(e.target.value)}
                className="select-elite"
              >
                <option value="">-- Pilih Shift --</option>
                {daftarSkema.map((s) => (
                  <option key={s.id_skema} value={s.id_skema}>
                    {s.nama_skema} ({s.jam_masuk.substring(0, 5)} -{' '}
                    {s.jam_keluar.substring(0, 5)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="calendar-card animate-fade-in">
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

          {selectedDates.length > 1 && (
            <div className="bulk-action-panel animate-fade-in">
              <p>
                <strong>{selectedDates.length} Hari Terpilih</strong> (
                {selectedDates[0]} s/d {selectedDates[selectedDates.length - 1]}
                )
              </p>
              <div className="btn-group-bulk">
                <button onClick={handleBulkAssign} className="btn-bulk-assign">
                  ✅ Plot Shift Terpilih
                </button>
                <button onClick={handleBulkDelete} className="btn-bulk-delete">
                  🗑️ Hapus Shift Terpilih
                </button>
                <button
                  onClick={() => setSelectedDates([])}
                  className="btn-bulk-cancel"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Daftar Kerja (Table Version) */}
        <div
          style={{ display: activeTab === 'daftar' ? 'block' : 'none' }}
          className="animate-fade-in"
        >
          <div className="table-controls">
            <div className="input-group">
              <label>Pilih Tanggal Monitoring</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => fetchDailyWorkers(e.target.value)}
                className="date-input-elite"
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="daily-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Karyawan</th>
                  <th>Nama Shift</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dailyWorkers.length > 0 ? (
                  dailyWorkers.map((w, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="font-bold">{w.username}</td>
                      <td>
                        <span className="badge-shift">{w.nama_skema}</span>
                      </td>
                      <td>{w.jam_masuk.substring(0, 5)}</td>
                      <td>{w.jam_keluar.substring(0, 5)}</td>
                      <td>
                        <span className="status-pill active">Terjadwal</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center no-data">
                      Tidak ada karyawan yang dijadwalkan pada tanggal ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetJadwalKaryawan;
