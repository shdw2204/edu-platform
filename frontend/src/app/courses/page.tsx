'use client';

import { useEffect, useState } from 'react';
import { coursesApi } from '@/lib/api';
import { Course } from '@/lib/types';
import CourseCard from '@/components/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .getAll()
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-xl">Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Все курсы</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      {courses.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Пока нет доступных курсов</p>
      )}
    </div>
  );
}