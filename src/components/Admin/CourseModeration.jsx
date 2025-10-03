import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../context/ApiContext';
import './AdminPanel.css';

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
      console.log(data)
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (courseId, action, e) => {
    if (e) e.stopPropagation(); // Останавливаем всплытие события
    
    try {
      await adminAPI.moderateCourse(courseId, action, feedback);
      setFeedback('');
      loadCourses(); // Reload courses
      alert(`Курс ${action === 'approve' ? 'одобрен' : 'отклонен'}`);
    } catch (error) {
      console.error('Error moderating course:', error);
      alert('Ошибка при модерации курса');
    }
  };

  const handleDeleteCourse = async (courseId, e) => {
    if (e) e.stopPropagation(); // Останавливаем всплытие события
    
    if (window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      try {
        await adminAPI.deleteCourse(courseId);
        loadCourses(); // Reload courses
        alert('Курс успешно удален');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Ошибка при удалении курса');
      }
    }
  };

  // Функция для перехода к деталям курса
  const handleCourseClick = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handlePublishedCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
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
              <div className="courses-grid">
                {pendingCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="course-card pending clickable-card"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="course-image">
                      <img src={course.image || '../../../public/default.jpg'} alt={course.title} />
                    </div>
                    <div className="course-info">
                      <h4>{course.name}</h4>
                      <p className="course-author">Автор: {course.teacher}</p>
                      <p className="course-description">{course.description}</p>
                      <div className="course-meta">
                        <span>Категория: {course.category}</span>
                        <span>Создан: {new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="moderation-actions" onClick={stopPropagation}>
                      <div className="action-buttons">
                        <button 
                          onClick={(e) => handleModeration(course.id, 'approve', e)}
                          className="btn-approve"
                        >
                          Одобрить
                        </button>
                        <button 
                          onClick={(e) => handleModeration(course.id, 'reject', e)}
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
              <div className="courses-grid">
                {publishedCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="course-card published clickable-card"
                    onClick={() => handlePublishedCourseClick(course.id)}
                  >
                    <div className="course-image">
                      <img src={course.image || '../../../public/default.jpg'} alt={course.name} />
                    </div>
                    <div className="course-info">
                      <h4>{course.name}</h4>
                      <p className="course-author">Автор: {course.author?.name || course.teacher}</p>
                      <p className="course-description">{course.description}</p>
                      <div className="course-meta">
                        <span>Студентов: {course.studentsCount || 0}</span>
                        <span>Рейтинг: {course.rating || 'Нет'}</span>
                      </div>
                    </div>
                    
                    <div className="moderation-actions" onClick={stopPropagation}>
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