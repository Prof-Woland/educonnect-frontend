import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../context/ApiContext';
import './AdminPanel.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers(searchTerm);
      setUsers(data);
      console.log(data); // Исправил: выводим data вместо users (которые еще не обновлены)
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Исправленная фильтрация
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      loadUsers(); // Reload users to reflect changes
      alert('Роль пользователя успешно обновлена');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Ошибка при обновлении роли');
    }
  };

  const handleDeleteUser = async (userId, userLogin) => {
    if (!window.confirm(`Вы уверены, что хотите удалить пользователя "${userLogin}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      alert('Пользователь успешно удален');
      loadUsers(); // Обновляем список пользователей
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Ошибка при удалении пользователя: ${error.message}`);
    }
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>Управление пользователями</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по email или имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {/* Добавим фильтр по ролям */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Все роли</option>
            <option value="student">Студенты</option>
            <option value="teacher">Преподаватели</option>
            <option value="admin">Администраторы</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar || '../../../public/vite.svg'} alt={user.login} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.login?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <h3>{user.login}</h3>
                  <p className="user-email">{user.email}</p>
                  <div className={`user-role-badge ${user.role}`}>
                    {user.role === 'student' && 'Студент'}
                    {user.role === 'teacher' && 'Преподаватель'}
                    {user.role === 'admin' && 'Администратор'}
                  </div>

                  {/* Статус пользователя */}
                  <div className="user-status">
                    <div className={`status-dot ${user.isOnline ? '' : 'offline'}`}></div>
                    <span>{user.isOnline ? 'В сети' : 'Не в сети'}</span>
                  </div>

                  {/* Статистика пользователя */}
                  <div className="user-stats">
                    <div className="stat-item">
                      <span className="stat-value">{user.recordedCourses || 0}</span>
                      <span className="stat-label">Курсы</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{user.completedCourses || 0}</span>
                      <span className="stat-label">Завершено</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="role-actions">
                <select 
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="role-select"
                >
                  <option value="student">Студент</option>
                  <option value="teacher">Преподаватель</option>
                  <option value="admin">Администратор</option>
                </select>
                
                {/* Кнопка удаления пользователя */}
                <button 
                  onClick={() => handleDeleteUser(user.id, user.login)}
                  className="btn-delete-user"
                  title="Удалить пользователя"
                  disabled={user.role === 'admin'} // Запрещаем удалять администраторов
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Сообщение если пользователи не найдены */}
      {!loading && filteredUsers.length === 0 && (
        <div className="empty-state">
          <p>Пользователи не найдены</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;