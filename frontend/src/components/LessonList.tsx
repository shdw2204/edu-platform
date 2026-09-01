'use client';

import { Lesson } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LessonList({ lessons, courseId }: { lessons: Lesson[]; courseId: string }) {
  const { user } = useAuth();
  const isTeacher = user && user.role === 'teacher';

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <Link href={`/courses/${courseId}/lesson/${lesson.id}`} className="flex-1">
              <div>
                <span className="text-gray-400 mr-2">#{lesson.order}</span>
                <span className="font-semibold">{lesson.title}</span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {lesson.content_type === 'video' && '🎬'}
                {lesson.content_type === 'text' && '📝'}
                {lesson.content_type === 'quiz' && '🧪'}
                {lesson.content_type === 'assignment' && '✏️'}
              </span>
              {isTeacher && (
                <Link
                  href={`/courses/${courseId}/lesson/${lesson.id}/edit`}
                  className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                >
                  ✏️
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}