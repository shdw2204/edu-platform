'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { coursesApi } from '@/lib/api';
import { Course, Lesson } from '@/lib/types';
import LessonList from '@/components/LessonList';
import Link from 'next/link';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        coursesApi.getOne(id as string),
        coursesApi.getLessons(id as string),
      ])
        .then(([courseRes, lessonsRes]) => {
          setCourse(courseRes.data);
          setLessons(lessonsRes.data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="text-center text-xl">Загрузка...</div>;
  }

  if (!course) {
    return <div className="text-center text-xl text-red-500">Курс не найден</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/courses" className="text-blue-600 hover:underline">
          ← Назад к курсам
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="flex gap-4 mb-6">
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