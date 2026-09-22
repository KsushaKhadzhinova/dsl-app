import { apiFetch } from './client.js';

export function listDiagrams(token) {
  return apiFetch('/diagrams', { token });
}

export function getDiagram(id, token) {
  return apiFetch(`/diagrams/${id}`, { token });
}

export function createDiagram({ title, notation, dslContent }, token) {
  return apiFetch('/diagrams', {
    method: 'POST',
    token,
    body: { title, notation, dslContent },
  });
}

export function updateDiagram(id, { title, notation, dslContent, status }, token) {
  return apiFetch(`/diagrams/${id}`, {
    method: 'PUT',
    token,
    body: { title, notation, dslContent, status },
  });
}

export function deleteDiagram(id, token) {
  return apiFetch(`/diagrams/${id}`, {
    method: 'DELETE',
    token,
  });
}
