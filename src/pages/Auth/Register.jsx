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
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const { register } = useAuth();
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
    
    // Валидация email
    if (!validateEmail(email)) {
      return;
    }
    
    // Валидация пароля
    if (!validatePassword(password)) {
      return;
    }
    
    if (password !== confirmPassword) {
      return setError('Пароли не совпадают');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(name, email.toLowerCase(), password);
      navigate('/account');
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Валидация в реальном времени
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Регистрация</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group-auth">
              <label>Имя и фамилия</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            
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
              <div className="email-requirements">
                Допустимые домены: gmail.com, mail.ru, yandex.ru, tut.by
              </div>
            </div>
            
            <div className="form-group-auth">
              <label>Пароль</label>
              <input 
                type="password" 
                value={password}
                onChange={handlePasswordChange}
                required 
              />
              {passwordError && <div className="field-error">{passwordError}</div>}
              <div className="password-requirements">
                Минимум 8 символов
              </div>
            </div>
            
            <div className="form-group-auth">
              <label>Подтвердите пароль</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" disabled={loading || passwordError || emailError} className="auth-button">
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