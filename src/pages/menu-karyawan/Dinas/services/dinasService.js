import api from '../../../../config/api';

export const getMySppdList = async () => {
  const userId = localStorage.getItem('userId');
  return await api.get('/api/sppd', { params: { id_user: userId } });
};

export const getSppdDetail = async (id) => {
  return await api.get(`/api/sppd/${id}`);
};

export const requestCancelSppd = async (id_sppd, alasan_batal) => {
  const userId = localStorage.getItem('userId');
  return await api.post('/api/sppd/request-cancel', { id_sppd, alasan_batal, id_user: userId });
};

export const getRabBySppd = async (id_sppd) => {
  return await api.get(`/api/rab/sppd/${id_sppd}`);
};

export const getActiveMasterKomponen = async () => {
  return await api.get('/api/master-komponen/active');
};

export const getDinasTodayStatus = async (id_user) => {
  return await api.get(`/api/dinas-absensi/today?id_user=${id_user}`);
};

export const postCheckInDinas = async (data) => {
  return await api.post('/api/dinas-absensi/checkin', data);
};

export const createSppd = async (data) => {
  return await api.post('/api/sppd', data);
};

export const submitRab = async (id_sppd, details) => {
  return await api.post('/api/rab/submit', { id_sppd, details });
};

export const getMasterTransportasiList = async () => {
  return await api.get('/api/transportasi', { params: { status: 'available' } });
};

export const getDinasAbsensiHistory = async (id_user) => {
  return await api.get(`/api/dinas-absensi/history/${id_user}`);
};

