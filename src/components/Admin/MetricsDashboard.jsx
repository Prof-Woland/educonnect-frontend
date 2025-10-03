import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../context/ApiContext';
import './AdminPanel.css';

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await adminAPI.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка метрик...</div>;
  }

  if (!metrics) {
    return <div className="error">Ошибка загрузки метрик</div>;
  }

  return (
    <div className="metrics-dashboard">
      <h2>Аналитика платформы</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalUsers}</div>
          <div className="metric-label">Всего пользователей</div>
          <div className="metric-trend">
            <span className="trend-up">+{metrics.newUsersThisWeek} за неделю</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.totalCourses}</div>
          <div className="metric-label">Всего курсов</div>
          <div className="metric-trend">
            <span className="trend-up">+{metrics.newCoursesThisWeek} новых</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.pendingModeration}</div>
          <div className="metric-label">Курсов на модерации</div>
          <div className="metric-trend">
            <span className="trend-warning">требуют внимания</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{metrics.activeStudents}</div>
          <div className="metric-label">Активных студентов</div>
          <div className="metric-trend">
            <span className="trend-up">+{metrics.studentGrowth}% рост</span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Распределение по ролям</h3>
          <div className="role-distribution">
            {metrics.roleDistribution && Object.entries(metrics.roleDistribution).map(([role, count]) => (
              <div key={role} className="role-item">
                <span className="role-name">{role}</span>
                <span className="role-count">{count}</span>
                <div className="role-bar">
                  <div 
                    className="role-fill" 
                    style={{ 
                      width: `${(count / metrics.totalUsers) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Статусы курсов</h3>
          <div className="course-status">
            {metrics.courseStatus && Object.entries(metrics.courseStatus).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className="status-name">{status}</span>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Последние действия</h3>
        <div className="activity-list">
          {metrics.recentActivity && metrics.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-type">{activity.type}</span>
              <span className="activity-description">{activity.description}</span>
              <span className="activity-time">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;