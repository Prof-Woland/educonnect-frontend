// src/pages/CourseDetail.js
import React, {useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './CourseDetail.css';
import { useEffect } from 'react';
import { refresh } from '../../context/AuthContext'
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'https://educonnect-backend-qrh6.onrender.com';

function CourseDetail(props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const uri = '../../../default.jpg'
  let user, token, level
  let isAuth = false;

  try{
    user = JSON.parse(Cookies.get('user'));
    token = JSON.parse(Cookies.get('token'));
    if(user){
      isAuth = true;
    }
  } catch{
    // Игнорируем ошибки парсинга
  }

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const data = await getOne(id);
        console.log(data)
        setCourse(data);
        
        // Проверяем запись на курс, если пользователь авторизован
        if (isAuth) {
          await checkEnrollment(id, token);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [id]);

  // Функция проверки записи на курс
  const checkEnrollment = async (courseId, userToken) => {
  try {
    setCheckingEnrollment(true);
    const response = await fetch(`${API_BASE_URL}/courses/check-enrollment/${courseId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.accessToken}`
      },
    });
    
    if (!response.ok) {
      // Если статус 404 - пользователь не записан, это нормально
      if (response.status === 404) {
        setIsEnrolled(false);
        return false;
      }
      
      if (response.status === 401) {
        if (user) {
          await refresh(user.id);
        }
        // После обновления токена можно повторить запрос, но пока просто возвращаем false
        setIsEnrolled(false);
        return false;
      }
      
      // Для других ошибок пробуем получить текст ошибки
      let errorText;
      try {
        errorText = await response.text();
        // Если получили текст, пробуем распарсить как JSON
        if (errorText) {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (parseError) {
        // Если не удалось распарсить как JSON, используем текст как есть
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
    }
    
    // Если ответ успешный, пробуем получить данные
    let data;
    try {
      const responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        setIsEnrolled(false);
        return false;
      }
    } catch (parseError) {
      console.error('Error parsing enrollment response:', parseError);
      setIsEnrolled(false);
      return false;
    }

    setIsEnrolled(data.isRecorded || false);
    return data.isRecorded || false;
    
  } catch (error) {
    console.error('Error checking enrollment:', error);
    setIsEnrolled(false);
    return false;
  } finally {
    setCheckingEnrollment(false);
  }
};

  // Функция для перехода к странице модуля
  const handleModuleClick = async (moduleId, moduleIndex) => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!isAuth) {
      navigate('/login');
      return;
    }

    // Проверяем запись на курс
    if (!isEnrolled) {
      const enrollConfirmed = window.confirm(
        'Вы не записаны на этот курс. Хотите записаться сейчас?'
      );
      
      if (enrollConfirmed) {
        await handleEnroll();
      }
      return;
    }

    // Если пользователь записан, переходим к модулю
    const curriculum = generateCurriculum(course);
    const module = curriculum[moduleIndex];
    
    navigate(`/courses/${id}/modules/${moduleId}`, { 
      state: { 
        moduleIndex,
        courseName: course?.name,
        moduleTitle: module?.title
      }
    });
  };

  // Функция для перехода к странице лекции
  const handleLessonClick = async (lessonId, moduleIndex, lessonIndex) => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!isAuth) {
      navigate('/login');
      return;
    }

    // Проверяем запись на курс
    if (!isEnrolled) {
      const enrollConfirmed = window.confirm(
        'Вы не записаны на этот курс. Хотите записаться сейчас?'
      );
      
      if (enrollConfirmed) {
        await handleEnroll();
      }
      return;
    }

    const curriculum = generateCurriculum(course);
    const module = curriculum[moduleIndex];
    const lesson = module.lessons[lessonIndex];
    
    navigate(`/courses/${id}/lessons/${lessonId}`, {
      state: {
        moduleIndex,
        lessonIndex,
        courseName: course?.name,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        lessonContent: lesson.content,
        lessonDuration: lesson.duration || '15 минут'
      }
    });
  };

  // Добавляем функцию recording с navigate
  async function recording(id, token, name) {
    console.log(id);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/record`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        if(response.status == 409){
          window.alert(`Вы уже записались на этот курс!`);
          setIsEnrolled(true); // Обновляем состояние, если уже записан
          return;
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
      
      const data = await response.json();
      setIsEnrolled(true); // Обновляем состояние после успешной записи
    
      window.alert(`Вы записались на курс: ${name}`);
      navigate('/'); // Добавляем navigate здесь
      return data;
    } catch (error) {
      console.error('Error fetching recording:', error);
      throw error;
    }
  }

  const handleEnroll = async () => {
    if(isAuth) {
      await recording(id, token, course?.name);
    } else {
      navigate('/login');
    }
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div className="course-detail">
        <div className="container">
          <div className="loading">Загрузка курса...</div>
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

  // Показываем если курс не найден
  if (!course) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1 className='course-none'>Курс не найден</h1>
          <button onClick={() => navigate('/courses')} className="back-button">
            Вернуться к курсам
          </button>
        </div>
      </div>
    );
  }


          if(course.level == 'легкий'){
            level = "Начальный"
          }
          else if(course.level == 'средний'){
            level = "Средний"
          }else if(course.level == 'тяжелый'){
            level = "Продвинутый"
          }else{
            level = "Не указан"
          }

  const curriculum = generateCurriculum(course);

  return (
    <div className="course-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Назад
        </button>
        
        <div className="course-header">
          <div className="course-image-large">
            <img src={uri} alt={course.name} />
          </div>
          <div className="course-info">
            <h1>{course.name}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-meta-detail">
              <div className="meta-item">
                <span className="label">Длительность:</span>
                <span className="value">{course.time}</span>
              </div>
              <div className="meta-item">
                <span className="label">Уровень:</span>
                <span className="value">{level}</span>
              </div>
              <div className="meta-item">
                <span className="label">Рейтинг:</span>
                <span className="value">★ {course.rating}</span>
              </div>
              <div className="meta-item">
                <span className="label">Студентов:</span>
                <span className="value">{course.studentsCount}</span>
              </div>
              <div className="meta-item">
                <span className="label">Категория:</span>
                <span className="value">
                  {course.category === 'programming' ? 'Программирование' : 'Дизайн'}
                </span>
              </div>
            </div>
            <div className="course-price-large">{course.cost}</div>
            
            {/* Статус записи на курс */}
            {isAuth && (
              <div className="enrollment-status">
                {checkingEnrollment ? (
                  <div className="enrollment-checking">Проверка записи...</div>
                ) : isEnrolled ? (
                  <div className="enrollment-badge enrolled">
                    ✅ Вы записаны на этот курс
                  </div>
                ) : (
                  <div className="enrollment-badge not-enrolled">
                    📝 Вы не записаны на этот курс
                  </div>
                )}
              </div>
            )}
            
            <button className="enroll-button-large" onClick={handleEnroll}>
              {isEnrolled ? 'Вы записаны' : 'Записаться на курс'}
            </button>
          </div>
        </div>

        <div className="course-content">
          <div className="content-section">
            <h2>О курсе</h2>
            <p>{course.detailDescription}</p>
          </div>

          <div className="content-section">
            <h2>Программа курса</h2>
            
            {/* Сообщение о необходимости записи */}
            {isAuth && !isEnrolled && !checkingEnrollment && (
              <div className="enrollment-notice">
                <p>Для доступа к материалам курса необходимо записаться на курс.</p>
              </div>
            )}
            
            <div className="curriculum">
              {curriculum.map((module, index) => (
                <div 
                  key={module.id || index} 
                  className={`module ${isEnrolled ? 'clickable-module' : 'module-disabled'}`}
                  onClick={() => isEnrolled && handleModuleClick(module.id || `module-${index}`, index)}
                >
                  <div className="module-header">
                    <h3>Модуль {index + 1}: {module.title}</h3>
                    {isEnrolled ? (
                      <span className="module-arrow">→</span>
                    ) : (
                      <span className="module-lock">🔒</span>
                    )}
                  </div>
                  <ul>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li 
                        key={lesson.id || lessonIndex} 
                        className={isEnrolled ? 'clickable-lesson' : 'lesson-disabled'}
                        onClick={(e) => {
                          if (!isEnrolled) return;
                          e.stopPropagation();
                          handleLessonClick(lesson.id || `lesson-${index}-${lessonIndex}`, index, lessonIndex);
                        }}
                      >
                        {lesson.title}
                        {!isEnrolled && <span className="lesson-lock"> 🔒</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2>Преподаватель</h2>
            <div className="instructor">
              <div className="instructor-info">
                <h3>{course.teacher}</h3>
                <p>{getInstructorBio(course.category)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Остальные функции остаются без изменений
function getCourseAudience(level) {
  const audiences = {
    'Начальный': 'начинающих без предварительного опыта',
    'Средний': 'студентов с базовыми знаниями',
    'Продвинутый': 'опытных разработчиков, желающих углубить знания'
  };
  return audiences[level] || 'всех желающих';
}

async function getOne(id){
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
    Cookies.set('oneCourse', JSON.stringify(data), {expires: 0.5})
    return data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    console.error('JSON validation error:', e.message);
    console.log('Error position:', e.position);
    if (str && e.position) {
      console.log('Context around error:', 
        str.substring(Math.max(0, e.position - 50), Math.min(str.length, e.position + 50))
      );
    }
    return false;
  }
}


// Обновленная функция для парсинга вашего формата данных
// Улучшенная функция для парсинга данных с обработкой ошибок
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

  if (typeof course.parts === 'string' && !isValidJSON(course.parts)) {
    console.log('JSON is invalid, trying to fix...');
    // ... остальной код
  }

  let partsData;

  try {
    if (typeof course.parts === 'string') {
      // Очистка и подготовка JSON строки
      let cleanStr = cleanJSONString(course.parts);
      console.log('Cleaned JSON string:', cleanStr.substring(0, 500) + '...');
      
      partsData = JSON.parse(cleanStr);
    } else {
      partsData = course.parts;
    }
  } catch (parseError) {
    console.error('Parse error in generateCurriculum:', parseError);
    console.log('Raw parts that caused error:', course.parts);
    
    // Попробуем альтернативные методы парсинга
    try {
      partsData = tryAlternativeParse(course.parts);
    } catch (secondError) {
      console.error('All parse attempts failed:', secondError);
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
  }

  if (!Array.isArray(partsData)) {
    console.warn('Course parts is not an array:', partsData);
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

  // Простое преобразование данных в единый формат
  return partsData.map((module, index) => {
    if (!module) {
      return {
        id: `module-${index}`,
        title: 'Модуль без названия',
        lessons: []
      };
    }

    return {
      id: module.id || `module-${index}`,
      title: module.title || 'Модуль без названия',
      lessons: Array.isArray(module.lessons) 
        ? module.lessons.map((lesson, lessonIndex) => {
            if (!lesson) {
              return {
                id: `lesson-${index}-${lessonIndex}`,
                title: 'Лекция без названия',
                content: '',
                images: [],
                duration: '15 минут'
              };
            }

            return {
              id: lesson.id || `lesson-${index}-${lessonIndex}`,
              title: lesson.title || 'Лекция без названия',
              content: lesson.content || '',
              images: Array.isArray(lesson.images) ? lesson.images : [],
              duration: lesson.duration || '15 минут'
            };
          })
        : []
    };
  });
}

// Функция для очистки JSON строки
function cleanJSONString(str) {
  if (typeof str !== 'string') return str;
  
  let cleaned = str
    // Убираем внешние кавычки если они есть
    .replace(/^"(.*)"$/, '$1')
    // Экранируем специальные символы JSON
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    // Убираем лишние обратные слеши
    .replace(/([^\\])\\"/g, '$1"')
    // Исправляем незакрытые кавычки
    .replace(/"\s*([^"{}\[\],:]+?)\s*"/g, '"$1"')
    // Убираем непечатаемые символы
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
  return cleaned;
}

// Альтернативный метод парсинга для проблемных JSON
function tryAlternativeParse(str) {
  if (typeof str !== 'string') return str;
  
  try {
    // Попытка 1: Прямой парсинг
    return JSON.parse(str);
  } catch (e1) {
    console.log('First parse attempt failed, trying alternatives...');
    
    try {
      // Попытка 2: Очистка и повторный парсинг
      let cleaned = cleanJSONString(str);
      return JSON.parse(cleaned);
    } catch (e2) {
      console.log('Second parse attempt failed');
      
      try {
        // Попытка 3: Ручное извлечение данных с помощью регулярных выражений
        return parseWithRegex(str);
      } catch (e3) {
        console.log('Regex parse failed');
        throw new Error('All parse methods failed');
      }
    }
  }
}

// Парсинг с помощью регулярных выражений для крайних случаев
function parseWithRegex(str) {
  const moduleRegex = /\{"id":(\d+),"title":"([^"]+)","lessons":(\[[\s\S]*?\])\}/g;
  const lessonRegex = /\{"id":(\d+),"title":"([^"]+)","content":"([\s\S]*?)","images":(\[[\s\S]*?\])\}/g;
  
  let modules = [];
  let match;
  
  while ((match = moduleRegex.exec(str)) !== null) {
    const [, id, title, lessonsStr] = match;
    const lessons = [];
    
    let lessonMatch;
    const lessonPattern = /\{"id":(\d+),"title":"([^"]+)","content":"([\s\S]*?)","images":(\[[\s\S]*?\])\}/g;
    
    while ((lessonMatch = lessonPattern.exec(lessonsStr)) !== null) {
      const [, lessonId, lessonTitle, lessonContent, imagesStr] = lessonMatch;
      lessons.push({
        id: parseInt(lessonId),
        title: lessonTitle,
        content: lessonContent.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
        images: imagesStr === '[]' ? [] : JSON.parse(imagesStr)
      });
    }
    
    modules.push({
      id: parseInt(id),
      title: title,
      lessons: lessons
    });
  }
  
  return modules;
}

function getInstructorBio(category) {
  if (category === 'programming') {
    return 'Senior разработчик с 10-летним опытом. Работал в крупных IT-компаниях, участник международных конференций. Специализируется на веб-разработке и архитектуре приложений.';
  } else {
    return 'UI/UX дизайнер с 8-летним опытом. Работала над проектами для Fortune 500 компаний. Эксперт в области пользовательского опыта и визуального дизайна.';
  }
}

export default CourseDetail;