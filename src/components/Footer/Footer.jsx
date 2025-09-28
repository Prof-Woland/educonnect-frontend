// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import './Footer.css';

function Footer() {
  const { currentUser, logout } = useAuth();
  let user;
  try {
    user = JSON.parse(Cookies.get('user'));
  } catch {
    user = undefined;
  }

  function handleLogout() {
    logout();
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Link to="/" className="logo">
              <img src="../../../vite.svg" alt="EduConnect" />
              <span>EduConnect</span>
            </Link>
            <p>Образовательная платформа для всех</p>
          </div>
          
          <div className="footer-section">
            <h4>Навигация</h4>
            <nav className="footer-nav">
              <Link to="/">Главная</Link>
              <Link to="/courses">Курсы</Link>
              <Link to="/community">Сообщество</Link>
              {user ? (
                <Link to="/account">Аккаунт</Link>
              ) : (
                <Link to="/login">Войти</Link>
              )}
            </nav>
          </div>

          <div className="footer-section">
            <h4>Контакты</h4>
            <p>Email: professorwolandt@gmail.com</p>
            <p>Телефон: +375 (29) 640-65-91</p>
          </div>

          <div className="footer-section">
            <h4>Социальные сети</h4>
            <div className="social-links">
              <a href="#">VK</a>
              <a href="#">Telegram</a>
              <a href="#">YouTube</a>
            </div>
          </div>

          {user && (
            <div className="footer-section">
              <button onClick={handleLogout} className="logout-button">
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 EduConnect. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;