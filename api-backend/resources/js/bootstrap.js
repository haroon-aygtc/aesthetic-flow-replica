
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// Set default baseURL to handle both development and production environments
const baseUrl = process.env.APP_URL || 'http://localhost:8000';
window.axios.defaults.baseURL = baseUrl;

// Enable credentials for cross-origin requests
window.axios.defaults.withCredentials = true;

// Set CORS headers
window.axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
window.axios.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
window.axios.defaults.headers.common['Access-Control-Allow-Headers'] = 'Content-Type, X-Auth-Token, Origin, Authorization, X-Requested-With';

console.log('Laravel backend JS initialized with baseURL:', baseUrl);
