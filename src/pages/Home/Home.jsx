// src/pages/Home.js
import React, {useState, useEffect} from 'react';
import './Home.css';
import Cookies from 'js-cookie';
import CourseCard from '../../components/CourseCard/CourseCard'
import {refresh} from '../../context/AuthContext'
import coursesData from '../../data/coursesData';

const Home = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownLoading, setOwnLoading] = useState(true);
  const [error, setError] = useState(null);
  let isNotEmptyPopular = true
  let isNotEmptyOwn = true
  let isAdmin = false
  let isTeacher = false
  let isStudent = false

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const data = await getPopular();
        setPopularCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    async function fetchOwnCourses() {
      try {
        setOwnLoading(true);
        const data = await getOwn();
        setUserCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setOwnLoading(false);
      }
    }

    fetchOwnCourses();
  }, []);


  if(popularCourses.length == 0){
    isNotEmptyPopular = false
  }else{
    isNotEmptyPopular = true
  }

  if(userCourses.length == 0){
    isNotEmptyOwn = false
  }else{
    isNotEmptyOwn = true
  }
  try{
    const user = JSON.parse(Cookies.get('user'))
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
  }catch{}

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Образование будущего уже здесь</h1>
          <p>Инновационные курсы от лучших преподавателей</p>
        </div>
      </section>

      <section className="courses-section">
        <div className="container">
          <h2>Популярные курсы</h2>
          <div className="courses-grid">
            {isNotEmptyPopular?popularCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            )) : <div className='course-none'>Здесь пока ничего нет!</div>}
          </div>
        </div>
      </section>
      {isTeacher||isStudent?
      <section className="courses-section">
        <div className="container">
          <h2>Мои курсы</h2>
          <div className="courses-grid">
            {isNotEmptyOwn?userCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            )) : <div className='course-none-own'>Войдите в личный кабинет, чтобы увидеть этот раздел!</div>}
          </div>
        </div>
      </section>:<div/>}
      {isAdmin?
      <section className="courses-section">
        <div className="container">
          <h2>Админская тема</h2>
          <div className="courses-grid">
            {/* {isNotEmptyOwn?userCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            )) : <div className='course-none-own'>Войдите в личный кабинет, чтобы увидеть этот раздел!</div>} */}
          </div>
        </div>
      </section>
      : <div/>}
    </div>
  );
};

async function getPopular(){
  // const cookieData = JSON.parse(Cookies.get('popularCourses'));
  // if(!cookieData)
  // {
  try {
    const response = await fetch('https://educonnect-backend-qrh6.onrender.com/courses/popular', {
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
    
    // Проверяем, что data - массив
    if (!Array.isArray(data)) {
      console.warn('API returned non-array data:', data);
      return [];
    }
    Cookies.set('popularCourses', JSON.stringify(data), {expires: 0.5})
    return data;
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    throw error;
  }
  // }else{
  //   return cookieData
  // }
}

async function getOwn(){
  // const cookieOwnData = JSON.parse(Cookies.get('ownCourses'));
  // console.log(cookieOwnData)
  // if(!cookieOwnData)
  // {
    const token = JSON.parse(Cookies.get('token'));
    const userData = JSON.parse(Cookies.get('user'));
    try {
      const response = await fetch('https://educonnect-backend-qrh6.onrender.com/courses/own', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        },
      });
      
      if (!response.ok) {
        if(response.status == 401){
          await refresh(userData.id)
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
      
      // Проверяем, что data - массив
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
  // }else{
  //   return cookieOwnData
  // }
}

export default Home;