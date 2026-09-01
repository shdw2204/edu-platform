'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { coursesApi } from '@/lib/api';

export default function EditLessonPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'video',
    video_url: '',
    text_content: '',
    order: 1,
  });

  useEffect(() => {
    if (lessonId) {
      // Получаем урок через список уроков курса
      coursesApi
        .getLessons(courseId as string)
        .then((res) => {
          const lesson = res.data.find((l: any) => l.id === lessonId);
          if (lesson) {
            setFormData({
              title: lesson.title,
              content_type: lesson.content_type,
              video_url: lesson.video_url || '',
              text_content: lesson.text_content || '',
              order: lesson.order,
            });
          } else {
            setError('Урок не найден');
          }
        })
        .catch(() => setError('Ошибка загрузки урока'))
        .finally(() => setLoading(false));
    }
  }, [courseId, lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await coursesApi.updateLesson(lessonId as string, formData);
      router.push(`/courses/${courseId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении урока');
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="text-center text-xl">Загрузка...</div>;
  }

  if (!user || user.role !== 'teacher') {
    return <div className="text-center text-xl text-red-500">Доступ запрещён</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Редактировать урок</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Название урока *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Тип урока</label>
          <select
            name="content_type"
            value={formData.content_type}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          >
            <option value="video">Видео</option>
            <option value="text">Текст</option>
            <option value="quiz">Тест</option>
          </select>
        </div>

        {formData.content_type === 'video' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Ссылка на видео</label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
              placeholder="https://example.com/video.mp4"
            />
          </div>
        )}

        {formData.content_type === 'text' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Текст лекции</label>
            <textarea
              name="text_content"
              value={formData.text_content}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Порядковый номер</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="1"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex-1 bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400 transition"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}