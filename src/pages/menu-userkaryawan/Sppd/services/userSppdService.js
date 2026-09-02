import api from '../../../../config/api';

export const createSppd = async (data) => {
  return await api.post('/api/sppd', data);
};

export const submitRab = async (id_sppd, details) => {
  return await api.post('/api/rab/submit', { id_sppd, details });
};

export const getSppdListUser = async () => {
  return await api.get('/api/sppd');
};

export const getSppdDetailUser = async (id) => {
  return await api.get(`/api/sppd/${id}`);
};

export const getKaryawanList = async () => {
  return await api.get('/api/karyawan');
};

export const getTransportasiList = async () => {
  return await api.get('/api/transportasi', { params: { status: 'available' } });
};

export const getRabBySppd = async (id_sppd) => {
  return await api.get(`/api/rab/sppd/${id_sppd}`);
};

// ─── ATASAN APPROVE / TOLAK SPPD ──────────────────────────────────────────
export const approveSppdAtasan = async (id_sppd, status, catatan) => {
  return await api.put('/api/sppd/approve-atasan', { id_sppd, status, catatan });
};

// ─── ATASAN BATALKAN SPPD ─────────────────────────────────────────────────
export const cancelSppdAtasan = async (id_sppd) => {
  return await api.put('/api/sppd/cancel-atasan', { id_sppd });
};

// ─── ATASAN REVIEW RAB (approve / minta revisi) ───────────────────────────
export const reviewRabAtasan = async (id_rab, action, catatan) => {
  return await api.put('/api/rab/review-atasan', { id_rab, action, catatan });
};

export const approveCancelAtasan = async (id_sppd, status) => {
  return await api.put('/api/sppd/approve-cancel-atasan', { id_sppd, status });
};

export const getMasterKomponenActive = async () => {
  return await api.get('/api/master-komponen/active');
};

