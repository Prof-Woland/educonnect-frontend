// src/pages/ModuleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import './CourseDetail.css';

const API_BASE_URL = 'http://localhost:3000';

function ModuleDetail() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { moduleIndex, courseName, moduleTitle } = location.state || {};

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Получаем курс из cookie или из API
        let courseData = Cookies.get('oneCourse');
        if (courseData) {
          try {
            courseData = JSON.parse(courseData);
          } catch (e) {
            console.error('Error parsing course from cookie:', e);
            courseData = await getCourse(courseId);
          }
          setCourse(courseData);
        } else {
          courseData = await getCourse(courseId);
          setCourse(courseData);
        }

        // Получаем модуль
        const curriculum = generateCurriculum(courseData);
        let moduleData;
        let moduleIndexFromId;

        // Ищем модуль по ID или индексу
        if (moduleIndex !== undefined) {
          moduleIndexFromId = moduleIndex;
          moduleData = curriculum[moduleIndex];
        } else {
          moduleIndexFromId = parseInt(moduleId.split('-')[1]);
          moduleData = curriculum[moduleIndexFromId];
        }
        
        if (!moduleData) {
          throw new Error('Модуль не найден');
        }

        setModule({
          ...moduleData,
          index: moduleIndexFromId
        });
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId, moduleId, moduleIndex]);

  const handleLessonClick = (lessonIndex) => {
    if (!module || !module.lessons) return;
    
    const lesson = module.lessons[lessonIndex];
    navigate(`/courses/${courseId}/lessons/${lesson.id}`, {
      state: {
        moduleIndex: module.index,
        lessonIndex,
        courseName: course?.name,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        lessonContent: lesson.content,
        lessonDuration: lesson.duration || '15 минут'
      }
    });
  };

  const handleBackToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  // Функция для получения количества уроков в модуле
  const getLessonsCountText = () => {
    const count = module?.lessons?.length || 0;
    if (count === 0) return 'В этом модуле пока нет лекций';
    if (count === 1) return 'Этот модуль содержит 1 лекцию';
    return `Этот модуль содержит ${count} лекций`;
  };

  // Функция для получения общего времени модуля
  const getModuleTotalTime = () => {
    if (!module?.lessons) return '~2 часа';
    
    const totalMinutes = module.lessons.reduce((total, lesson) => {
      const duration = lesson.duration || '15 минут';
      const match = duration.match(/(\d+)/);
      return total + (match ? parseInt(match[1]) : 15);
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `~${hours} ч ${minutes} мин` : `~${hours} ч`;
    }
    return `~${minutes} мин`;
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div className="course-detail">
        <div className="container">
          <div className="loading">Загрузка модуля...</div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1 className='course-none'>Ошибка</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/courses')} className="back-button">
            Вернуться к курсам
          </button>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1 className='course-none'>Модуль не найден</h1>
          <button onClick={handleBackToCourse} className="back-button">
            Вернуться к курсу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <div className="container">
        <div className="module-navigation">
          <button onClick={handleBackToCourse} className="back-button">
            ← Назад к курсу
          </button>
          <span className="breadcrumb">
            {course?.name || 'Курс'} → Модуль {module.index + 1}
          </span>
        </div>

        <div className="module-header-detailed">
          <h1>Модуль {module.index + 1}: {module.title || 'Без названия'}</h1>
          <p className="module-description">
            {getLessonsCountText()}, которые помогут вам освоить ключевые концепции. Общее время изучения: {getModuleTotalTime()}.
          </p>
        </div>

        <div className="lessons-list">
          <h2>Лекции модуля</h2>
          <div className="lessons-container">
            {module.lessons && module.lessons.length > 0 ? (
              module.lessons.map((lesson, index) => (
                <div 
                  key={lesson.id || index}
                  className="lesson-card"
                  onClick={() => handleLessonClick(index)}
                >
                  <div className="lesson-number">
                    {index + 1}
                  </div>
                  <div className="lesson-info">
                    <h3 className="lesson-title">
                      {lesson.title}
                    </h3>
                    <p className="lesson-preview">
                      {lesson.content 
                        ? (lesson.content.substring(0, 100) + (lesson.content.length > 100 ? '...' : ''))
                        : `Лекция ${index + 1} модуля "${module.title || 'без названия'}"`}
                    </p>
                    <div className="lesson-meta">
                      <span className="lesson-duration">
                        {lesson.duration || '15 минут'}
                      </span>
                      <span className="lesson-arrow">→</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-lessons">
                <p>В этом модуле пока нет лекций</p>
              </div>
            )}
          </div>
        </div>

        <div className="module-progress">
          <h3>Прогресс по модулю</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }}></div>
          </div>
          <p className="progress-text">
            {module.lessons && module.lessons.length > 0 
              ? 'Начните изучение с первой лекции' 
              : 'Лекции будут добавлены в ближайшее время'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Вспомогательные функции
async function getCourse(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

// Такая же функция как в CourseDetail.js
function generateCurriculum(course) {
  console.log('Course parts:', course.parts);
  
  if (!course.parts) {
    return [{
      id: 'default-module',
      title: 'Программа курса',
      lessons: [{
        id: 'default-lesson',
        title: 'Информация о модулях будет доступна позже',
        content: '',
        images: []
      }]
    }];
  }

  let partsData;

  try {
    if (typeof course.parts === 'string') {
      // Убираем экранирование и парсим JSON
      let cleanStr = course.parts;
      
      // Убираем внешние кавычки если они есть
      if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
        cleanStr = cleanStr.slice(1, -1);
      }
      
      // Заменяем экранированные кавычки
      // let clean = text.replace(/\\"/g, '"');
      cleanStr = cleanStr.replaceAll('\\"', '\"');
      cleanStr = cleanStr.replaceAll('\\"', '\"');
      cleanStr = cleanStr.replaceAll('\n\n', '');
      cleanStr = cleanStr.replaceAll(/\\n/g, '');
      cleanStr = cleanStr.replaceAll('\\\\', ' ');
      cleanStr = cleanStr.replaceAll(/[а-яёА-ЯЁ]\\[а-яёА-ЯЁ]/g, ' ');
      cleanStr = cleanStr.replaceAll(/[0-9]\\[0-9]/g, ' ');
      cleanStr = cleanStr.replaceAll(/ \\[0-9]/g, ' ');
      cleanStr = cleanStr.replaceAll(/[0-9]\\ /g, ' ');
      cleanStr = cleanStr.replaceAll(/[0-9]\\./g, ' ');
      cleanStr = cleanStr.replaceAll(/.\\[а-яёА-ЯЁ]/g, ' ');
      cleanStr = cleanStr.replaceAll(/[а-яёА-ЯЁ]\\./g, ' ');
      cleanStr = cleanStr.replaceAll(/[.,; ]\\[.,; ]/g, ' ');
      cleanStr = cleanStr.replaceAll(/\;\\./g, ' ');
      cleanStr = cleanStr.replaceAll(/[а-яёА-ЯЁ]\\[.,; ]/g, ' ');
      cleanStr = cleanStr.replaceAll(/[a-zA-Z]\\./g, ' ');
      cleanStr = cleanStr.replaceAll(/.\\[a-zA-Z]/g, ' ');
      cleanStr = cleanStr.replaceAll(/.\\ /g, ' ');
      cleanStr = cleanStr.replaceAll(/ \\ /g, ' ');

      console.log(cleanStr)

      // console.log(clean)
      partsData = JSON.parse(cleanStr);
    } else {
      partsData = course.parts;
    }
  } catch (parseError) {
    console.error('Parse error:', parseError);
    return [{
      id: 'error-module',
      title: 'Программа курса',
      lessons: [{
        id: 'error-lesson',
        title: 'Ошибка загрузки программы курса',
        content: '',
        images: []
      }]
    }];
  }

  if (!Array.isArray(partsData)) {
    return [{
      id: 'empty-module',
      title: 'Программа курса',
      lessons: [{
        id: 'empty-lesson',
        title: 'Модули еще не добавлены',
        content: '',
        images: []
      }]
    }];
  }

  // Преобразуем данные в единый формат
  return partsData.map((module, index) => ({
    id: module.id || `module-${index}`,
    title: module.title || 'Модуль без названия',
    lessons: Array.isArray(module.lessons) 
      ? module.lessons.map((lesson, lessonIndex) => ({
          id: lesson.id || `lesson-${index}-${lessonIndex}`,
          title: lesson.title || 'Лекция без названия',
          content: lesson.content || '',
          images: lesson.images || [],
          duration: lesson.duration || '15 минут'
        }))
      : [{
          id: `empty-lesson-${index}`,
          title: 'Содержание модуля будет добавлено позже',
          content: '',
          images: []
        }]
  }));
}

export default ModuleDetail;