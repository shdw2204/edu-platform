from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Course, Lesson
from schemas import CourseCreate, CourseUpdate, CourseResponse, LessonCreate, LessonResponse
from dependencies import get_current_user_id

router = APIRouter()

# ---- Эндпоинты для курсов ----

@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_user_id)
):
    """Создать новый курс (только для авторизованных учителей)"""
    db_course = Course(
        title=course.title,
        description=course.description,
        subject=course.subject,
        level=course.level,
        price=course.price,
        teacher_id=teacher_id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/courses", response_model=List[CourseResponse])
def get_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Получить список всех опубликованных курсов (доступно всем)"""
    courses = db.query(Course).filter(Course.is_published == True).offset(skip).limit(limit).all()
    return courses

@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Получить курс по ID с уроками (доступно всем)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Проверяем, опубликован ли курс (если нет - доступ запрещен)
    if not course.is_published:
        raise HTTPException(status_code=403, detail="Course is not published")
    
    return course

@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: str,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_user_id)
):
    """Обновить курс (только автор)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Сравниваем как строки, чтобы избежать ошибок типов
    if str(course.teacher_id) != str(teacher_id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    for key, value in course_update.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    
    db.commit()
    db.refresh(course)
    return course

@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_user_id)
):
    """Удалить курс (только автор)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if str(course.teacher_id) != str(teacher_id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(course)
    db.commit()

# ---- Эндпоинты для уроков ----

@router.post("/courses/{course_id}/lessons", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
def add_lesson(
    course_id: str,
    lesson: LessonCreate,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_user_id)
):
    """Добавить урок в курс (только автор)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if str(course.teacher_id) != str(teacher_id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_lesson = Lesson(
        course_id=course_id,
        title=lesson.title,
        content_type=lesson.content_type,
        video_url=lesson.video_url,
        text_content=lesson.text_content,
        order=lesson.order
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.get("/courses/{course_id}/lessons", response_model=List[LessonResponse])
def get_lessons(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Получить все уроки курса (доступно всем)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not course.is_published:
        raise HTTPException(status_code=403, detail="Course is not published")
    
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
    return lessons

@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: str,
    lesson_update: LessonCreate,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_user_id)
):
    """Обновить урок (только автор курса)"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    course = db.query(Course).filter(Course.id == lesson.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if str(course.teacher_id) != str(teacher_id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    for key, value in lesson_update.model_dump(exclude_unset=True).items():
        setattr(lesson, key, value)
    
    db.commit()
    db.refresh(lesson)
    return lesson

@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(
    lesson_id: str,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_user_id)
):
    """Удалить урок (только автор курса)"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    course = db.query(Course).filter(Course.id == lesson.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if str(course.teacher_id) != str(teacher_id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(lesson)
    db.commit()