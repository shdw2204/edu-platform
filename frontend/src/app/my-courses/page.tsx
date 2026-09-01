'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Course } from '@/lib/types';
import { apiClient } from '@/lib/api';

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        const res = await apiClient.get('http://localhost:8001/api/my-courses');
        console.log('📦 Мои курсы:', res.data);
        setCourses(res.data);
      } catch (error) {
        console.error('❌ Ошибка загрузки курсов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (authLoading || loading) {
    return <div className="text-center text-xl">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-500">Доступ запрещён</h1>
        <p className="text-gray-600 mt-2">Только для авторизованных учителей.</p>
      </div>
    );
  }

  if (user.role !== 'teacher') {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-500">Доступ запрещён</h1>
        <p className="text-gray-600 mt-2">Эта страница только для учителей.</p>
      </div>
    );
  }

  const handlePublish = async (courseId: string) => {
    try {
      await apiClient.put(`http://localhost:8001/api/courses/${courseId}`, {
        is_published: true
      });
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, is_published: true } : c
      ));
      alert('✅ Курс опубликован!');
    } catch (error) {
      alert('❌ Ошибка публикации');
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Мои курсы</h1>
        <Link
          href="/courses/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Создать курс
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-500 text-center py-10">У вас пока нет курсов. Создайте первый!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-bold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {course.subject}
                </span>
                {course.is_published ? (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✅ Опубликован
                  </span>
                ) : (
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    ⏳ Черновик
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/courses/${course.id}`}
                  className="flex-1 text-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                  Перейти
                </Link>
                {!course.is_published && (
                  <button
                    onClick={() => handlePublish(course.id)}
                    className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
                    title="Опубликовать курс"
                  >
                    📢
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}