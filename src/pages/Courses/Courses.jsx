// src/pages/Courses.js
import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/CourseCard/CourseCard';
import Cookies from 'js-cookie';
import coursesData from '../../data/coursesData';
import './Courses.css';

function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity-desc');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let isNotEmpty = true;

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const data = await getAll();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
  }

  function handleFilterChange(event) {
    setFilter(event.target.value);
  }

  function handleSortChange(event) {
    setSortBy(event.target.value);
  }

  let filteredCourses;
  if (courses.length === 0) {
    isNotEmpty = false;
  } else {
    isNotEmpty = true;
    
    // Фильтрация
    filteredCourses = courses.filter(function(course) {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || course.category === filter;
      return matchesSearch && matchesFilter;
    });

    // Сортировка
    filteredCourses.sort(function(a, b) {
      switch (sortBy) {
        case 'popularity-desc':
          return b.studentsCount - a.studentsCount;
        case 'popularity-asc':
          return a.studentsCount - b.studentsCount;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-desc':
          return b.cost - a.cost;
        case 'price-asc':
          return a.cost - b.cost;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }

  return (
    <div className="courses-page">
      <div className="container">
        <div className="courses-header">
          <h1>Все курсы</h1>
          <div className="controls">
            <input 
              className='search-input'
              type="text" 
              placeholder="Поиск курсов..." 
              onChange={handleSearchChange}
            />
            <select onChange={handleFilterChange}>
              <option value="all">Все направления</option>
              <option value="programming">Программирование</option>
              <option value="design">Дизайн</option>
            </select>
            <select onChange={handleSortChange} value={sortBy}>
              <option value="popularity-desc">Популярность (убыв.)</option>
              <option value="popularity-asc">Популярность (возраст.)</option>
              <option value="newest">Новизна (новые)</option>
              <option value="oldest">Новизна (старые)</option>
              <option value="price-desc">Стоимость (убыв.)</option>
              <option value="price-asc">Стоимость (возраст.)</option>
              <option value="rating-desc">Рейтинг (убыв.)</option>
              <option value="rating-asc">Рейтинг (возраст.)</option>
            </select>
          </div>
        </div>
        <div className="courses-grid">
          {isNotEmpty ? filteredCourses.map(function(course) {
            return <CourseCard key={course.id} course={course} />;
          }) : <div className='empty '>Здесь пока ничего нет!</div>}
        </div>
      </div>
    </div>
  );
}

async function getAll(){
  try {
    const response = await fetch('http://localhost:3000/courses', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    
    const data = await response.json();
    console.log('Popular courses from API:', data);
    
    // Проверяем, что data - массив
    if (!Array.isArray(data)) {
      console.warn('API returned non-array data:', data);
      return [];
    }
    Cookies.set('courses', JSON.stringify(data), {expires: 0.5})
    return data;
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    throw error;
  }
}

export default Courses;