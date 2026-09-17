import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import { LocaleProvider } from './i18n/LocaleContext.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { IdePage } from './pages/IdePage.jsx';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <IdePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
