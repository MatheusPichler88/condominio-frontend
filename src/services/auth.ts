// src/services/auth.ts
import api from './api';
import Cookies from 'js-cookie';

export async function login(login: string, password: string) {
  const res = await api.post('/auth/login', { login, password });
  Cookies.set('token', res.data.access_token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 1, // 1 dia
  });
  return res.data;
}

export function logout() {
  Cookies.remove('token');
  window.location.href = '/login';
}

export function getToken(): string | undefined {
  return Cookies.get('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
