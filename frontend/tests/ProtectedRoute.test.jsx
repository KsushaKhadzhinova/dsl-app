import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../src/auth/ProtectedRoute.jsx';
import { AuthContext } from '../src/auth/AuthContext.jsx';

function renderWithAuth(isAuthenticated) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated, token: isAuthenticated ? 'tok' : null }}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

test('redirects to /login when not authenticated', () => {
  renderWithAuth(false);
  expect(screen.getByText('Login page')).toBeInTheDocument();
});

test('renders children when authenticated', () => {
  renderWithAuth(true);
  expect(screen.getByText('Protected content')).toBeInTheDocument();
});
