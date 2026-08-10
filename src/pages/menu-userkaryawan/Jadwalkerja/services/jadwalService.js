import api from '../../../../config/api';

export const getKaryawanList = () => api.get('/api/jadwal/list');

export const getSkemaList = () => api.get('/api/skema');

export const getDailyWorkers = (tanggal) =>
  api.get('/api/jadwal/daily', { params: { tanggal } });

export const getJadwalDetail = (userId) =>
  api.get(`/api/jadwal/detail/${userId}`);

export const assignJadwal = (payload) =>
  api.post('/api/jadwal/assign', payload);

export const assignJadwalBulk = (payload) =>
  api.post('/api/jadwal/assign-bulk', payload);

export const deleteJadwal = (payload) =>
  api.delete('/api/jadwal/delete', { data: payload });

export const deleteJadwalBulk = (payload) =>
  api.delete('/api/jadwal/delete-bulk', { data: payload });
