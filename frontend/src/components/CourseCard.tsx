'use client';

import Link from 'next/link';
import { Course } from '@/lib/types';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h2 className="text-xl font-bold mb-2">{course.title}</h2>
      <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {course.subject}
        </span>
        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
          {course.level}
        </span>
      </div>
      <Link
        href={`/courses/${course.id}`}
        className="mt-4 block text-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        Перейти к курсу
      </Link>
    </div>
  );
}