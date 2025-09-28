// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Courses from './pages/Courses/Courses';
import Community from './pages/Community/Community';
import Account from './pages/Account/Account';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/community" element={<Community />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;