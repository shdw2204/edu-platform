'use client';

import { Lesson } from '@/lib/types';
import Link from 'next/link';

export default function LessonList({ lessons, courseId }: { lessons: Lesson[]; courseId: string }) {
  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <Link
          key={lesson.id}
          href={`/courses/${courseId}/lesson/${lesson.id}`}
          className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition"
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-400 mr-2">#{lesson.order}</span>
              <span className="font-semibold">{lesson.title}</span>
            </div>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
              {lesson.content_type === 'video' && '🎬'}
              {lesson.content_type === 'text' && '📝'}
              {lesson.content_type === 'quiz' && '🧪'}
              {lesson.content_type === 'assignment' && '✏️'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}