// src/pages/CourseManagementPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../context/ApiContext';
import Cookies from 'js-cookie';
import './CourseManagement.css';

const API_BASE_URL = 'https://educonnect-backend-qrh6.onrender.com';

const CourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    moderating: 0,
    approved: 0,
    rejected: 0,
    published: 0
  });
  const navigate = useNavigate();
  const user = JSON.parse(Cookies.get('user'))

  // Статусы курсов с динамическими счетчиками
  const statusTabs = [
    { id: 'all', label: 'Все курсы', count: statusCounts.all },
    { id: 'moderating', label: 'На модерации', count: statusCounts.moderating },
    { id: 'approved', label: 'Подтвержденные', count: statusCounts.approved },
    { id: 'rejected', label: 'Отклоненные', count: statusCounts.rejected },
    { id: 'published', label: 'Опубликованные', count: statusCounts.published }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
    updateStatusCounts();
  }, [courses, activeTab, searchTerm]);

  // Функция для обновления счетчиков статусов
  const updateStatusCounts = () => {
    const counts = {
      all: courses.length,
      moderating: courses.filter(course => course.status === 'moderating').length,
      approved: courses.filter(course => course.status === 'approved').length,
      rejected: courses.filter(course => course.status === 'rejected').length,
      published: courses.filter(course => course.status === 'published').length
    };
    setStatusCounts(counts);
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Ошибка загрузки курсов');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Фильтрация по статусу
    if (activeTab !== 'all') {
      filtered = filtered.filter(course => course.status === activeTab);
    }

    // Фильтрация по поиску
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'moderating':
        return <span className="status-badge-adm moderating-adm">На модерации</span>;
      case 'approved':
        return <span className="status-badge-adm approved-adm">Подтвержден</span>;
      case 'rejected':
        return <span className="status-badge-adm rejected-adm">Отклонен</span>;
      case 'published':
        return <span className="status-badge-adm published-adm">Опубликован</span>;
      default:
        return <span className="status-badge-adm unknown-adm">Неизвестен</span>;
    }
  };

  const getStatusActions = (course) => {
    switch (course.status) {
      case 'approved':
        return (
          <div className="course-actions-adm">
            <button 
              className="btn-publish-adm"
              onClick={(e) => {
                e.stopPropagation();
                handlePublishCourse(course.id);
              }}
            >
              Опубликовать
            </button>
            <button 
              className="btn-reject-adm"
              onClick={(e) => {
                e.stopPropagation();
                handleRejectCourse(course.id);
              }}
            >
              Отклонить
            </button>
          </div>
        );
      case 'rejected':
        return (
          <div className="course-actions-adm">
            <button 
              className="btn-approve-adm"
              onClick={(e) => {
                e.stopPropagation();
                handleModerCourse(course.id);
              }}
            >
              На модерацию
            </button>
            <button 
              className="btn-delete-adm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCourse(course.id);
              }}
            >
              Удалить
            </button>
          </div>
        );
      case 'published':
        return (
          <div className="course-actions-adm">
            <button 
              className="btn-unpublish-adm"
              onClick={(e) => {
                e.stopPropagation();
                handleUnpublishCourse(course.id);
              }}
            >
              Отменить публ.
            </button>
            <button 
              className="btn-delete-adm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCourse(course.id);
              }}
            >
              Удалить
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleApproveCourse = async (courseId) => {
    if (!window.confirm('Вы уверены, что хотите одобрить этот курс?')) return;

    try {
      await adminAPI.approveCourse(courseId);
      alert('Курс успешно одобрен');
      loadCourses(); // Перезагружаем список
    } catch (error) {
      console.error('Error approving course:', error);
      alert('Ошибка при одобрении курса');
    }
  };

  const handleModerCourse = async (courseId) => {
    if (!window.confirm('Вы уверены, что хотите отправить этот курс на модерацию?')) return;

    try {
      await adminAPI.moderCourse(courseId);
      alert('Курс успешно отправлен на модерацию');
      loadCourses(); // Перезагружаем список
    } catch (error) {
      console.error('Error moderating course:', error);
      alert('Ошибка при отправлении курса на модерацию');
    }
  };

  const handleRejectCourse = async (courseId) => {
    const feedback = window.prompt('Укажите причину отклонения курса:');
    if (feedback === null) return;

    try {
      await adminAPI.rejectCourse(courseId, feedback);
      alert('Курс отклонен');
      loadCourses();
    } catch (error) {
      console.error('Error rejecting course:', error);
      alert('Ошибка при отклонении курса');
    }
  };

  const handlePublishCourse = async (courseId) => {
    if (!window.confirm('Вы уверены, что хотите опубликовать этот курс?')) return;

    try {
      await adminAPI.publishCourse(courseId);
      alert('Курс успешно опубликован');
      loadCourses();
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('Ошибка при публикации курса');
    }
  };

  const handleUnpublishCourse = async (courseId) => {
    if (!window.confirm('Вы уверены, что хотите снять курс с публикации?')) return;

    try {
      await adminAPI.unpublishCourse(courseId);
      alert('Курс снят с публикации');
      loadCourses();
    } catch (error) {
      console.error('Error unpublishing course:', error);
      alert('Ошибка при снятии курса с публикации');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) return;

    try {
      await adminAPI.deleteCourse(courseId);
      alert('Курс успешно удален');
      loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Ошибка при удалении курса');
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  // Функция для отображения статистики
  const renderStatsOverview = () => {
    return (
      <div className="stats-overview-adm">
        <div className="stat-item-adm total-adm">
          <span className="stat-number-adm">{statusCounts.all}</span>
          <span className="stat-label-adm">Всего курсов</span>
        </div>
        <div className="stat-item-adm moderating-adm">
          <span className="stat-number-adm">{statusCounts.moderating}</span>
          <span className="stat-label-adm">На модерации</span>
        </div>
        <div className="stat-item-adm approved-adm">
          <span className="stat-number-adm">{statusCounts.approved}</span>
          <span className="stat-label-adm">Подтверждено</span>
        </div>
        <div className="stat-item-adm published-adm">
          <span className="stat-number-adm">{statusCounts.published}</span>
          <span className="stat-label-adm">Опубликовано</span>
        </div>
        <div className="stat-item-adm rejected-adm">
          <span className="stat-number-adm">{statusCounts.rejected}</span>
          <span className="stat-label-adm">Отклонено</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="course-management-page-adm">
        <div className="container-management-adm">
          <div className="loading-adm">Загрузка курсов...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-management-page-adm">
      <div className="container-management-adm">
        <div className="page-header-adm">
          <h1>Управление курсами</h1>
          <p>Обзор и модерация всех курсов платформы</p>
        </div>

        {/* Общая статистика */}
        {renderStatsOverview()}

        <div className="management-controls-adm">
          <div className="search-box-adm">
            <input
              type="text"
              placeholder="Поиск по названию, преподавателю или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-adm"
            />
          </div>
          <div className="results-count-adm">
            Найдено: <strong>{filteredCourses.length}</strong> из <strong>{statusCounts.all}</strong>
          </div>
        </div>

        <div className="status-tabs-adm">
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              className={`status-tab-adm ${activeTab === tab.id ? 'active-adm' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-label-adm">{tab.label}</span>
              <span className="tab-count-adm">{tab.count}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="error-message-adm">
            <div>{error}</div>
            <button onClick={loadCourses} className="retry-button-adm">
              Попробовать снова
            </button>
          </div>
        )}

        <div className="courses-grid-adm">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <div 
                key={course.id} 
                className="course-card-adm"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-image-adm">
                  <img src={course.image || '../../../default.jpg'} alt={course.name} />
                </div>
                
                <div className="course-content-adm">
                  <div className="course-header-adm">
                    <h3 className="course-title-adm">{course.name}</h3>
                    {getStatusBadge(course.status)}
                  </div>
                  
                  <p className="course-description-adm">
                    {course.description || 'Описание отсутствует'}
                  </p>
                  
                  <div className="course-grid-inner-adm">
                    <div className="course-meta-adm">
                      <div className="meta-item-adm">
                        <span className="meta-label-adm">Преподаватель:</span>
                        <span className="meta-value-adm">{course.teacher || 'Не указан'}</span>
                      </div>
                      <div className="meta-item-adm">
                        <span className="meta-label-adm">Категория:</span>
                        <span className="meta-value-adm">
                          {course.category === 'programming' ? 'Программирование' : 
                          course.category === 'design' ? 'Дизайн' : 
                          course.category || 'Не указана'}
                        </span>
                      </div>
                      <div className="meta-item-adm">
                        <span className="meta-label-adm">Создан:</span>
                        <span className="meta-value-adm">
                          {course.createdAt ? new Date(course.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                        </span>
                      </div>
                      <div className="meta-item-adm">
                        <span className="meta-label-adm">Студентов:</span>
                        <span className="meta-value-adm">{course.studentsCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {getStatusActions(course)}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-adm">
              <div className="empty-icon-adm">📚</div>
              <h3>Курсы не найдены</h3>
              <p>
                {activeTab === 'all' && searchTerm 
                  ? 'Попробуйте изменить поисковый запрос' 
                  : `В категории "${statusTabs.find(t => t.id === activeTab)?.label}" пока нет курсов`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseManagementPage;