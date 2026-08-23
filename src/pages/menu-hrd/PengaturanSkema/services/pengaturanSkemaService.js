import api from '../../../../config/api';

export const getPengaturanSkema = async () => {
  return await api.get('/api/pengaturan-skema');
};

export const updatePengaturanSkema = async (key_setting, id_skema, keterangan) => {
  return await api.put('/api/pengaturan-skema', { key_setting, id_skema, keterangan });
};

export const getDaftarSkema = async () => {
  return await api.get('/api/skema');
};
