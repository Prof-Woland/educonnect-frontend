// src/pages/Account.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';
import './Account.css';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://educonnect-backend-qrh6.onrender.com';

// Обновленная регулярка для проверки email с основными почтовыми доменами
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?:\.[a-zA-Z]{2,})(?:\,?\s*[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?:\.[a-zA-Z]{2,}))*$/;

function Account() {
  const auth = useAuth();
  const { updateProfile } = useAuth();
  const navigate = useNavigate()
  const { currentUser, loading } = auth;
  const [myCourses, setMyCourses] = useState([])
  const [myProgress, setMyProgress] = useState([])
  const [userData, setUserData] = useState('')
  const user = JSON.parse(Cookies.get('user'));


  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    async function fetchData() {
      if (currentUser) {
        setUserData({
          login: currentUser.login || '',
          role: currentUser.role || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          avatar: currentUser.avatar || '../../../default.jpg'
        });
      }
      const data = await getOwn();
      setMyCourses(data.courses || [])
      setMyProgress(data.progress || [])
    }
    
    fetchData();
  }, [currentUser]);

  // Функция для расчета прогресса курса
  const calculateCourseProgress = (course) => {
    // Находим прогресс для этого курса
    const courseProgress = myProgress.find(p => p.courseId === course.id);
    const myCourse = myCourses.find(p => p.courseId === course.id)
    
    if (!courseProgress) return 0;

    // Получаем общее количество уроков в курсе
    // Предполагаем, что в course.parts хранится структура модулей и уроков
    let totalLessons = 0;
    console.log('cp ' + courseProgress)
    try {
      if (course.parts) {
        const parts = typeof course.parts === 'string' ? JSON.parse(course.parts) : course.parts;
        totalLessons = parts.reduce((total, module) => total + (module.lessons ? module.lessons.length : 0), 0);
        totalLessons = myCourse.lessons
        console.log(lessons)
      }
    } catch (error) {
      console.error('Error parsing course parts:', error);
    }

    // Если нет уроков в курсе или нет прогресса, возвращаем 0
    if (totalLessons === 0 || !courseProgress.lessons) return 0;

    // Рассчитываем процент выполнения
    const progressPercent = (courseProgress.lessons / totalLessons) * 100;
    return Math.min(progressPercent, 100); // Ограничиваем максимум 100%
  };

  let role
  let isAdmin = false
  let isTeacher = false
  let isStudent = false

  if(user && user.role == 'teacher'){
    role = 'Преподаватель'
  }
  else if(user && user.role == 'admin'){
    role = 'Администратор'
  }
  else{
    role = 'Студент'
  }
  
  if(!user){
    isAdmin = false
    isTeacher = false
    isStudent = false
  }
  else{
    if(user.role == 'admin'){
      isAdmin = true
      isTeacher = false
      isStudent = false
    }
    else if(user.role == 'teacher'){
      isAdmin = false
      isTeacher = true
      isStudent = false
    }
    else{
      isAdmin = false
      isTeacher = false
      isStudent = true
    }
  }

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dataLoading, setLoading] = useState(false);

  function handleInputChange(event) {
    setUserData({
      ...userData,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Проверка email с помощью регулярного выражения
    if (userData.email && !emailRegex.test(userData.email)) {
      setError('Введите корректный email адрес с допустимым доменом (например: gmail.com, yandex.ru, mail.ru и т.д.)');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await updateProfile(userData);
      setMessage('Данные успешно обновлены');
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="loading-container">Загрузка профиля...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="account">
      <div className="container">
        <div className="profile-header">
          <img src='../../../public/vite.svg' alt="Аватар" />
          <h1>{user.login + ' - ' + role}</h1>
        </div>
        
        <section className="personal-data">
          <h2>Личные данные</h2>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <form className="data-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имя и фамилия</label>
              <input 
                type="text" 
                name="login"
                value={userData.login}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input 
                type="tel" 
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <button type="submit" disabled={dataLoading} className="save-btn">
              {dataLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </section>
        {isTeacher||isStudent?
        <section className="user-courses">
          <h2>Мои курсы</h2>
          {myCourses && myCourses.length > 0 ? (
            <div className="courses-grid">
              {myCourses.map(function(course) {
                const progress = calculateCourseProgress(course);
                const courseProgressData = myProgress.find(p => p.courseId === course.id);
                
                return (
                  <div key={course.id} className="course-card">
                    <h3>{course.name}</h3>
                    <p className="course-description">{course.description}</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span>{Math.round(progress)}% завершено</span>
                      {courseProgressData && (
                        <span className="lessons-completed">
                          Пройдено уроков: {courseProgressData.lessons || 0}
                        </span>
                      )}
                    </div>
                    <div className="course-meta">
                      <span className="course-duration">{course.time}</span>
                      <span className="course-level">{course.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>У вас пока нет активных курсов</p>
          )}
        </section>:<div/>}
      </div>
    </div>
  );
}

async function getOwn(){
  const token = JSON.parse(Cookies.get('token'));
  const user = JSON.parse(Cookies.get('user'));
  
  try {
    const response = await fetch(`${API_BASE_URL}/courses/own`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
    });
    
    if (!response.ok) {
      if(response.status == 401){
        await refresh(user.id);
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
    console.log(data);
    
    // Возвращаем объект с courses и progress
    return {
      courses: data.courses || [],
      progress: data.progress || []
    };
  } catch (error) {
    console.error('Error fetching own courses:', error);
    throw error;
  }
}

export default Account;