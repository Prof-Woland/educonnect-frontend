// src/pages/Community.js (обновленная версия)
import React from 'react';
import './Community.css';

const Community = () => {
  const discussions = [
    { id: 1, title: 'Как лучше изучать React?', author: 'Иван Петров', replies: 24 },
    { id: 2, title: 'Советы по подготовке к собеседованию', author: 'Мария Сидорова', replies: 18 },
    { id: 3, title: 'Лучшие практики JavaScript', author: 'Алексей Иванов', replies: 32 }
  ];

  const events = [
    { id: 1, date: '15.12.2024', title: 'Вебинар: Современный CSS', time: '19:00' },
    { id: 2, date: '20.12.2024', title: 'Встреча выпускников', time: '18:30' },
    { id: 3, date: '25.12.2024', title: 'Мастер-класс по TypeScript', time: '20:00' }
  ];

  return (
    <div className="community">
      <div className="container">
        <h1>Сообщество EduConnect</h1>
        <div className="community-content">
          <div className="forum-preview">
            <h2>Активные обсуждения</h2>
            {discussions.map(discussion => (
              <div key={discussion.id} className="discussion-item">
                <div className="discussion-title">{discussion.title}</div>
                <div className="discussion-meta">
                  Автор: {discussion.author} | Ответов: {discussion.replies}
                </div>
              </div>
            ))}
          </div>
          <div className="events">
            <h2>Предстоящие события</h2>
            {events.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date">{event.date} в {event.time}</div>
                <div className="event-title">{event.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;