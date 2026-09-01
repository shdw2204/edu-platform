'use client';

import { useState } from 'react';
import { Quiz, Option } from '@/lib/types';
import { coursesApi } from '@/lib/api';

export default function QuizComponent({ quiz, lessonId }: { quiz: Quiz; lessonId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number; completed: boolean } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.submitQuiz({
        quiz_id: quiz.id,
        answers: answers,
      });
      setResult({
        score: res.data.score,
        total: res.data.total_questions,
        completed: true,
      });
    } catch (error) {
      alert('Ошибка при отправке теста');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const percentage = (result.score / result.total) * 100;
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <h3 className="text-2xl font-bold mb-4">Результат теста</h3>
        <p className="text-4xl font-bold mb-2">
          {result.score} из {result.total}
        </p>
        <p className="text-xl mb-4">{percentage}%</p>
        {percentage >= 60 ? (
          <p className="text-green-600 font-bold">✅ Тест пройден!</p>
        ) : (
          <p className="text-red-600 font-bold">❌ Попробуйте ещё раз</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
      <p className="text-gray-600 mb-6">{quiz.description}</p>

      <form onSubmit={(e) => e.preventDefault()}>
        {quiz.questions.map((question) => (
          <div key={question.id} className="mb-6">
            <p className="font-semibold mb-2">
              {question.order}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option: Option) => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    onChange={() => handleSelect(question.id, option.id)}
                    checked={answers[question.id] === option.id}
                    className="w-4 h-4"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading || Object.keys(answers).length < quiz.questions.length}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Отправка...' : 'Отправить ответы'}
        </button>
        {Object.keys(answers).length < quiz.questions.length && (
          <p className="text-sm text-yellow-600 mt-2">
            Ответьте на все вопросы, чтобы отправить тест.
          </p>
        )}
      </form>
    </div>
  );
}