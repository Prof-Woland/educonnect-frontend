import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../context/ApiContext';
import Cookies from 'js-cookie';
import './AdminPanel.css';

const API_URI = 'https://educonnect-backend-qrh6.onrender.com';
const uri = '../../../default.jpg'

const CourseModeration = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const isAllEmpty = pendingCourses.length === 0 && publishedCourses.length === 0;
  const isPendEmpty = pendingCourses.length === 0;

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getPendingCourses();
      setPendingCourses(data.pending || []);
      setPublishedCourses(data.published || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (id) => {
    if (!window.confirm('Вы уверены, что хотите одобрить этот курс?')) return;

    try {
      const token = JSON.parse(Cookies.get('token') || '{}');
      const response = await fetch(`${API_URI}/admin/pending/approve/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        },
        body:JSON.stringify({
          status:'approved'
        })
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
      window.alert('Курс успешно одобрен');
      const newc = await adminAPI.getPendingCourses();
      setPendingCourses(newc.pending || []);
      navigate('/admin'); // Возвращаемся к списку курсов
    } catch (error) {
      console.error('Error approving course:', error);
      window.alert(`Ошибка при одобрении курса: ${error.message}`);
    }
  };

  // Функция отклонения курса
  const handleRejectCourse = async (id) => {
    const feedback = window.prompt('Укажите причину отклонения курса:');
    if (feedback === null) return; // Пользователь отменил ввод

    try {
      const token = JSON.parse(Cookies.get('token') || '{}');
      const response = await fetch(`${API_URI}/admin/pending/approve/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        },
        body:JSON.stringify({
          status:'rejected'
        })
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
      window.alert('Курс отклонен');
      const newc = await adminAPI.getPendingCourses();
      setPendingCourses(newc.pending || []);
      navigate('/admin'); // Возвращаемся к списку курсов
    } catch (error) {
      console.error('Error rejecting course:', error);
      window.alert(`Ошибка при отклонении курса: ${error.message}`);
    }
  };

    const handleDeleteCourse = async (id) => {
      if (!window.confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) return;
  
      try {
        const token = JSON.parse(Cookies.get('token') || '{}');
        const response = await fetch(`${API_URI}/admin/courses/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`
          }
        });
  
        if (!response.ok) {
                if(response.status == 409){
                  window.alert(``);
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

        const data = await adminAPI.getPendingCourses();
        setPublishedCourses(data.published || []);
        window.alert('Курс успешно удален');
        navigate('/admin'); // Возвращаемся к списку курсов
      } catch (error) {
        console.error('Error deleting course:', error);
        window.alert(`Ошибка при удалении курса: ${error.message}`);
      }
    };

  // Функция для перехода к деталям курса
  const handleCourseClick = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handlePublishedCourseClick = (courseId) => {
    navigate(`/admin/courses/published/${courseId}`);
  };

  // Функция для остановки всплытия события (для элементов внутри карточки)
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="course-moderation">
      <div className="section-header">
        <h2>Модерация курсов</h2>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <>
          {/* Pending Courses Section */}
          <section className="moderation-section">
            <h3>Курсы на модерации ({pendingCourses.length})</h3>
            {!isPendEmpty ? (
              <div className="courses-grid-mod">
                {pendingCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="course-card-mod pending clickable-card-mod"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="course-image-mod">
                      <img src={course.image || uri} alt={course.title} />
                    </div>
                    <div className="course-info-mod">
                      <h4>{course.name}</h4>
                      <p className="course-author-mod">Автор: {course.teacher}</p>
                      <p className="course-description-mod">{course.description}</p>
                      <div className="course-meta-mod">
                        <span>Категория: {course.category}</span>
                        <span>Создан: {new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="moderation-actions-mod" onClick={stopPropagation}>
                      <div className="action-buttons">
                        <button 
                          onClick={(e) => handleModeration(course.id)}
                          className="btn-approve"
                        >
                          Одобрить
                        </button>
                        <button 
                          onClick={(e) => handleRejectCourse(course.id)}
                          className="btn-reject"
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Нет курсов на модерации</div>
            )}
          </section>

          {/* Published Courses Section */}
          <section className="moderation-section">
            <h3>Опубликованные курсы ({publishedCourses.length})</h3>
            {publishedCourses.length > 0 ? (
              <div className="courses-grid-mod">
                {publishedCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="course-card-mod published clickable-card-mod"
                    onClick={() => handlePublishedCourseClick(course.id)}
                  >
                    <div className="course-image-mod">
                      <img src={course.image || uri} alt={course.name} />
                    </div>
                    <div className="course-info-mod">
                      <h4>{course.name}</h4>
                      <p className="course-author-mod">Автор: {course.author?.name || course.teacher}</p>
                      <p className="course-description-mod">{course.description}</p>
                      <div className="course-meta-mod">
                        <span>Студентов: {course.studentsCount || 0}</span>
                        <span>Рейтинг: {course.rating || 'Нет'}</span>
                      </div>
                    </div>
                    
                    <div className="moderation-actions-mod" onClick={stopPropagation}>
                      <button 
                        onClick={(e) => handleDeleteCourse(course.id, e)}
                        className="btn-delete"
                      >
                        Удалить курс
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Нет опубликованных курсов</div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default CourseModeration;