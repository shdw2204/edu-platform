'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesApi } from '@/lib/api';
import { Course, Lesson } from '@/lib/types';
import LessonList from '@/components/LessonList';
import { useAuth } from '@/hooks/useAuth';

export default function CoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fetchCourseData = async () => {
    if (!id) return;
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        coursesApi.getOne(id as string),
        coursesApi.getLessons(id as string),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      if (error.response?.status === 403) {
        alert('Этот курс ещё не опубликован. Вы можете увидеть его только если вы автор.');
      }
    // Не сбрасываем курс, чтобы пользователь мог вернуться
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handlePublish = async () => {
    if (!course) return;
    setPublishing(true);
    try {
      await coursesApi.update(course.id, { is_published: true });
      setCourse({ ...course, is_published: true });
      alert('✅ Курс успешно опубликован! Теперь он виден всем ученикам.');
    } catch (error) {
      alert('❌ Ошибка при публикации курса. Попробуйте ещё раз.');
      console.error(error);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Загрузка...</div>;
  }

  if (!course) {
    return <div className="text-center text-xl text-red-500">Курс не найден</div>;
  }

  const isTeacher = user && user.role === 'teacher';
  const isAuthor = isTeacher && user.id === course.teacher_id;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <Link href="/courses" className="text-blue-600 hover:underline">
          ← Назад к курсам
        </Link>
        <div className="flex gap-2">
          {isAuthor && !course.is_published && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {publishing ? 'Публикация...' : '📢 Опубликовать курс'}
            </button>
          )}
          {isAuthor && (
            <Link
              href={`/courses/${course.id}/add-lesson`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Добавить урок
            </Link>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="flex flex-wrap gap-4 mb-6">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
          {course.subject}
        </span>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
          {course.level}
        </span>
        {course.price > 0 ? (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
            {course.price} ₽
          </span>
        ) : (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded">Бесплатно</span>
        )}
        {isAuthor && (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded">
            ✏️ Вы автор
          </span>
        )}
        {course.is_published ? (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
            ✅ Опубликован
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
            ⏳ Черновик
          </span>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Уроки</h2>
      {lessons.length === 0 ? (
        <p className="text-gray-500">В этом курсе пока нет уроков</p>
      ) : (
        <LessonList lessons={lessons} courseId={course.id} />
      )}
    </div>
  );
}