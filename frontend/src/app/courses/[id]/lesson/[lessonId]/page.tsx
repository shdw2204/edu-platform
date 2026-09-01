'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api';
import { Lesson, Quiz, Question } from '@/lib/types';
import QuizComponent from '@/components/Quiz';

export default function LessonPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      // Получаем информацию об уроке
      coursesApi
        .getLessons(courseId as string)
        .then((res) => {
          const found = res.data.find((l: Lesson) => l.id === lessonId);
          setLesson(found || null);
        })
        .catch(() => setLesson(null));

      // Пытаемся получить тест
      coursesApi
        .getQuiz(lessonId as string)
        .then((res) => setQuiz(res.data))
        .catch(() => setQuiz(null))
        .finally(() => setLoading(false));
    }
  }, [courseId, lessonId]);

  if (loading) {
    return <div className="text-center text-xl">Загрузка...</div>;
  }

  if (!lesson) {
    return <div className="text-center text-xl text-red-500">Урок не найден</div>;
  }

  return (
    <div>
      <button
        onClick={() => router.push(`/courses/${courseId}`)}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Назад к курсу
      </button>
      <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
      <p className="text-gray-500 mb-6">
        Тип: {lesson.content_type} • Порядок: #{lesson.order}
      </p>

      {lesson.content_type === 'text' && lesson.text_content && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="prose max-w-none">{lesson.text_content}</div>
        </div>
      )}

      {lesson.content_type === 'video' && lesson.video_url && (
        <div className="bg-black rounded-lg overflow-hidden">
          <video controls className="w-full">
            <source src={lesson.video_url} type="video/mp4" />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      )}

      {lesson.content_type === 'quiz' && quiz && <QuizComponent quiz={quiz} lessonId={lesson.id} />}

      {lesson.content_type === 'quiz' && !quiz && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-800">Тест для этого урока ещё не создан.</p>
        </div>
      )}
    </div>
  );
}