// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import './Header.css';

function Header() {
  const { currentUser, logout } = useAuth();
  let user
  try{
    user = JSON.parse(Cookies.get('user'));
  }
  catch{
    user = undefined;
  }
  

  function handleLogout() {
    logout();
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="../../../public/vite.svg" alt="EduConnect" />
            <span>EduConnect</span>
          </Link>
          <nav>
            <Link to="/">Главная</Link>
            <Link to="/courses">Курсы</Link>
            <Link to="/community">Сообщество</Link>
            {user ? (
              <>
                <Link to="/account">Аккаунт</Link>
                <button onClick={handleLogout} className="logout-button">
                  Выйти
                </button>
              </>
            ) : (
              <Link to="/login">Войти</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;