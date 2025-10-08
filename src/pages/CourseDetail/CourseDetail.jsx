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

// Улучшенная функция для парсинга вашего формата данных с валидацией JSON
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
      // Валидация JSON перед парсингом
      const validationResult = validateAndParseJSON(course.parts);
      if (validationResult.isValid) {
        partsData = validationResult.data;
      } else {
        console.error('Invalid JSON in course parts:', validationResult.error);
        console.log('Raw parts string:', course.parts);
        throw new Error(`Invalid JSON format: ${validationResult.error}`);
      }
    } else {
      // Если parts уже объект, проверяем его структуру
      partsData = validateCoursePartsStructure(course.parts);
    }
  } catch (parseError) {
    console.error('Parse error in generateCurriculum:', parseError);
    console.log('Course that caused error:', course);
    return [{
      id: 'error-module',
      title: 'Программа курса',
      lessons: [{
        id: 'error-lesson',
        title: 'Ошибка загрузки программы курса',
        content: 'Не удалось загрузить структуру курса. Пожалуйста, обратитесь к администратору.',
        images: []
      }]
    }];
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

  // Преобразуем данные в единый формат с дополнительной валидацией
  return partsData.map((module, index) => {
    // Валидация структуры модуля
    const validatedModule = validateModuleStructure(module, index);
    
    return {
      id: validatedModule.id || `module-${index}`,
      title: validatedModule.title || 'Модуль без названия',
      lessons: Array.isArray(validatedModule.lessons) 
        ? validatedModule.lessons.map((lesson, lessonIndex) => {
            // Валидация структуры урока
            const validatedLesson = validateLessonStructure(lesson, lessonIndex);
            return {
              id: validatedLesson.id || `lesson-${index}-${lessonIndex}`,
              title: validatedLesson.title || 'Лекция без названия',
              content: validatedLesson.content || '',
              images: Array.isArray(validatedLesson.images) ? validatedLesson.images : [],
              duration: validatedLesson.duration || '15 минут'
            };
          })
        : [{
            id: `empty-lesson-${index}`,
            title: 'Содержание модуля будет добавлено позже',
            content: '',
            images: []
          }]
    };
  });
}

// Функция для валидации и парсинга JSON с улучшенной обработкой ошибок
function validateAndParseJSON(jsonString) {
  try {
    // Первая попытка - прямой парсинг
    const parsed = JSON.parse(jsonString);
    return { isValid: true, data: parsed };
  } catch (firstError) {
    console.log('First parse attempt failed, trying to clean JSON...');
    
    try {
      // Вторая попытка - очистка JSON
      let cleanStr = jsonString.trim();
      
      // Убираем внешние кавычки если они есть и если это строка в кавычках
      if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
        cleanStr = cleanStr.slice(1, -1);
      }
      
      // Заменяем экранированные кавычки и символы
      cleanStr = cleanStr
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\');
      
      // Пробуем распарсить очищенную строку
      const parsed = JSON.parse(cleanStr);
      return { isValid: true, data: parsed };
    } catch (secondError) {
      console.log('Second parse attempt failed:', secondError);
      
      // Третья попытка - попробовать найти и исправить распространенные ошибки
      try {
        const fixedJson = fixCommonJSONErrors(jsonString);
        const parsed = JSON.parse(fixedJson);
        return { isValid: true, data: parsed };
      } catch (thirdError) {
        return { 
          isValid: false, 
          error: `JSON parsing failed: ${thirdError.message}`,
          originalError: firstError.message
        };
      }
    }
  }
}

// Функция для исправления распространенных ошибок в JSON
function fixCommonJSONErrors(jsonString) {
  let fixed = jsonString;
  
  // Исправление незакрытых кавычек
  fixed = fixed.replace(/([^\\])"/g, '$1\"');
  
  // Исправление незакрытых объектов и массивов
  const openBraces = (fixed.match(/{/g) || []).length;
  const closeBraces = (fixed.match(/}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  
  // Добавляем недостающие закрывающие скобки
  if (openBraces > closeBraces) {
    fixed += '}'.repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    fixed += ']'.repeat(openBrackets - closeBrackets);
  }
  
  // Исправление trailing commas
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');
  
  // Исправление отсутствующих запятых между свойствами
  fixed = fixed.replace(/"\s*"([^"])/g, '","$1');
  
  return fixed;
}

// Функция для валидации структуры course parts
function validateCoursePartsStructure(parts) {
  if (Array.isArray(parts)) {
    return parts;
  }
  
  if (typeof parts === 'object' && parts !== null) {
    // Если это единичный модуль, оборачиваем в массив
    return [parts];
  }
  
  console.warn('Unexpected course parts structure:', parts);
  return [];
}

// Функция для валидации структуры модуля
function validateModuleStructure(module, index) {
  if (!module || typeof module !== 'object') {
    console.warn(`Invalid module structure at index ${index}:`, module);
    return { id: `module-${index}`, title: 'Невалидный модуль', lessons: [] };
  }
  
  return {
    id: typeof module.id === 'string' ? module.id : `module-${index}`,
    title: typeof module.title === 'string' ? module.title : 'Модуль без названия',
    lessons: Array.isArray(module.lessons) ? module.lessons : []
  };
}

// Функция для валидации структуры урока
function validateLessonStructure(lesson, index) {
  if (!lesson || typeof lesson !== 'object') {
    console.warn(`Invalid lesson structure at index ${index}:`, lesson);
    return { id: `lesson-${index}`, title: 'Невалидный урок', content: '', images: [] };
  }
  
  return {
    id: typeof lesson.id === 'string' ? lesson.id : `lesson-${index}`,
    title: typeof lesson.title === 'string' ? lesson.title : 'Урок без названия',
    content: typeof lesson.content === 'string' ? lesson.content : '',
    images: Array.isArray(lesson.images) ? lesson.images : [],
    duration: typeof lesson.duration === 'string' ? lesson.duration : '15 минут'
  };
}

function getInstructorBio(category) {
  if (category === 'programming') {
    return 'Senior разработчик с 10-летним опытом. Работал в крупных IT-компаниях, участник международных конференций. Специализируется на веб-разработке и архитектуре приложений.';
  } else {
    return 'UI/UX дизайнер с 8-летним опытом. Работала над проектами для Fortune 500 компаний. Эксперт в области пользовательского опыта и визуального дизайна.';
  }
}

export default CourseDetail;