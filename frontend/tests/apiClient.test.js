import { apiFetch, ApiError, API_BASE_URL } from '../src/api/client.js';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test('sends a JSON body with the bearer token and content-type header', async () => {
  global.fetch.mockResolvedValue({ ok: true, text: async () => JSON.stringify({ ok: true }) });

  const result = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    token: 'tok-123',
    body: { email: 'a@b.com' },
  });

  expect(result).toEqual({ ok: true });
  expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok-123' },
    body: JSON.stringify({ email: 'a@b.com' }),
  });
});

test('omits the Authorization header when there is no token', async () => {
  global.fetch.mockResolvedValue({ ok: true, text: async () => '' });
  await apiFetch('/api/v1/diagrams/render', { method: 'POST', body: { dsl_content: 'x' } });
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBeUndefined();
});

test('returns null-ish payload when the response body is empty', async () => {
  global.fetch.mockResolvedValue({ ok: true, text: async () => '' });
  const result = await apiFetch('/api/v1/health');
  expect(result).toBeNull();
});

test('throws an ApiError using the backend detail message on a non-ok response', async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 400,
    text: async () => JSON.stringify({ detail: 'Email уже занят.' }),
  });

  await expect(apiFetch('/api/v1/auth/register', { method: 'POST', body: {} })).rejects.toMatchObject({
    message: 'Email уже занят.',
    status: 400,
  });
});

test('falls back to a generic message when the error body has no detail field', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => '' });
  await expect(apiFetch('/api/v1/diagrams')).rejects.toMatchObject({ message: 'Ошибка запроса.', status: 500 });
});

test('wraps network failures in an ApiError with status 0', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(apiFetch('/api/v1/diagrams')).rejects.toBeInstanceOf(ApiError);
  await expect(apiFetch('/api/v1/diagrams')).rejects.toMatchObject({ status: 0 });
});

test('raw mode returns the response object directly on success', async () => {
  const fakeResponse = { ok: true };
  global.fetch.mockResolvedValue(fakeResponse);
  const result = await apiFetch('/api/v1/diagrams/x/export', { raw: true });
  expect(result).toBe(fakeResponse);
});

test('raw mode throws an ApiError on failure without reading the body', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 404 });
  await expect(apiFetch('/api/v1/diagrams/x/export', { raw: true })).rejects.toMatchObject({ status: 404 });
});
