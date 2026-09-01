from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime  # <-- Добавлен импорт

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    level: str = "beginner"
    price: float = 0.0

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None
    price: Optional[float] = None
    is_published: Optional[bool] = None

class CourseResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    subject: str
    level: str
    teacher_id: UUID
    price: float
    is_published: bool
    created_at: datetime
    updated_at: datetime
    lessons: Optional[List['LessonResponse']] = []

    class Config:
        from_attributes = True

class LessonCreate(BaseModel):
    title: str
    content_type: str = "video"
    video_url: Optional[str] = None
    text_content: Optional[str] = None
    order: int

class LessonResponse(BaseModel):
    id: UUID
    course_id: UUID
    title: str
    content_type: str
    video_url: Optional[str]
    text_content: Optional[str]
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Для обратной совместимости с Pydantic v2
CourseResponse.model_rebuild()

class ProgressCreate(BaseModel):
    lesson_id: UUID
    status: str = "in_progress"
    score: Optional[int] = None

class ProgressUpdate(BaseModel):
    status: Optional[str] = None
    score: Optional[int] = None
    completed_at: Optional[datetime] = None

class ProgressResponse(BaseModel):
    id: UUID
    user_id: UUID
    lesson_id: UUID
    status: str
    score: Optional[int]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Схемы для тестов
class OptionCreate(BaseModel):
    text: str
    is_correct: bool = False
    order: int

class OptionResponse(BaseModel):
    id: UUID
    text: str
    is_correct: bool
    order: int

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    text: str
    question_type: str = "single_choice"
    order: int
    options: List[OptionCreate]

class QuestionResponse(BaseModel):
    id: UUID
    text: str
    question_type: str
    order: int
    options: List[OptionResponse]

    class Config:
        from_attributes = True

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionCreate]

class QuizResponse(BaseModel):
    id: UUID
    lesson_id: UUID
    title: str
    description: Optional[str]
    questions: List[QuestionResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QuizAttemptCreate(BaseModel):
    quiz_id: UUID
    answers: dict  # {question_id: selected_option_id или текст ответа}

class QuizAttemptResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    score: Optional[int]
    total_questions: Optional[int]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class QuizResultResponse(BaseModel):
    attempt_id: UUID
    score: int
    total_questions: int
    percentage: float
    passed: bool  # Например, проходной балл 60%