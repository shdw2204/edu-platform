'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    level: 'beginner',
    price: 0,
  });

  // Проверяем, что пользователь — учитель
  if (user && user.role !== 'teacher') {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-500">Доступ запрещён</h1>
        <p className="text-gray-600 mt-2">Только учителя могут создавать курсы.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await coursesApi.create(formData);
      router.push(`/courses/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при создании курса');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Создать новый курс</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Название курса *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
            placeholder="Введите название курса"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
            placeholder="Опишите, чему будет посвящён курс"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Предмет *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
            placeholder="Например: Математика, Программирование, Английский"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Уровень сложности</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          >
            <option value="beginner">Для начинающих</option>
            <option value="intermediate">Средний уровень</option>
            <option value="advanced">Продвинутый</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Цена (₽)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
            placeholder="0 — курс бесплатный"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Создание...' : 'Создать курс'}
        </button>
      </form>
    </div>
  );
}