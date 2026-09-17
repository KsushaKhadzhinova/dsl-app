import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../src/pages/LoginPage.jsx';
import { AuthProvider } from '../src/auth/AuthContext.jsx';
import { LocaleProvider } from '../src/i18n/LocaleContext.jsx';
import * as authApi from '../src/api/authApi.js';

jest.mock('../src/api/authApi.js');

function renderLoginPage() {
  return render(
    <AuthProvider>
      <LocaleProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>IDE home</div>} />
          </Routes>
        </MemoryRouter>
      </LocaleProvider>
    </AuthProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

test('shows validation errors for empty fields', async () => {
  renderLoginPage();
  fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

  expect(await screen.findAllByText('Это поле обязательно.')).toHaveLength(2);
  expect(authApi.login).not.toHaveBeenCalled();
});

test('shows a validation error for a malformed email', async () => {
  renderLoginPage();
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
  fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'secret123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

  expect(await screen.findByText('Введите корректный email.')).toBeInTheDocument();
  expect(authApi.login).not.toHaveBeenCalled();
});

test('submits valid credentials and navigates to the IDE on success', async () => {
  authApi.login.mockResolvedValue({ access_token: 'token-123' });
  renderLoginPage();

  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'secret123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

  expect(await screen.findByText('IDE home')).toBeInTheDocument();
  expect(authApi.login).toHaveBeenCalledWith('user@example.com', 'secret123');
});

test('shows the backend error message on failed login', async () => {
  const { ApiError } = jest.requireActual('../src/api/client.js');
  authApi.login.mockRejectedValue(new ApiError('Неверный email или пароль.', 401, null));
  renderLoginPage();

  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

  expect(await screen.findByText('Неверный email или пароль.')).toBeInTheDocument();
});
