# 🗄️ Схема базы данных (PostgreSQL)

Основные таблицы и связи для образовательной платформы.

---

## Таблица `users` (Пользователи)
| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Уникальный идентификатор |
| `email` | TEXT | Уникальный, для входа |
| `password_hash` | TEXT | Хеш пароля |
| `full_name` | TEXT | Полное имя |
| `role` | TEXT | `student`, `teacher`, `admin` |
| `grade` | INTEGER | Класс (для учеников) |
| `avatar_url` | TEXT | Ссылка на аватар в S3 |
| `created_at` | TIMESTAMP | Дата регистрации |
| `updated_at` | TIMESTAMP | Дата последнего обновления |

---

## Таблица `courses` (Курсы)
| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Уникальный идентификатор |
| `title` | TEXT | Название курса |
| `description` | TEXT | Описание |
| `subject` | TEXT | Предмет (математика, русский...) |
| `level` | TEXT | `beginner`, `intermediate`, `advanced` |
| `teacher_id` | UUID (FK → `users.id`) | Кто ведет курс |
| `price` | DECIMAL | Цена (0 — бесплатно) |
| `is_published` | BOOLEAN | Опубликован ли |

---

## Таблица `lessons` (Уроки)
| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Уникальный идентификатор |
| `course_id` | UUID (FK → `courses.id`) | Курс, к которому относится урок |
| `title` | TEXT | Название урока |
| `content_type` | TEXT | `video`, `text`, `quiz`, `assignment` |
| `video_url` | TEXT | Ссылка на видео в S3 (если `video`) |
| `text_content` | TEXT | Текст лекции (если `text`) |
| `order` | INTEGER | Порядковый номер в курсе |

---

## Таблица `progress` (Прогресс ученика)
| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Уникальный идентификатор |
| `user_id` | UUID (FK → `users.id`) | Ученик |
| `lesson_id` | UUID (FK → `lessons.id`) | Урок |
| `status` | TEXT | `not_started`, `in_progress`, `completed` |
| `score` | INTEGER | Баллы за тест (если есть) |
| `completed_at` | TIMESTAMP | Дата завершения |

---

## Таблица `achievements` (Достижения)
| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Уникальный идентификатор |
| `user_id` | UUID (FK → `users.id`) | Владелец достижения |
| `type` | TEXT | `first_lesson`, `perfect_score`, `10_lessons`... |
| `earned_at` | TIMESTAMP | Дата получения |