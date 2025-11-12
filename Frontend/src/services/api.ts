import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  withCredentials: true, // for Sanctum cookie auth
});

// if token saved from previous session, set Authorization header
const saved = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null
if (saved) {
  API.defaults.headers.common['Authorization'] = `Bearer ${saved}`
}

export async function login(correo: string, password: string) {
  // No necesitamos CSRF cookie para login con token Bearer
  // Sanctum en modo API tokens no requiere CSRF para endpoints de autenticación
  return API.post('/auth/login', { correo, password });
}

export async function logout() {
  return API.post('/auth/logout');
}

export default API;
