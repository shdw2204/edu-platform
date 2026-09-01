import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.data.access_token);
    const userRes = await authApi.me();
    setUser(userRes.data);
    router.push('/courses');
  };

  const register = async (data: { email: string; password: string; full_name: string; role: string }) => {
    await authApi.register(data);
    await login(data.email, data.password);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push('/auth/login');
  };

  return { user, loading, login, register, logout };
}