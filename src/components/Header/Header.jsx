// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import './Header.css';

function Header() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth();
  let user, role
  try{
    user = JSON.parse(Cookies.get('user'));
  }
  catch{
    user = undefined;
  }
  if(user == undefined){
    role = 'student'
  }else{
    role = user.role
  }
  

  function handleLogout() {
    logout();
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="../../../vite.svg" alt="EduConnect" />
            <span>EduConnect</span>
          </Link>
          <nav>
            <Link to="/">Главная</Link>
            <Link to="/courses">Курсы</Link>
            <Link to="/community">Сообщество</Link>
            {(role == 'teacher'||role == 'admin')?(<Link to="/create-course">Создать курс</Link>): null}
            {(role == 'admin')?(<Link to="/admin">Админ. панель</Link>): null}
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