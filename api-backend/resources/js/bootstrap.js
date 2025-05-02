
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set default baseURL to handle both development and production environments
const baseUrl = process.env.APP_URL || 'http://localhost:8000';
window.axios.defaults.baseURL = baseUrl;

// Enable credentials for cross-origin requests
window.axios.defaults.withCredentials = true;
