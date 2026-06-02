// config/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api1.ptbss.id/', // Pastikan port-nya 3000 sesuai .env http://api1.ptbss.id/
});

export default api;
