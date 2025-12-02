// src/components/CourseList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, LogOut, RefreshCw, User, GraduationCap, ChevronRight, AlertCircle } from 'lucide-react';

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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700">Cargando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h2>
            <p className="text-gray-600 bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={fetchCourses}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              Reintentar
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
            >
              <LogOut className="w-5 h-5" />
              Volver al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header mejorado */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Simulador de Notas</h1>
                {student && (
                  <div className="flex items-center gap-2 mt-1 text-blue-100">
                    <User className="w-4 h-4" />
                    <p className="text-sm">{student.nombre} • {student.codigo}</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition duration-200 shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido mejorado */}
      <div className="container mx-auto px-6 py-8">
        {/* Título de sección */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Cursos</h2>
          <p className="text-gray-600">Selecciona un curso para simular tus notas</p>
        </div>
        
        {!courses || courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-yellow-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-yellow-600" />
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
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {course.codigo}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4 line-clamp-2">
                    {course.nombre}
                  </h3>
                </div>
                
                <div className="p-6">
                  <button
                    onClick={() => handleViewGrades(course._id)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 group-hover:shadow-lg"
                  >
                    <span>Ver Notas</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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