// src/pages/CreateCourse.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './CreateCourse.css';

function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Модули курса
  const [modules, setModules] = useState([]);
  
  // Состояние для модального окна лекции
  const [lectureModal, setLectureModal] = useState({
    isOpen: false,
    moduleIndex: null,
    title: '',
    content: '',
    images: []
  });

  // Проверяем права доступа
  const user = JSON.parse(Cookies.get('user') || '{}');
  const isAuthorized = user.role === 'admin' || user.role === 'teacher';
  const [courseData, setCourseData] = useState({
    name: '',
    description: '',
    cost: '',
    time: '',
    level: 'легкий',
    category: 'programming',
    detailDescription: '',
    teacher: user?.email || '' 
  });
  if (!isAuthorized) {
    return (
      <div className="create-course">
        <div className="container">
          <div className="access-denied">
            <h2>Доступ запрещен</h2>
            <p>Только администраторы и преподаватели могут создавать курсы</p>
            <button onClick={() => navigate('/')} className="back-button">
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Обработчики изменений основных полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Добавление нового модуля
  const addModule = () => {
    const newModule = {
      id: Date.now(),
      title: '',
      lessons: []
    };
    setModules(prev => [...prev, newModule]);
  };

  // Обновление модуля
  const updateModule = (index, field, value) => {
    setModules(prev => prev.map((module, i) => 
      i === index ? { ...module, [field]: value } : module
    ));
  };

  // Удаление модуля
  const removeModule = (index) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  // Открытие модального окна для добавления лекции
  const openLectureModal = (moduleIndex) => {
    setLectureModal({
      isOpen: true,
      moduleIndex,
      title: '',
      content: '',
      images: []
    });
  };

  // Закрытие модального окна
  const closeLectureModal = () => {
    setLectureModal({
      isOpen: false,
      moduleIndex: null,
      title: '',
      content: '',
      images: []
    });
  };

  // Добавление лекции в модуль
  const addLecture = () => {
    if (!lectureModal.title.trim()) {
      setError('Введите название лекции');
      return;
    }

    const newLecture = {
      id: Date.now(),
      title: lectureModal.title,
      content: lectureModal.content,
      images: lectureModal.images
    };

    setModules(prev => prev.map((module, index) => 
      index === lectureModal.moduleIndex 
        ? { ...module, lessons: [...module.lessons, newLecture] }
        : module
    ));

    closeLectureModal();
  };

  // Обработчик загрузки изображений
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // В реальном приложении здесь была бы загрузка на сервер
    // Пока просто сохраняем информацию о файлах
    const imageUrls = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));

    setLectureModal(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  // Удаление изображения
  const removeImage = (imageIndex) => {
    setLectureModal(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== imageIndex)
    }));
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseData.name.trim()) {
      setError('Введите название курса');
      return;
    }

    if (modules.length === 0) {
      setError('Добавьте хотя бы один модуль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(courseData.level)
      const token = JSON.parse(Cookies.get('token'));
      const response = await fetch('https://educonnect-backend-qrh6.onrender.com/courses/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`
        },
        body: JSON.stringify({
          name: courseData.name,
          description: courseData.description,
          cost: courseData.cost,
          time: courseData.time,
          level: courseData.level,
          rating: 0,
          category: courseData.category,
          detailDescription: courseData.detailDescription,
          parts: JSON.stringify(modules),
          teacher: courseData.teacher// ID преподавателя/админа
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка создания курса');
      }

      const result = await response.json();
      setSuccess('Курс успешно создан!');
      window.alert('Курс успешно создан!')
      
      // Через 2 секунды перенаправляем на страницу курса
      setTimeout(() => {
        navigate(`/course/${result.id}`);
      }, 1000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Назад
        </button>

        <h1>Создание нового курса</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="course-form">
          {/* Основные поля курса */}
          <div className="form-section">
            <h2>Основная информация</h2>
            
            <div className="form-group">
              <label>Название курса *</label>
              <input
                type="text"
                name="name"
                value={courseData.name}
                onChange={handleInputChange}
                required
                placeholder="Введите название курса"
              />
            </div>

            <div className="form-group">
              <label>Краткое описание *</label>
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                required
                placeholder="Краткое описание курса"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Стоимость</label>
                <input
                  type="number"
                  name="cost"
                  value={courseData.cost}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Продолжительность</label>
                <input
                  type="text"
                  name="time"
                  value={courseData.time}
                  onChange={handleInputChange}
                  placeholder="4 недели"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Уровень сложности</label>
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                >
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
              </div>

              <div className="form-group">
                <label>Категория</label>
                <select
                  name="category"
                  value={courseData.category}
                  onChange={handleInputChange}
                >
                  <option value="programming">Программирование</option>
                  <option value="design">Дизайн</option>
                  <option value="marketing">Маркетинг</option>
                  <option value="business">Бизнес</option>
                  <option value="languages">Языки</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Подробное описание</label>
              <textarea
                name="detailDescription"
                value={courseData.detailDescription}
                onChange={handleInputChange}
                placeholder="Подробное описание курса, программа, цели и т.д."
                rows="6"
              />
            </div>
            <div className="form-group">
                <label>Email преподавателя</label>
                <input
                    type="email"
                    name="teacherEmail"
                    value={courseData.teacherEmail}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                />
                <small className="input-hint">
                    {user.role === 'admin' 
                    ? 'Укажите email преподавателя, который будет вести курс' 
                    : 'Ваш email будет использован для связи с учениками'}
                </small>
            </div>
          </div>
            
          {/* Модули курса */}
          <div className="form-section">
            <div className="section-header">
              <h2>Модули курса</h2>
              <button type="button" onClick={addModule} className="add-button">
                + Добавить модуль
              </button>
            </div>

            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="module-card">
                <div className="module-header">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                    placeholder="Название модуля"
                    className="module-title"
                  />
                  <button
                    type="button"
                    onClick={() => removeModule(moduleIndex)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>

                <div className="lectures-list">
                  {module.lessons.map((lecture, lectureIndex) => (
                    <div key={lecture.id} className="lecture-item">
                      <span>{lecture.title}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openLectureModal(moduleIndex)}
                  className="add-lecture-button"
                >
                  + Добавить лекцию
                </button>
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Создание...' : 'Создать курс'}
          </button>
        </form>
      </div>

      {/* Модальное окно добавления лекции */}
      {lectureModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Добавить лекцию</h3>
              <button onClick={closeLectureModal} className="close-button">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Название лекции *</label>
                <input
                  type="text"
                  value={lectureModal.title}
                  onChange={(e) => setLectureModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название лекции"
                />
              </div>

              <div className="form-group">
                <label>Содержание лекции</label>
                <textarea
                  value={lectureModal.content}
                  onChange={(e) => setLectureModal(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Текст лекции..."
                  rows="8"
                />
              </div>

              <div className="form-group">
                <label>Изображения</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="images-preview">
                  {lectureModal.images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image.url} alt={image.name} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={closeLectureModal} className="cancel-button">
                Отмена
              </button>
              <button type="button" onClick={addLecture} className="save-button">
                Сохранить лекцию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;