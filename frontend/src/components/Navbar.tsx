'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          📚 EduPlatform
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/courses" className="hover:underline">
                Курсы
              </Link>
              <Link href="/profile" className="hover:underline">
                {user.full_name} ({user.role})
              </Link>
              <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:underline">
                Войти
              </Link>
              <Link href="/auth/register" className="bg-green-500 px-3 py-1 rounded hover:bg-green-600">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}