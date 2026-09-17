import { apiFetch, API_BASE_URL, ApiError } from './client.js';

export function renderDsl(dslContent, token) {
  return apiFetch('/api/v1/diagrams/render', {
    method: 'POST',
    token,
    body: { dsl_content: dslContent, message: '' },
  });
}

export function listDiagrams(token) {
  return apiFetch('/api/v1/diagrams', { token });
}

export function getDiagram(diagramId, token) {
  return apiFetch(`/api/v1/diagrams/${diagramId}`, { token });
}

export function createDiagram(title, notation, token) {
  return apiFetch('/api/v1/diagrams', {
    method: 'POST',
    token,
    body: { title, notation },
  });
}

export function saveVersion(diagramId, dslContent, message, token) {
  return apiFetch(`/api/v1/diagrams/${diagramId}/versions`, {
    method: 'POST',
    token,
    body: { dsl_content: dslContent, message: message || '' },
  });
}

export async function exportDiagram(diagramId, token) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/diagrams/${diagramId}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError('Не удалось соединиться с сервером.', 0, null);
  }
  if (!response.ok) {
    throw new ApiError('Не удалось экспортировать файл.', response.status, null);
  }
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : 'diagram.dsl';
  const content = await response.text();
  return { filename, content };
}
