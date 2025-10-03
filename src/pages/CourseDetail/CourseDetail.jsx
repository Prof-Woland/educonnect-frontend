// src/pages/CourseDetail.js
import React, {useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './CourseDetail.css';
import { useEffect } from 'react';
import { refresh } from '../../context/AuthContext'
import { useAuth } from '../../context/AuthContext';

function CourseDetail(props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [id]);
  // Добавляем функцию recording с navigate
  async function recording(id, token, name) {
    console.log(id);
    try {
      const response = await fetch(`https://educonnect-backend-qrh6.onrender.com/courses/record`, {
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
            <button className="enroll-button-large" onClick={handleEnroll}>
              Записаться на курс
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
            <div className="curriculum">
              {generateCurriculum(course).map((module, index) => (
                <div key={index} className="module">
                  <h3>Модуль {index + 1}: {module.title}</h3>
                  <ul>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li key={lessonIndex}>{lesson}</li>
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
    const response = await fetch(`http://localhost:3000/courses/${id}`, {
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
    Cookies.set('oneCourse', data, {expires: 0.5})
    return data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}


function generateCurriculum(course) {
  if (!course.parts) {
    return [{
      title: 'Программа курса',
      lessons: ['Информация о модулях будет доступна позже']
    }];
  }

  let partsData;
  
  try {
    // Пробуем разные способы парсинга
    if (typeof course.parts === 'string') {
      // Убираем экранирование и парсим
      const cleanJsonString = course.parts
        .replace(/\\"/g, '"')
        .replace(/^"|"$/g, ''); // Убираем внешние кавычки если есть
      
      partsData = JSON.parse(cleanJsonString);
    } else {
      partsData = course.parts;
    }
  } catch (parseError) {
    console.error('Parse error:', parseError);
    return [{
      title: 'Программа курса',
      lessons: ['Ошибка загрузки программы курса']
    }];
  }

  // Обрабатываем полученные данные
  if (!Array.isArray(partsData)) {
    return [{
      title: 'Программа курса',
      lessons: ['Модули еще не добавлены']
    }];
  }

  return partsData.map((part) => ({
    title: part.title || 'Модуль без названия',
    lessons: Array.isArray(part.lessons) 
      ? part.lessons.map(lesson => 
          typeof lesson === 'object' ? (lesson.title || 'Без названия') : String(lesson)
        )
      : ['Содержание модуля будет добавлено позже']
  }));
}

function getInstructorBio(category) {
  if (category === 'programming') {
    return 'Senior разработчик с 10-летним опытом. Работал в крупных IT-компаниях, участник международных конференций. Специализируется на веб-разработке и архитектуре приложений.';
  } else {
    return 'UI/UX дизайнер с 8-летним опытом. Работала над проектами для Fortune 500 компаний. Эксперт в области пользовательского опыта и визуального дизайна.';
  }
}

export default CourseDetail;