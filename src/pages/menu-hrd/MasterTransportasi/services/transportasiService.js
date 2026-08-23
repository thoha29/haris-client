import api from '../../../../config/api';

export const getTransportasi = async () => {
  return await api.get('/api/transportasi');
};

export const createTransportasi = async (data) => {
  return await api.post('/api/transportasi', data);
};

export const updateTransportasi = async (id, data) => {
  return await api.put(`/api/transportasi/${id}`, data);
};

export const deleteTransportasi = async (id) => {
  return await api.delete(`/api/transportasi/${id}`);
};
