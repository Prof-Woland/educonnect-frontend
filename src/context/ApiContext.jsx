import Cookies from "js-cookie";
import { refresh } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:3000';

// Users API
export const adminAPI = {
  // User Management
  getUsers: async (search = '') => {
    let token, user
    try{
        token = JSON.parse(Cookies.get('token'))
        user = JSON.parse(Cookies.get('user'))
        console.log(user)
        console.log(token)
    }catch{}
    const response = await fetch(`${API_BASE_URL}/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`
      }
    });
    if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
                useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    return response.json();
  },

  updateUserRole: async (userId, role) => {
    let token, user
    try{
        token = JSON.parse(Cookies.get('token'))
        user = JSON.parse(Cookies.get('user'))
    }catch{}
    const response = await fetch(`${API_BASE_URL}/admin/roles/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
      body: JSON.stringify({ role })
    });
        if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    return response.json();
  },

  // Course Moderation
  getPendingCourses: async () => {
    let token, user
    try{
        token = JSON.parse(Cookies.get('token'))
        user = JSON.parse(Cookies.get('user'))
    }catch{}
    const response = await fetch(`${API_BASE_URL}/admin/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`
      }
    });
        if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }

    const responseAll = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
    });
        if (!responseAll.ok) {
            if(responseAll.status == 401){
              await refresh(user.id);
            }
            const errorData = await responseAll.json();
            if(responseAll.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    return {pending: await response.json(), published: await responseAll.json()};
  },

  publishCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/admin/courses/publish/${courseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JSON.parse(Cookies.get('token')).accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    
    return response.json();
  },

  unpublishCourse: async (courseId) => {
        try {
          const token = JSON.parse(Cookies.get('token') || '{}');
          const response = await fetch(`${API_BASE_URL}/admin/pending/approve/${courseId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.accessToken}`
            },
            body:JSON.stringify({
              status:'approved'
            })
          });
    
         if (!response.ok) {
                 if(response.status == 401){
                   await refresh(user.id); // Используем user вместо userData
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
        } catch (error) {
          console.error('Error unpublishing course:', error);
          window.alert(`Ошибка при снятии курса с публикации: ${error.message}`);
        }
  },

  moderCourse: async (courseId) => {
        try {
          const token = JSON.parse(Cookies.get('token') || '{}');
          const response = await fetch(`${API_BASE_URL}/admin/pending/approve/${courseId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.accessToken}`
            },
            body:JSON.stringify({
              status:'moderating'
            })
          });
    
         if (!response.ok) {
                 if(response.status == 401){
                   await refresh(user.id); // Используем user вместо userData
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
        } catch (error) {
          console.error('Error unpublishing course:', error);
          window.alert(`Ошибка при снятии курса с публикации: ${error.message}`);
        }
  },

  addComplete: async (courseId) => {
        try {
          const token = JSON.parse(Cookies.get('token') || '{}');
          const response = await fetch(`${API_BASE_URL}/courses/complete/${courseId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.accessToken}`
            },
          });
    
         if (!response.ok) {
                 if(response.status == 401){
                   await refresh(user.id); // Используем user вместо userData
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
        } catch (error) {
          console.error('Error unpublishing course:', error);
          window.alert(`Ошибка при снятии курса с публикации: ${error.message}`);
        }
  },

  moderateCourse: async (courseId, action, feedback = '') => {
    let token, user
    try{
        token = JSON.parse(Cookies.get('token'))
        user = JSON.parse(Cookies.get('user'))
    }catch{}
    const response = await fetch(`${API_BASE_URL}/admin/pending/approve/:id${courseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
    });
        if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    return response.json();
  },

  deleteCourse: async (courseId) => {
    let token, user
    try{
        token = JSON.parse(Cookies.get('token'))
        user = JSON.parse(Cookies.get('user'))
    }catch{}
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`
      }
    });
        if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    return response.json();
  },

  // Metrics
  getMetrics: async () => {
    let token, user
    try{
        token = JSON.parse(Cookies.get('token'))
        user = JSON.parse(Cookies.get('user'))
    }catch{}
    const response = await fetch(`${API_BASE_URL}/admin/metrics`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`
      }
    });
        if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    return response.json();
  },

  deleteUser: async (id) => {
    let token
    try{
        token = JSON.parse(Cookies.get('token'))
    }catch{}
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`
      }
    });
        if (!response.ok) {
            if(response.status == 401){
              await refresh(user.id); // Используем user вместо userData
            }
            const errorData = await response.json();
            if(response.status == 403 && (errorData.message == 'Неверный ключ токена обновления'||errorData.message == 'Скомпрометированный токен доступа'
              ||errorData.message == 'Устаревший токен обновления'||errorData.message == 'Неверный ключ токена обновления'
              ||errorData.message == 'Невалидный токен обновления'||errorData.message == 'Скомпрометированный токен обновления'
              ||errorData.message=='Не удалось получить токен доступа из кэша. Токен скомпрометирован'
              ||errorData.message=='Не удалось получить токен обновления из кэша. Токен скомпрометирован')){
              Cookies.remove('user');
              Cookies.remove('token');
              useNavigate('/login')
            }
            throw new Error(errorData.message);
    }
    return response.json();
  },

  getAllCourses: async (email) => {
    const response = await fetch(`${API_BASE_URL}/courses/status/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JSON.parse(Cookies.get('token')).accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    
    return response.json();
  },
};