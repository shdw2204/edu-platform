import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async (token: string) => {
    try {
      const res = await authApi.me();
      setUser(res.data);
      return true;
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.data.access_token);
      
      // Получаем данные пользователя
      const userRes = await authApi.me();
      setUser(userRes.data);
      
      // Принудительный переход на страницу курсов
      window.location.href = '/courses';
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; role: string }) => {
    await authApi.register(data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/auth/login';
  };

  return { user, loading, login, register, logout };
}