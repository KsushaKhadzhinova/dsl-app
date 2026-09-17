import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/authApi.js';

const TOKEN_STORAGE_KEY = 'diagramcode.token';

export const AuthContext = createContext(null);

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [email, setEmail] = useState(null);

  const login = useCallback(async (loginEmail, password) => {
    const response = await authApi.login(loginEmail, password);
    writeStoredToken(response.access_token);
    setToken(response.access_token);
    setEmail(loginEmail);
    return response;
  }, []);

  const register = useCallback(async (username, registerEmail, password) => {
    return authApi.register(username, registerEmail, password);
  }, []);

  const logout = useCallback(() => {
    writeStoredToken(null);
    setToken(null);
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({ token, email, isAuthenticated: Boolean(token), login, register, logout }),
    [token, email, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth должен вызываться внутри AuthProvider');
  }
  return ctx;
}
