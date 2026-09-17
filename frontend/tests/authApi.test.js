import { login, register } from '../src/api/authApi.js';
import { API_BASE_URL } from '../src/api/client.js';

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({ ok: true }) });
});

afterEach(() => {
  delete global.fetch;
});

test('login posts credentials to /api/v1/auth/login', async () => {
  await login('user@example.com', 'secret');
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/api/v1/auth/login`,
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
    }),
  );
});

test('register posts the new account to /api/v1/auth/register', async () => {
  await register('ksenia', 'user@example.com', 'secret');
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/api/v1/auth/register`,
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ username: 'ksenia', email: 'user@example.com', password: 'secret' }),
    }),
  );
});
