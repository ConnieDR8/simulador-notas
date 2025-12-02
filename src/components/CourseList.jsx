// src/components/CourseList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CourseList() {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchCourses();
    }
  }, [currentUser]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Buscando cursos para:', currentUser.uid);
      
      const response = await axios.get('/api/courses', {
        params: { firebaseUid: currentUser.uid }
      });
      
      console.log('✅ Respuesta recibida:', response.data);
      
      setStudent(response.data.student || null);
      setCourses(Array.isArray(response.data.courses) ? response.data.courses : []);
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Error al cargar los cursos';
      
      setError(errorMessage);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleViewGrades = (courseId) => {
    navigate(`/grades/${student.id}/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-red-800 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700">Cargando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border border-gray-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h2>
            <p className="text-gray-600 bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={fetchCourses}
              className="w-full bg-red-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-900 transition duration-200"
            >
              Reintentar
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
            >
              Volver al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-amber-400 p-3 rounded-lg shadow-md">
                <svg className="w-8 h-8 text-red-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                  <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Simulador de Notas</h1>
                {student && (
                  <p className="text-sm text-red-100 mt-1">{student.nombre} • Código: {student.codigo}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-950 hover:bg-black px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-lg"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Cursos</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-red-800 to-amber-400 rounded"></div>
        </div>
        
        {!courses || courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay cursos disponibles
              </h3>
              <p className="text-gray-600">No tienes cursos matriculados en este momento</p>
              {student && (
                <p className="text-sm text-gray-500 mt-4">
                  Usuario: {student.email}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200"
              >
                <div className="bg-gradient-to-br from-red-800 to-red-900 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <span className="inline-block bg-amber-400 text-red-900 px-3 py-1 rounded-full text-sm font-bold mb-3">
                      {course.codigo}
                    </span>
                    <h3 className="text-xl font-bold text-white line-clamp-2 min-h-[3.5rem]">
                      {course.nombre}
                    </h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <button
                    onClick={() => handleViewGrades(course._id)}
                    className="w-full bg-gradient-to-r from-red-800 to-red-900 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-900 hover:to-red-950 transition duration-200 group-hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Ver Notas
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}