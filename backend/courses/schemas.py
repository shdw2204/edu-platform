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