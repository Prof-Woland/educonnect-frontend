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
      console.log(users)
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  let filteredUsers

    filteredUsers = users.filter(function(user) {
      const matchesSearch = user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || course.category === filter;
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
                    <img src='../../../public/vite.svg' alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name?.charAt(0).toUpperCase()}
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

                    // И добавьте статус пользователя (пример):
                    <div className="user-status">
                    <div className={`status-dot ${user.isOnline ? '' : 'offline'}`}></div>
                    <span>{user.isOnline ? 'В сети' : 'Не в сети'}</span>
                    </div>

                    // И статистику (пример):
                    <div className="user-stats">
                    <div className="stat-item">
                        <span className="stat-value">{user.coursesCount || 0}</span>
                        <span className="stat-label">Курсы</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.completedCourses || 0}</span>
                        <span className="stat-label">Завершено</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.rating || '0.0'}</span>
                        <span className="stat-label">Рейтинг</span>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;