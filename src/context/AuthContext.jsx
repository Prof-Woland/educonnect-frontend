// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    checkAuthStatus();
    setLoading(false);
  }, []);

  async function checkAuthStatus() {
    try {
      const cookieUser = Cookies.get('user');
      
      if (cookieUser) {
        const userData = JSON.parse(cookieUser);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Реальный API запрос для авторизации
  async function login(email, password) {
    try {
      const response = await fetch('http://localhost:3000/auth/authorization', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка авторизации');
      }
      const userData = await response.json();
      setCurrentUser(userData.user);
      Cookies.set('user', JSON.stringify(userData.user), {expires: 0.292})
      Cookies.set('token', JSON.stringify(userData.tokens), {expires: 0.042})
      return userData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Реальный API запрос для регистрации
  async function register(name, email, password) {
    try {
      const response = await fetch('http://localhost:3000/auth/registration', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login:name, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка регистрации');
      }
      
      const userData = await response.json();
      setCurrentUser(userData.user);
      Cookies.set('user', JSON.stringify(userData.user), {expires: 0.292})
      Cookies.set('token', JSON.stringify(userData.tokens), {expires: 0.042})
      return userData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // API запрос для выхода
  async function logout() {
    if(window.confirm('Вы точно хотите выйти из аккаунта?')){
      try {
        const token = JSON.parse(Cookies.get('token'));
        await fetch('http://localhost:3000/auth/logout', { 
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`
          }
        });
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      } finally {
        setCurrentUser(null);
        Cookies.remove('user');
        Cookies.remove('token');
        Cookies.remove('ownCourses')
      }
    }
  }

  // API запрос для обновления профиля
  async function updateProfile(profileData) {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.tokens}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления профиля');
      }
      
      const updatedUser = await response.json();
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && props.children}
    </AuthContext.Provider>
  );
}

export async function refresh(id){
    try {
      const response = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({
          id:id
        })
      });
      
      if (!response.ok) {
        if(response.status == 401){
          await refresh(userData.id)
        }
        const errorData = await response.json();
        if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
          ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
          ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
          ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
          ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
          Cookies.remove('user');
          Cookies.remove('token');
        }
        
        throw new Error(errorData.message);
      }
      
      const updatedUser = await response.json();
      Cookies.set('token', JSON.stringify(updatedUser.accessToken), {expires: 0.042})
    } catch (error) {
      throw new Error(error.message);
    }
  }