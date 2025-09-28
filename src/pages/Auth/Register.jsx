// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Пароли не совпадают');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(name, email, password);
      navigate('/account');
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Регистрация</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Имя и фамилия</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Пароль</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Подтвердите пароль</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            
            <div className="auth-link">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;