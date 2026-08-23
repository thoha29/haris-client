import api from '../../../../config/api';

export const getMasterKomponen = async () => {
  return await api.get('/api/master-komponen');
};

export const createMasterKomponen = async (data) => {
  return await api.post('/api/master-komponen', data);
};

export const updateMasterKomponen = async (id, data) => {
  return await api.put(`/api/master-komponen/${id}`, data);
};

export const deleteMasterKomponen = async (id) => {
  return await api.delete(`/api/master-komponen/${id}`);
};

export const toggleStatusKomponen = async (id) => {
  return await api.patch(`/api/master-komponen/${id}/toggle`);
};
