'use client';

import { useState, useCallback, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  nome: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar token ao montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (error) {
        // Token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    // Simples validação para MVP (sem API)
    // Em produção, isso chamaria um endpoint de autenticação
    if (email && password && password.length >= 3) {
      const mockUser: User = {
        id: '1',
        email,
        nome: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      };

      const mockToken = btoa(JSON.stringify({ email, timestamp: Date.now() }));

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      setUser(mockUser);
      setIsAuthenticated(true);

      return { success: true };
    }

    return { success: false, error: 'Email ou senha inválidos' };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
