'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function AddLessonPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'video',
    video_url: '',
    text_content: '',
    order: 1,
  });

  // Проверяем, что пользователь — учитель
  if (user && user.role !== 'teacher') {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-500">Доступ запрещён</h1>
        <p className="text-gray-600 mt-2">Только учителя могут добавлять уроки.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await coursesApi.addLesson(courseId as string, {
        ...formData,
        order: parseInt(formData.order as any),
      });
      router.push(`/courses/${courseId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при добавлении урока');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Добавить урок в курс</h1>

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
            placeholder="Введите название урока"
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
              placeholder="Введите текст лекции"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Добавление...' : 'Добавить урок'}
        </button>
      </form>
    </div>
  );
}