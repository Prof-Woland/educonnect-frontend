// src/components/CourseCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';
import {refresh} from '../../context/AuthContext'
import Cookies from 'js-cookie';

function CourseCard(props) {
  const navigate = useNavigate();
  const uri = '../../../default.jpg'
  let isAuth = false
  let user, token, level, cost
  try{
    user = JSON.parse(Cookies.get('user'))
    token = JSON.parse(Cookies.get('token'))
    if(user){
      isAuth = true
    }else{
      isAuth = false
    }
  }
  catch{}
  function handleCardClick() {
    navigate(`/course/${props.course.id}`);
  }

  function handleEnrollClick(event) {
    event.stopPropagation();
    if(isAuth){
      recording(props.course.id, token, props.course.name)
    }else{
      navigate('login')
    }
  }

  if(props.course.level == 'easy'){
    level = "Легкий"
  }
  else if(props.course.level == 'medium'){
    level = "Средний"
  }else if(props.course.level == 'hard'){
    level = "Тяжелый"
  }else{
    level = "Неизвестно"
  }

    async function recording(id, token, name) {
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

  return (
    <div className="course-card" onClick={handleCardClick}>
      <div className="course-image-card">
        <img src={uri} alt={props.course.name} />
        <div className="course-level-card">{level}</div>
      </div>
      <div className="course-content-card">
        <h3>{props.course.name}</h3>
        <p className="course-description-card">{props.course.description}</p>
        <div className="course-meta-card">
          <span className="duration-card">{props.course.time}</span>
          <span className="rating-card">★ {props.course.rating}</span>
          <span className="students-card">👥 {props.course.studentsCount}</span>
        </div>
        <div className="course-price-card">{props.course.cost}</div>
        <button className="enroll-button-card" onClick={handleEnrollClick}>
          Записаться
        </button>
      </div>
    </div>
  );
}

export default CourseCard;