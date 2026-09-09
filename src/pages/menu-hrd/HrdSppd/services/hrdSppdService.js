import api from '../../../../config/api';

export const getAllSppdHRD = async () => {
  return await api.get('/api/sppd');
};

export const getSppdDetailHRD = async (id) => {
  return await api.get(`/api/sppd/${id}`);
};

export const approveSppdHRD = async (id_sppd, status, catatan_hrd) => {
  return await api.put('/api/sppd/approve-hrd', { id_sppd, status, catatan_hrd });
};

export const approveCancelHRD = async (id_sppd, status) => {
  return await api.put('/api/sppd/approve-cancel-hrd', { id_sppd, status });
};

export const getRabBySppd = async (id_sppd) => {
  return await api.get(`/api/rab/sppd/${id_sppd}`);
};

export const reviewRabHRD = async (id_rab, catatan) => {
  return await api.put('/api/rab/review-hrd', { id_rab, catatan });
};

export const approvePerubahanRabHRD = async (id_rab, status) => {
  return await api.put('/api/rab/approve-perubahan-hrd', { id_rab, status });
};

export const getMasterKomponenActive = async () => {
  return await api.get('/api/master-komponen/active');
};
