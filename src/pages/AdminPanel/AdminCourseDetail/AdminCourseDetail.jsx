// src/pages/AdminCourseDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './AdminCourseDetail.css';
import { refresh } from '../../../context/AuthContext';

const API_BASE_URL = 'http://localhost:3000';

function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [moderatorComments, setModeratorComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [curriculum, setCurriculum] = useState([]);
  const uri = '../../../default.jpg';

  // Проверка прав администратора
  useEffect(() => {
    const checkAdminRights = async () => {
      try {
        const user = JSON.parse(Cookies.get('user') || '{}');
        const token = JSON.parse(Cookies.get('token') || '{}');
        
        if (!user.id || !token.accessToken) {
          navigate('/admin');
          return;
        }

        // Проверяем роль пользователя
        if (user.role !== 'admin' && user.role !== 'teacher') {
          setError('Недостаточно прав для просмотра этой страницы');
          setIsAdmin(false);
          setIsTeacher(false);
          return;
        }

        setIsAdmin(true);

        if (user.role == 'teacher') {
          setIsTeacher(true);
          setIsAdmin(false);
        }

        await fetchCourseData(id, token);
        await fetchModeratorComments(id, token);
      } catch (err) {
        console.error('Error checking admin rights:', err);
        setError('Ошибка проверки прав доступа');
        setIsAdmin(false);
      }
    };

    checkAdminRights();
  }, [id, navigate]);

  // Функция загрузки данных курса
  const fetchCourseData = async (courseId, token) => {
    try {
      setLoading(true);
      const data = await getOne(courseId, token);
      console.log('Course data:', data);
      setCourse(data);
      
      // Генерируем учебный план
      const curriculumData = generateCurriculum(data);
      setCurriculum(curriculumData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки комментариев модераторов
  const fetchModeratorComments = async (courseId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pending/comments/${courseId}`, {
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
      setModeratorComments(data || []);
    } catch (error) {
      console.error('Error fetching moderator comments:', error);
    }
  };

  // Функция добавления нового комментария
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Введите текст комментария');
      return;
    }

    try {
      const token = JSON.parse(Cookies.get('token') || '{}');
      const user = JSON.parse(Cookies.get('user') || '{}');
      
      const response = await fetch(`http://localhost:3000/admin/addComment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        },
        body: JSON.stringify({ 
          comment: newComment,
          id: course.id
        })
      });

      if (!response.ok) {
              if(response.status == 409){
                window.alert(`Вы уже записались на этот курс!`);
              }
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
      setNewComment('');
      await fetchModeratorComments(id, token);
      alert('Комментарий успешно добавлен');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(`Ошибка при добавлении комментария: ${error.message}`);
    }
  };

  // Функция одобрения курса
  const handleApproveCourse = async () => {
    if (!window.confirm('Вы уверены, что хотите одобрить этот курс?')) return;

    try {
      const token = JSON.parse(Cookies.get('token') || '{}');
      const response = await fetch(`${API_BASE_URL}/admin/pending/approve/${id}`, {
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
      window.alert('Курс успешно одобрен');
      navigate('/admin');
    } catch (error) {
      console.error('Error approving course:', error);
      window.alert(`Ошибка при одобрении курса: ${error.message}`);
    }
  };

  // Функция отклонения курса
  const handleRejectCourse = async () => {
    const feedback = window.prompt('Укажите причину отклонения курса:');
    if (feedback === null) return;

    try {
      const token = JSON.parse(Cookies.get('token') || '{}');
      const response = await fetch(`${API_BASE_URL}/admin/pending/approve/${id}`, {
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
      window.alert('Курс отклонен');
      navigate('/admin');
    } catch (error) {
      console.error('Error rejecting course:', error);
      window.alert(`Ошибка при отклонении курса: ${error.message}`);
    }
  };

  // Функция удаления курса
  const handleDeleteCourse = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) return;

    try {
      const token = JSON.parse(Cookies.get('token') || '{}');
      const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
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

      window.alert('Курс успешно удален');
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting course:', error);
      window.alert(`Ошибка при удалении курса: ${error.message}`);
    }
  };

  // Функции для навигации по модулям и урокам
  const handleModuleClick = (moduleId, moduleIndex) => {
    navigate(`/admin/courses/${id}/modules/${moduleId}`, { 
      state: { 
        moduleIndex,
        courseName: course?.name,
        moduleTitle: curriculum[moduleIndex]?.title,
        isAdmin: true
      }
    });
  };

  const handleLessonClick = (lessonId, moduleIndex, lessonIndex) => {
    const module = curriculum[moduleIndex];
    const lesson = module.lessons[lessonIndex];
    
    navigate(`/admin/courses/${id}/lessons/${lessonId}`, {
      state: {
        moduleIndex,
        lessonIndex,
        courseName: course?.name,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        lessonContent: lesson.content,
        lessonDuration: lesson.duration || '15 минут',
        isAdmin: true
      }
    });
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

  // Показываем ошибку доступа
  if (error && !isAdmin && !isTeacher) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1 className='course-none'>Доступ запрещен</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/admin')} className="back-button">
            Вернуться в админ-панель
          </button>
        </div>
      </div>
    );
  }

  // Показываем ошибку загрузки
  if (error) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1 className='course-none'>Ошибка</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/admin')} className="back-button">
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
          <button onClick={() => navigate('/admin')} className="back-button">
            Вернуться к курсам
          </button>
        </div>
      </div>
    );
  }

  // Определяем уровень сложности
  let level;
  switch (course.level) {
    case 'легкий':
      level = "Начальный";
      break;
    case 'средний':
      level = "Средний";
      break;
    case 'тяжелый':
      level = "Продвинутый";
      break;
    default:
      level = "Не указан";
  }

  // Определяем статус курса
  let statusBadge;
  switch (course.status) {
    case 'moderating':
      statusBadge = <span className="status-badge pending">На модерации</span>;
      break;
    case 'approved':
      statusBadge = <span className="status-badge approved">Одобрен</span>;
      break;
    case 'rejected':
      statusBadge = <span className="status-badge rejected">Отклонен</span>;
      break;
    case 'published':
      statusBadge = <span className="status-badge published">Опубликован</span>;
      break;
    default:
      statusBadge = <span className="status-badge unknown">Неизвестен</span>;
  }

  return (
    <div className="course-detail admin-course-detail">
      <div className="container">
        <div className="admin-header-actions">
          <button onClick={() => navigate("/admin/courses-management")} className="back-button">
            ← Назад к списку курсов
          </button>
          <div className="course-status-info">
            {statusBadge}
            <span className="course-id">ID: {course.id}</span>
          </div>
        </div>
        
        <div className="course-header">
          <div className="course-image-large">
            <img src={uri} alt={course.name} />
          </div>
          <div className="course-info">
            <div className="course-title-section">
              <h1>{course.name}</h1>
            </div>
            <p className="course-description">{course.description}</p>
            
            <div className="course-meta-detail">
              <div className="meta-item">
                <span className="label">Длительность:</span>
                <span className="value">{course.time || 'Не указана'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Уровень:</span>
                <span className="value">{level}</span>
              </div>
              <div className="meta-item">
                <span className="label">Рейтинг:</span>
                <span className="value">★ {course.rating || 'Нет оценок'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Студентов:</span>
                <span className="value">{course.studentsCount || 0}</span>
              </div>
              <div className="meta-item">
                <span className="label">Категория:</span>
                <span className="value">
                  {course.category === 'programming' ? 'Программирование' : 
                   course.category === 'design' ? 'Дизайн' : 
                   course.category || 'Не указана'}
                </span>
              </div>
              <div className="meta-item">
                <span className="label">Цена:</span>
                <span className="value">{course.cost || 'Бесплатно'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Автор:</span>
                <span className="value">{course.teacher || 'Не указан'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Создан:</span>
                <span className="value">
                  {course.createdAt ? new Date(course.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                </span>
              </div>
            </div>

            {/* Админские действия */}
            <div className="admin-actions">
              {course.status === 'moderating' && (
                <>
                  <button className="btn-approve" onClick={handleApproveCourse}>
                    Одобрить курс
                  </button>
                  <button className="btn-reject" onClick={handleRejectCourse}>
                    Отклонить курс
                  </button>
                </>
              )}
              
              {(course.status === 'approved' || course.status === 'published') && (
                <button className="btn-delete" onClick={handleDeleteCourse}>
                  Удалить курс
                </button>
              )}

              {course.status === 'rejected' && (
                <div className="rejection-info">
                  <p><strong>Причина отклонения:</strong> {course.rejectionReason || 'Не указана'}</p>
                  <div className="rejected-actions">
                    <button className="btn-approve" onClick={handleApproveCourse}>
                      Все равно одобрить
                    </button>
                    <button className="btn-delete" onClick={handleDeleteCourse}>
                      Удалить курс
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="course-content">
          <div className="content-section">
            <h2>Подробное описание</h2>
            <p>{course.detailDescription || 'Подробное описание отсутствует'}</p>
          </div>

          {/* Программа курса с возможностью просмотра модулей и уроков */}
          <div className="content-section">
            <h2>Программа курса</h2>
            <div className="curriculum">
              {curriculum.map((module, index) => (
                <div 
                  key={module.id || index} 
                  className="module clickable-module"
                  onClick={() => handleModuleClick(module.id || `module-${index}`, index)}
                >
                  <div className="module-header">
                    <h3>Модуль {index + 1}: {module.title}</h3>
                    <span className="module-arrow">→</span>
                  </div>
                  <ul>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li 
                        key={lesson.id || lessonIndex} 
                        className="clickable-lesson"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLessonClick(lesson.id || `lesson-${index}-${lessonIndex}`, index, lessonIndex);
                        }}
                      >
                        {lesson.title}
                        {lesson.content && (
                          <span className="lesson-content-indicator" title="Есть содержимое"> 📄</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2>Информация о преподавателе</h2>
            <div className="instructor">
              <div className="instructor-info">
                <h3>{course.teacher || 'Не указан'}</h3>
                <p>{getInstructorBio(course.category)}</p>
                {course.teacherEmail && (
                  <p><strong>Email:</strong> {course.teacherEmail}</p>
                )}
                {course.teacherContact && (
                  <p><strong>Контакты:</strong> {course.teacherContact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Комментарии модераторов */}
          <div className="content-section moderator-comments">
            <h2>Комментарии модераторов</h2>
            
            {isAdmin ? (
              <div className="add-comment-form">
                <h3>Добавить комментарий</h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Введите ваш комментарий..."
                  className="comment-textarea"
                  rows="4"
                />
                <button 
                  onClick={handleAddComment}
                  className="btn-add-comment"
                  disabled={!newComment.trim()}
                >
                  Добавить комментарий
                </button>
              </div>
            ) : (
              <div></div>
            )}

            {/* Список комментариев */}
            <div className="comments-list">
              {moderatorComments.length > 0 ? (
                moderatorComments.map((comment, index) => (
                  <div key={comment.id || index} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.adminEmail || 'Модератор'}</span>
                      <span className="comment-date">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString('ru-RU') : 'Неизвестно'}
                      </span>
                    </div>
                    <div className="comment-content">
                      {comment.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-comments">
                  <p>Пока нет комментариев от модераторов</p>
                </div>
              )}
            </div>
          </div>

          {/* Дополнительная информация для админа */}
          <div className="content-section admin-info">
            <h2>Административная информация</h2>
            <div className="admin-meta">
              <div className="meta-item">
                <span className="label">ID курса:</span>
                <span className="value">{course.id}</span>
              </div>
              <div className="meta-item">
                <span className="label">Статус модерации:</span>
                <span className="value">{course.status || 'unknown'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Дата создания:</span>
                <span className="value">
                  {course.createdAt ? new Date(course.createdAt).toLocaleString('ru-RU') : 'Неизвестно'}
                </span>
              </div>
              <div className="meta-item">
                <span className="label">Дата обновления:</span>
                <span className="value">
                  {course.updatedAt ? new Date(course.updatedAt).toLocaleString('ru-RU') : 'Неизвестно'}
                </span>
              </div>
              {course.moderatedBy && (
                <div className="meta-item">
                  <span className="label">Модерировал:</span>
                  <span className="value">{course.moderatedBy}</span>
                </div>
              )}
              {course.moderatedAt && (
                <div className="meta-item">
                  <span className="label">Дата модерации:</span>
                  <span className="value">
                    {new Date(course.moderatedAt).toLocaleString('ru-RU')}
                  </span>
                </div>
              )}
              {course.rejectionReason && (
                <div className="meta-item">
                  <span className="label">Причина отклонения:</span>
                  <span className="value">{course.rejectionReason}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="label">Модулей:</span>
                <span className="value">{curriculum.length}</span>
              </div>
              <div className="meta-item">
                <span className="label">Всего уроков:</span>
                <span className="value">
                  {curriculum.reduce((total, module) => total + module.lessons.length, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Вспомогательные функции
async function getOne(id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
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
    return data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

// Улучшенная функция для парсинга учебного плана
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
      cleanStr = cleanStr.replaceAll(/.\\[а-яёА-ЯЁ]/g, ' ');
      cleanStr = cleanStr.replaceAll(/[а-яёА-ЯЁ]\\./g, ' ');
      cleanStr = cleanStr.replaceAll(/[.,; ]\\[.,; ]/g, ' ');
      cleanStr = cleanStr.replaceAll(/\;\\./g, ' ');
      cleanStr = cleanStr.replaceAll(/[а-яёА-ЯЁ]\\[.,; ]/g, ' ');

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

function getInstructorBio(category) {
  if (category === 'programming') {
    return 'Senior разработчик с 10-летним опытом. Работал в крупных IT-компаниях, участник международных конференций. Специализируется на веб-разработке и архитектуре приложений.';
  } else if (category === 'design') {
    return 'UI/UX дизайнер с 8-летним опытом. Работала над проектами для Fortune 500 компаний. Эксперт в области пользовательского опыта и визуального дизайна.';
  } else {
    return 'Опытный преподаватель с доказанной экспертизой в своей области. Помог множеству студентов достичь своих образовательных целей.';
  }
}

export default AdminCourseDetail;