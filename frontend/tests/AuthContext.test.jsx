import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/auth/AuthContext.jsx';
import * as authApi from '../src/api/authApi.js';

jest.mock('../src/api/authApi.js');

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="token">{auth.token || 'none'}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="email">{auth.email || 'none'}</div>
      <button onClick={() => auth.login('user@example.com', 'secret')}>login</button>
      <button onClick={() => auth.register('user', 'user@example.com', 'secret')}>register</button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

test('starts unauthenticated when no token is stored', () => {
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
});

test('reads a previously stored token on mount', () => {
  window.localStorage.setItem('diagramcode.token', 'stored-token');
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
  expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
});

test('login stores the returned token and email, and persists it', async () => {
  authApi.login.mockResolvedValue({ access_token: 'new-token', token_type: 'bearer' });
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

  await act(async () => {
    screen.getByText('login').click();
  });

  expect(screen.getByTestId('token')).toHaveTextContent('new-token');
  expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
  expect(window.localStorage.getItem('diagramcode.token')).toBe('new-token');
});

test('register delegates to the API without touching the token', async () => {
  authApi.register.mockResolvedValue({ id: 'abc' });
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

  await act(async () => {
    screen.getByText('register').click();
  });

  expect(authApi.register).toHaveBeenCalledWith('user', 'user@example.com', 'secret');
  expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
});

test('logout clears the token from state and storage', async () => {
  authApi.login.mockResolvedValue({ access_token: 'new-token' });
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

  await act(async () => {
    screen.getByText('login').click();
  });
  act(() => {
    screen.getByText('logout').click();
  });

  expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  expect(window.localStorage.getItem('diagramcode.token')).toBeNull();
});
