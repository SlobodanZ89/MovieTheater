import React, { createContext, useCallback, useMemo, useState } from 'react';

const TOKEN_KEY = 'kino.jwt';
const ROLE_KEY = 'kino.role';

export const AuthContext = createContext({
  token: null,
  role: null,
  isAuthenticated: false,
  setAuth: () => {},
  clearAuth: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY));

  const setAuth = useCallback(({ token: nextToken, role: nextRole }) => {
    if (typeof nextToken === 'string') {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    }
    if (typeof nextRole === 'string') {
      localStorage.setItem(ROLE_KEY, nextRole);
      setRole(nextRole);
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: Boolean(token),
      setAuth,
      clearAuth,
    }),
    [token, role, setAuth, clearAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function getStoredAuth() {
  return {
    token: localStorage.getItem(TOKEN_KEY),
    role: localStorage.getItem(ROLE_KEY),
  };
}

