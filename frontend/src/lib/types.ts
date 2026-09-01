export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  grade?: number;
  avatar_url?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  teacher_id: string;
  price: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  video_url?: string;
  text_content?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  order: number;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface Progress {
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
}