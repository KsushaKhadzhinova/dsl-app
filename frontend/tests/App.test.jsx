import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import * as diagramsApi from '../src/api/diagramsApi.js';

jest.mock('../src/api/diagramsApi.js');

beforeEach(() => {
  window.localStorage.clear();
  diagramsApi.listDiagrams.mockResolvedValue([]);
});

test('redirects an unauthenticated visitor from / to /login', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByText('DiagramCode')).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
});

test('renders the IDE at / for an authenticated visitor', async () => {
  window.localStorage.setItem('diagramcode.token', 'test-token');
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
  expect(await screen.findByTestId('mock-monaco-editor')).toBeInTheDocument();
});

test('renders the register page at /register', () => {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument();
});

test('redirects unknown routes to /', () => {
  render(
    <MemoryRouter initialEntries={['/unknown-route']}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
});
