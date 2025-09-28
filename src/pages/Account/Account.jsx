// src/pages/Account.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';
import './Account.css';
import { useNavigate } from 'react-router-dom';

function Account() {
  const auth = useAuth();
  const navigate = useNavigate()
  const { currentUser, loading } = auth;
  const [myCourses, setMyCourses] = useState([])
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
          name: currentUser.name || '',
          role: currentUser.role || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          avatar: currentUser.avatar || '../../data/images/default.jpg'
        });
      }
      const data = await getOwn();
      setMyCourses(data)
    }
    
    fetchData();
  }, [currentUser]);

  let role
  let isAdmin
  let isTeacher

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
  }
  else{
    if(user.role == 'admin'){
      isAdmin = true
      isTeacher = false
    }
    else if(user.role == 'teacher'){
      isAdmin = false
      isTeacher = true
    }
    else{
      isAdmin = false
      isTeacher = false
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
                name="name"
                value={user.login}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={user.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input 
                type="tel" 
                name="phone"
                value={user.phone}
                onChange={handleInputChange}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <button type="submit" disabled={dataLoading} className="save-btn">
              {dataLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </section>

        <section className="user-courses">
          <h2>Мои курсы</h2>
          {myCourses && myCourses.length > 0 ? (
            <div className="courses-grid">
              {myCourses.map(function(course) {
                return (
                  <div key={course.id} className="course-card">
                    <h3>{course.name}</h3>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <span>{course.progress || 0}% завершено</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>У вас пока нет активных курсов</p>
          )}
        </section>
        
        {isAdmin ? (
          <section className="courses-section">
            <div className="container">
              <h2>Админская тема</h2>
              <div className="courses-grid">
                {/* Админский контент */}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

async function getOwn(){
  const token = JSON.parse(Cookies.get('token'));
  const user = JSON.parse(Cookies.get('user')); // Добавляем получение user
  
  try {
    const response = await fetch('http://localhost:3000/courses/own', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
    });
    
    if (!response.ok) {
      if(response.status == 401){
        await refresh(user.id); // Используем user.id
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
    
    if (!Array.isArray(data)) {
      console.warn('API returned non-array data:', data);
      return [];
    }
    Cookies.set('ownCourses', JSON.stringify(data), {expires: 0.5})
    return data;
  } catch (error) {
    console.error('Error fetching own courses:', error);
    throw error;
  }
}

export default Account;