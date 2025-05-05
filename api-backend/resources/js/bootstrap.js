
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// Set default baseURL
const baseUrl = process.env.APP_URL || 'http://localhost:8000';
window.axios.defaults.baseURL = baseUrl;

// Enable credentials for cross-origin requests
window.axios.defaults.withCredentials = true;

console.log('Laravel backend JS initialized with baseURL:', baseUrl);
