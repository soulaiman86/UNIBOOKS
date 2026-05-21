import axios from 'axios';

const API_URL = 'http://192.168.11.105:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export default api;