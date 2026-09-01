from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=False)
    level = Column(String(50), default="beginner")  # beginner, intermediate, advanced
    teacher_id = Column(UUID(as_uuid=True), nullable=False)  # Связь с пользователем из auth_service
    price = Column(Float, default=0.0)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связь с уроками (один ко многим)
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content_type = Column(String(50), default="video")  # video, text, quiz, assignment
    video_url = Column(Text, nullable=True)
    text_content = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Обратная связь с курсом
    course = relationship("Course", back_populates="lessons")