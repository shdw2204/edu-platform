from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from database import get_db
from models import Course, Lesson, Progress, Quiz, Question, Option, QuizAttempt
from schemas import (
    CourseCreate, CourseUpdate, CourseResponse,
    LessonCreate, LessonResponse,
    ProgressCreate, ProgressUpdate, ProgressResponse,
    QuizCreate, QuizResponse, QuizAttemptCreate, QuizAttemptResponse,
    QuestionCreate, QuestionResponse, OptionCreate, OptionResponse
)
from dependencies import get_current_user_id

router = APIRouter()

# ---- Эндпоинты для курсов ----

@router.get("/courses", response_model=List[CourseResponse])
def get_courses(
    skip: int = 0,
    limit: int = 100,
    all_courses: bool = Query(False, description="Если true, возвращаются все курсы пользователя"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    print(f"🔍 all_courses: {all_courses}, user_id: {user_id}")
    if all_courses:
        courses = db.query(Course).filter(Course.teacher_id == user_id).all()
    else:
        courses = db.query(Course).filter(Course.is_published == True).offset(skip).limit(limit).all()
    return courses

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

@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Если курс не опубликован, только автор может его видеть
    if not course.is_published and str(course.teacher_id) != str(user_id):
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
    
    # Автоматически вычисляем следующий порядковый номер
    max_order = db.query(func.max(Lesson.order)).filter(Lesson.course_id == course_id).scalar()
    next_order = (max_order or 0) + 1
    
    db_lesson = Lesson(
        course_id=course_id,
        title=lesson.title,
        content_type=lesson.content_type,
        video_url=lesson.video_url,
        text_content=lesson.text_content,
        order=next_order
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.get("/courses/{course_id}/lessons", response_model=List[LessonResponse])
def get_lessons(
    course_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Получить все уроки курса (только авторизованные)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Если курс не опубликован, только автор может видеть уроки
    if not course.is_published and str(course.teacher_id) != str(user_id):
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

# ---- Эндпоинты для прогресса ----

@router.post("/progress", response_model=ProgressResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_progress(
    progress_data: ProgressCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Создать или обновить запись прогресса для урока"""
    # Проверяем, существует ли урок
    lesson = db.query(Lesson).filter(Lesson.id == progress_data.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Проверяем, есть ли уже запись прогресса
    existing_progress = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.lesson_id == progress_data.lesson_id
    ).first()
    
    if existing_progress:
        # Обновляем существующую запись
        if progress_data.status:
            existing_progress.status = progress_data.status
        if progress_data.score is not None:
            existing_progress.score = progress_data.score
        if progress_data.status == "completed" and not existing_progress.completed_at:
            existing_progress.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_progress)
        return existing_progress
    else:
        # Создаём новую запись
        db_progress = Progress(
            user_id=user_id,
            lesson_id=progress_data.lesson_id,
            status=progress_data.status,
            score=progress_data.score,
            completed_at=datetime.utcnow() if progress_data.status == "completed" else None
        )
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return db_progress

@router.get("/progress/course/{course_id}", response_model=List[ProgressResponse])
def get_course_progress(
    course_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Получить прогресс по всем урокам курса для текущего пользователя"""
    # Проверяем, существует ли курс
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Получаем все уроки курса
    lesson_ids = [lesson.id for lesson in course.lessons]
    
    # Получаем прогресс по этим урокам
    progress_records = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.lesson_id.in_(lesson_ids)
    ).all()
    
    return progress_records

@router.get("/progress/lesson/{lesson_id}", response_model=ProgressResponse)
def get_lesson_progress(
    lesson_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Получить прогресс по конкретному уроку"""
    progress = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.lesson_id == lesson_id
    ).first()
    
    if not progress:
        raise HTTPException(status_code=404, detail="Progress record not found")
    
    return progress

@router.get("/progress/course/{course_id}/summary")
def get_course_progress_summary(
    course_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Получить сводку прогресса по курсу"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    total_lessons = len(course.lessons)
    if total_lessons == 0:
        return {"total_lessons": 0, "completed_lessons": 0, "progress_percent": 0}
    
    completed_count = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.lesson_id.in_([lesson.id for lesson in course.lessons]),
        Progress.status == "completed"
    ).count()
    
    progress_percent = int((completed_count / total_lessons) * 100)
    
    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_count,
        "progress_percent": progress_percent
    }

# ---- Эндпоинты для тестов ----

@router.post("/lessons/{lesson_id}/quiz", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(
    lesson_id: str,
    quiz_data: QuizCreate,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_user_id)
):
    """Создать тест для урока (только автор курса)"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    course = db.query(Course).filter(Course.id == lesson.course_id).first()
    if str(course.teacher_id) != str(teacher_id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Проверяем, есть ли уже тест у урока
    existing_quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first()
    if existing_quiz:
        raise HTTPException(status_code=400, detail="Quiz already exists for this lesson")
    
    # Создаём тест
    db_quiz = Quiz(
        lesson_id=lesson_id,
        title=quiz_data.title,
        description=quiz_data.description
    )
    db.add(db_quiz)
    db.flush()
    
    # Создаём вопросы и варианты ответов
    for q_data in quiz_data.questions:
        db_question = Question(
            quiz_id=db_quiz.id,
            text=q_data.text,
            question_type=q_data.question_type,
            order=q_data.order
        )
        db.add(db_question)
        db.flush()
        
        for opt_data in q_data.options:
            db_option = Option(
                question_id=db_question.id,
                text=opt_data.text,
                is_correct=opt_data.is_correct,
                order=opt_data.order
            )
            db.add(db_option)
    
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.get("/lessons/{lesson_id}/quiz", response_model=QuizResponse)
def get_quiz(
    lesson_id: str,
    db: Session = Depends(get_db)
):
    """Получить тест урока (без правильных ответов для учеников)"""
    quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/quiz/attempt", response_model=QuizAttemptResponse)
def submit_quiz_attempt(
    attempt_data: QuizAttemptCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Отправить ответы на тест и получить результат"""
    quiz = db.query(Quiz).filter(Quiz.id == attempt_data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Получаем все вопросы и правильные ответы
    questions = db.query(Question).filter(Question.quiz_id == quiz.id).all()
    total_questions = len(questions)
    correct_answers = 0
    
    for question in questions:
        user_answer = attempt_data.answers.get(str(question.id))
        if not user_answer:
            continue
        
        # Для single_choice и multiple_choice сравниваем ID вариантов
        correct_options = [opt.id for opt in question.options if opt.is_correct]
        if question.question_type in ["single_choice", "multiple_choice"]:
            if str(user_answer) in [str(opt) for opt in correct_options]:
                correct_answers += 1
    
    # Рассчитываем процент
    percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    passed = percentage >= 60
    
    # Сохраняем попытку
    db_attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz.id,
        score=correct_answers,
        total_questions=total_questions,
        completed_at=datetime.utcnow()
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    
    # Также обновляем прогресс урока, если тест пройден
    if passed:
        existing_progress = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.lesson_id == quiz.lesson_id
        ).first()
        if existing_progress:
            existing_progress.status = "completed"
            existing_progress.score = correct_answers
            existing_progress.completed_at = datetime.utcnow()
        else:
            db_progress = Progress(
                user_id=user_id,
                lesson_id=quiz.lesson_id,
                status="completed",
                score=correct_answers,
                completed_at=datetime.utcnow()
            )
            db.add(db_progress)
        db.commit()
    
    return db_attempt

@router.get("/my-courses", response_model=List[CourseResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Получить все курсы текущего учителя (черновики + опубликованные)"""
    courses = db.query(Course).filter(Course.teacher_id == user_id).all()
    return courses