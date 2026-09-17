export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetch(path, { method = 'GET', body, token, raw = false } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Не удалось соединиться с сервером.', 0, null);
  }

  if (raw) {
    if (!response.ok) {
      throw new ApiError('Ошибка запроса.', response.status, null);
    }
    return response;
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail = payload && typeof payload === 'object' ? payload.detail : null;
    const message = typeof detail === 'string' ? detail : 'Ошибка запроса.';
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
