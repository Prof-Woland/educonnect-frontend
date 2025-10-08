// src/pages/LessonDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import './CourseDetail.css';

const API_BASE_URL = 'http://localhost:3000';

const handleComplete = async (id) => {
    try {
      const token = JSON.parse(Cookies.get('token') || '{}');
      const response = await fetch(`${API_BASE_URL}/courses/complete/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        },
      });

     if (!response.ok) {
             if(response.status == 409){
               window.alert(`Вы уже записались на этот курс!`);
             }
             if(response.status == 401){
               await refresh(user.id); // Используем user вместо userData
             }
             const errorData = await response.json();
             if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
               ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
               ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
               ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
               ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
               Cookies.remove('user');
               Cookies.remove('token');
             }
             throw new Error(errorData.message);
           }
    } catch (error) {
      console.error('Error approving course:', error);
      window.alert(`Ошибка при одобрении курса: ${error.message}`);
    }
  };

function LessonDetail() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [curriculum, setCurriculum] = useState([]);
  
  const {
    moduleIndex,
    lessonIndex,
    courseName,
    moduleTitle,
    lessonTitle,
    lessonContent,
    lessonDuration
  } = location.state || {};

  useEffect(() => {
    fetchLessonData();
  }, [courseId, lessonId, location.state]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      
      // Получаем курс
      const courseData = await getCourse(courseId);
      setCourse(courseData);
      
      // Генерируем учебный план
      const curriculumData = generateCurriculum(courseData);
      setCurriculum(curriculumData);
      
      let foundLesson = null;
      let foundModuleIndex = moduleIndex;
      let foundLessonIndex = lessonIndex;

      // Если данные переданы через state, используем их
      if (location.state && lessonTitle) {
        foundLesson = {
          title: lessonTitle,
          content: lessonContent,
          duration: lessonDuration,
          moduleIndex,
          lessonIndex
        };
      } else {
        // Ищем урок в учебном плане
        for (let i = 0; i < curriculumData.length; i++) {
          const module = curriculumData[i];
          for (let j = 0; j < module.lessons.length; j++) {
            const currentLesson = module.lessons[j];
            if (currentLesson.id === lessonId || 
                currentLesson.id === `lesson-${i}-${j}` ||
                (moduleIndex === i && lessonIndex === j)) {
              foundLesson = {
                ...currentLesson,
                moduleIndex: i,
                lessonIndex: j
              };
              foundModuleIndex = i;
              foundLessonIndex = j;
              break;
            }
          }
          if (foundLesson) break;
        }
      }

      if (!foundLesson) {
        throw new Error('Лекция не найдена');
      }

      setLesson(foundLesson);
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToModule = () => {
    if (lesson?.moduleIndex !== undefined) {
      navigate(`/courses/${courseId}/modules/module-${lesson.moduleIndex}`, {
        state: {
          moduleIndex: lesson.moduleIndex,
          courseName: course?.name,
          moduleTitle: curriculum[lesson.moduleIndex]?.title
        }
      });
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  const getNextLesson = () => {
    if (!lesson || !curriculum.length) return null;
    
    const currentModule = curriculum[lesson.moduleIndex];
    const nextLessonIndex = lesson.lessonIndex + 1;
    
    // Следующая лекция в текущем модуле
    if (nextLessonIndex < currentModule.lessons.length) {
      return {
        moduleIndex: lesson.moduleIndex,
        lessonIndex: nextLessonIndex,
        lesson: currentModule.lessons[nextLessonIndex]
      };
    }
    
    // Первая лекция в следующем модуле
    const nextModuleIndex = lesson.moduleIndex + 1;
    if (nextModuleIndex < curriculum.length && curriculum[nextModuleIndex].lessons.length > 0) {
      return {
        moduleIndex: nextModuleIndex,
        lessonIndex: 0,
        lesson: curriculum[nextModuleIndex].lessons[0]
      };
    }
    
    return null;
  };

  const getPrevLesson = () => {
    if (!lesson || !curriculum.length) return null;
    
    const prevLessonIndex = lesson.lessonIndex - 1;
    
    // Предыдущая лекция в текущем модуле
    if (prevLessonIndex >= 0) {
      return {
        moduleIndex: lesson.moduleIndex,
        lessonIndex: prevLessonIndex,
        lesson: curriculum[lesson.moduleIndex].lessons[prevLessonIndex]
      };
    }
    
    // Последняя лекция в предыдущем модуле
    const prevModuleIndex = lesson.moduleIndex - 1;
    if (prevModuleIndex >= 0) {
      const prevModule = curriculum[prevModuleIndex];
      if (prevModule.lessons.length > 0) {
        return {
          moduleIndex: prevModuleIndex,
          lessonIndex: prevModule.lessons.length - 1,
          lesson: prevModule.lessons[prevModule.lessons.length - 1]
        };
      }
    }
    
    return null;
  };

  const handleNextLesson = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.lesson.id}`, {
        state: {
          moduleIndex: nextLesson.moduleIndex,
          lessonIndex: nextLesson.lessonIndex,
          courseName: course?.name,
          moduleTitle: curriculum[nextLesson.moduleIndex]?.title,
          lessonTitle: nextLesson.lesson.title,
          lessonContent: nextLesson.lesson.content,
          lessonDuration: nextLesson.lesson.duration
        }
      });
    } else {
      // Если следующей лекции нет, возвращаем к модулю
      handleBackToModule();
    }
  };

  const handlePrevLesson = () => {
    const prevLesson = getPrevLesson();
    if (prevLesson) {
      navigate(`/courses/${courseId}/lessons/${prevLesson.lesson.id}`, {
        state: {
          moduleIndex: prevLesson.moduleIndex,
          lessonIndex: prevLesson.lessonIndex,
          courseName: course?.name,
          moduleTitle: curriculum[prevLesson.moduleIndex]?.title,
          lessonTitle: prevLesson.lesson.title,
          lessonContent: prevLesson.lesson.content,
          lessonDuration: prevLesson.lesson.duration
        }
      });
    }
  };

  const handleCompleteLesson = () => {
    setCompleted(true);
    handleComplete(courseId)
    console.log(`Лекция ${lesson.title} отмечена как пройденная`);
  };

 
  // Функция для форматирования контента лекции
  const renderLessonContent = (content) => {
    if (!content) {
      return (
        <div className="empty-content">
          <h3>Контент лекции пока не добавлен</h3>
          <p>Преподаватель еще не добавил материалы для этой лекции.</p>
        </div>
      );
    }

    return content.split('\n').map((paragraph, index) => (
      paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
    ));
  };

  // Функция для отображения изображений лекции
  const renderLessonImages = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }

    return (
      <div className="lesson-images">
        <h4>Материалы лекции</h4>
        <div className="images-grid">
          {images.map((image, index) => (
            <div key={index} className="image-item">
              <img 
                src={image.url || image} 
                alt={`Материал ${index + 1}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Получение реального названия курса
  const getCourseName = () => {
    return courseName || course?.name || 'Курс';
  };

  // Получение реального названия модуля
  const getModuleTitle = () => {
    return moduleTitle || 
           (lesson?.moduleIndex !== undefined ? curriculum[lesson.moduleIndex]?.title : null) || 
           'Модуль';
  };

  // Получение реальной длительности лекции
  const getLessonDuration = () => {
    return lesson?.duration || lessonDuration || '15 минут';
  };

  if (loading) {
    return (
      <div className="course-detail">
        <div className="container">
          <div className="loading">Загрузка лекции...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1 className='course-none'>Лекция не найдена</h1>
          <p>Не удалось загрузить данные лекции. Пожалуйста, вернитесь к модулю и попробуйте снова.</p>
          <button onClick={() => navigate(`/courses/${courseId}`)} className="back-button">
            Вернуться к курсу
          </button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const prevLesson = getPrevLesson();


  return (
    <div className="course-detail">
      <div className="container">
        <div className="lesson-navigation">
          <button onClick={handleBackToModule} className="back-button">
            ← Назад к модулю
          </button>
          <span className="breadcrumb">
            {getCourseName()} → {getModuleTitle()} → Лекция {lesson.lessonIndex + 1}
          </span>
        </div>

        <div className="lesson-content">
          <header className="lesson-header">
            <h1>{lesson.title}</h1>
            <div className="lesson-meta-info">
              <span className="lesson-position">
                Лекция {lesson.lessonIndex + 1} • Модуль {(lesson.moduleIndex || 0) + 1}
              </span>
              <span className="lesson-duration">
                ⏱️ {getLessonDuration()}
              </span>
              {completed && (
                <span className="lesson-status completed">✅ Пройдено</span>
              )}
            </div>
          </header>

          <div className="lesson-body">
            <div className="content-section">
              <h2>Содержание лекции</h2>
              <div className="lesson-text">
                {renderLessonContent(lesson.content)}
                {renderLessonImages(lesson.images)}
              </div>
            </div>

            {!lesson.content && (
              <div className="content-section">
                <h2>Информация о лекции</h2>
                <div className="lesson-info-cards">
                  <div className="info-card">
                    <h3>📝 Описание</h3>
                    <p>Эта лекция является частью модуля "{getModuleTitle()}". Материалы будут добавлены преподавателем в ближайшее время.</p>
                  </div>
                  <div className="info-card">
                    <h3>🎯 Цель лекции</h3>
                    <p>Изучение ключевых концепций и получение практических навыков по теме "{lesson.title}".</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lesson-navigation-buttons">
            <button 
              onClick={handlePrevLesson} 
              className="nav-button prev-button"
              disabled={!prevLesson}
            >
              ← Предыдущая лекция
            </button>
            <button 
              onClick={handleNextLesson} 
              className="nav-button next-button"
              disabled={!nextLesson}
            >
              {nextLesson ? 'Следующая лекция →' : 'Завершить модуль'}
            </button>
          </div>

          <div className="completion-section">
            {!completed ? (
              <>
                <button className="complete-button" onClick={handleCompleteLesson}>
                  ✅ Отметить как пройденное
                </button>
                <p className="completion-hint">
                  После завершения лекции вы сможете отслеживать свой прогресс по курсу
                </p>
              </>
            ) : (
              <>
                <button className="complete-button completed" disabled>
                  ✅ Лекция пройдена
                </button>
                <p className="completion-hint">
                  {nextLesson 
                    ? 'Перейдите к следующей лекции для продолжения обучения' 
                    : 'Вы завершили все лекции этого модуля'}
                </p>
              </>
            )}
          </div>
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

 

export default LessonDetail;