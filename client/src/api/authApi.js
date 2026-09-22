import { apiFetch } from './client.js';

export function register(email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
}

export function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
