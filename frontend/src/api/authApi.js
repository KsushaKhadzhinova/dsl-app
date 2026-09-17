import { apiFetch } from './client.js';

export function login(email, password) {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(username, email, password) {
  return apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });
}
