import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const { login, refresh } = useAuth();
  const navigate = useNavigate();

  // Регулярное выражение для проверки пароля (минимум 8 символов)
  const passwordRegex = /^.{8,}$/;
  // Регулярное выражение для проверки email (только указанные домены)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(gmail\.com|mail\.ru|yandex\.ru|tut\.by)$/;

  const validatePassword = (password) => {
    if (!passwordRegex.test(password)) {
      setPasswordError('Пароль должен содержать минимум 8 символов');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateEmail = (email) => {
    if (email && !emailRegex.test(email.toLowerCase())) {
      setEmailError('Введите корректный email адрес с одним из допустимых доменов: gmail.com, mail.ru, yandex.ru или tut.by');
      return false;
    }
    setEmailError('');
    return true;
  };

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Валидация email перед отправкой
    if (!validateEmail(email)) {
      return;
    }
    
    // Валидация пароля перед отправкой
    if (!validatePassword(password)) {
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email.toLowerCase(), password);
      navigate('/account');
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Валидация в реальном времени (опционально)
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Валидация в реальном времени (опционально)
    if (newPassword && !passwordRegex.test(newPassword)) {
      setPasswordError('Пароль должен содержать минимум 8 символов');
    } else {
      setPasswordError('');
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Вход в аккаунт</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group-auth">
              <label>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={handleEmailChange}
                required 
              />
              {emailError && (
                <div className="error-message" style={{fontSize: '12px', marginTop: '5px'}}>
                  {emailError}
                </div>
              )}
            </div>
            
            <div className="form-group-auth">
              <label>Пароль</label>
              <input 
                type="password" 
                value={password}
                onChange={handlePasswordChange}
                required 
              />
              {passwordError && (
                <div className="error-message" style={{fontSize: '12px', marginTop: '5px'}}>
                  {passwordError}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={loading || passwordError || emailError} 
              className="auth-button"
            >
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