import React, { useState } from 'react';
import UserManagement from '../../components/Admin/UserManagement';
import CourseModeration from '../../components/Admin/CourseModeration';
import MetricsDashboard from '../../components/Admin/MetricsDashboard';
import '../../components/Admin/AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('metrics');

  const tabs = [
    { id: 'metrics', label: '📊 Метрики' },
    { id: 'users', label: '👥 Пользователи' },
    { id: 'courses', label: '📚 Модерация курсов' }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'users': return <UserManagement />;
      case 'courses': return <CourseModeration />;
      case 'metrics': return <MetricsDashboard />;
      default: return <MetricsDashboard />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="container">
        <h1 className="admin-title">Панель администратора</h1>
        
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;