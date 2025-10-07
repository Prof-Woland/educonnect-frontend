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
import CreateCourse from './pages/CreateCourse/CreateCourse';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import AdminCourseDetail from './pages/AdminPanel/AdminCourseDetail/AdminCourseDetail';
import AdminCourseDetailPublished from './pages/AdminPanel/AdminCourseDetail/AdminCourseDetailPublished';
import AdminCourseDetailTeacher from './pages/AdminPanel/AdminCourseDetail/AdminCourseDetailTeacher';
import CourseManagementPage from './pages/CourseManagement/CourseManagement';
import ModuleDetail from './pages/CourseDetail/ModuleDetail';
import LessonDetail from './pages/CourseDetail/LessonDetail';

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
              <Route path="/admin/courses/:id" element={<AdminCourseDetail />} />
              <Route path="/admin/courses/published/:id" element={<AdminCourseDetailPublished />} />
              <Route path="/teacher/courses/:id" element={<AdminCourseDetailTeacher/>} />
              <Route path="/admin/courses-management" element={<CourseManagementPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/create-course" element={<CreateCourse/>} />
              <Route path="/courses/:courseId/modules/:moduleId" element={<ModuleDetail />} />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetail />} />
              <Route path="/admin/courses/:courseId/modules/:moduleId" element={<ModuleDetail />} />
              <Route path="/admin/courses/:courseId/lessons/:lessonId" element={<LessonDetail />} />
              <Route path="/admin" element={<AdminPanel />} />
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