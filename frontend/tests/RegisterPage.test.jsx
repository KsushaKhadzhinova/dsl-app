import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from '../src/pages/RegisterPage.jsx';
import { AuthProvider } from '../src/auth/AuthContext.jsx';
import { LocaleProvider } from '../src/i18n/LocaleContext.jsx';
import * as authApi from '../src/api/authApi.js';

jest.mock('../src/api/authApi.js');

function renderRegisterPage() {
  return render(
    <AuthProvider>
      <LocaleProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
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

function fillForm({ username = 'ksenia', email = 'user@example.com', password = 'secret123', confirm = 'secret123' } = {}) {
  fireEvent.change(screen.getByLabelText('Имя пользователя'), { target: { value: username } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Повтор пароля'), { target: { value: confirm } });
}

test('shows validation errors for empty fields', async () => {
  renderRegisterPage();
  fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

  expect(await screen.findAllByText('Это поле обязательно.')).toHaveLength(4);
  expect(authApi.register).not.toHaveBeenCalled();
});

test('shows a mismatch error when passwords differ', async () => {
  renderRegisterPage();
  fillForm({ confirm: 'different' });
  fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

  expect(await screen.findByText('Пароли не совпадают.')).toBeInTheDocument();
  expect(authApi.register).not.toHaveBeenCalled();
});

test('shows an email format error', async () => {
  renderRegisterPage();
  fillForm({ email: 'not-an-email' });
  fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

  expect(await screen.findByText('Введите корректный email.')).toBeInTheDocument();
});

test('registers, logs in, and navigates to the IDE on success', async () => {
  authApi.register.mockResolvedValue({ id: 'user-1' });
  authApi.login.mockResolvedValue({ access_token: 'token-123' });
  renderRegisterPage();

  fillForm();
  fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

  expect(await screen.findByText('IDE home')).toBeInTheDocument();
  expect(authApi.register).toHaveBeenCalledWith('ksenia', 'user@example.com', 'secret123');
  expect(authApi.login).toHaveBeenCalledWith('user@example.com', 'secret123');
});

test('surfaces a backend error such as an already-taken email', async () => {
  const { ApiError } = jest.requireActual('../src/api/client.js');
  authApi.register.mockRejectedValue(new ApiError('Email уже занят.', 400, null));
  renderRegisterPage();

  fillForm();
  fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

  expect(await screen.findByText('Email уже занят.')).toBeInTheDocument();
  expect(authApi.login).not.toHaveBeenCalled();
});
