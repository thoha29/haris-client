// config/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/', // Pastikan port-nya 3000 sesuai .env http://api1.ptbss.id/
});

export default api;
