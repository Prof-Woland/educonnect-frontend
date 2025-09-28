// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, refresh } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
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
            <h2>Вход в аккаунт</h2>
            
            {error && <div className="error-message">{error}</div>}
            
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
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Вход...' : 'Войти'}
            </button>
            
            <div className="auth-link">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;