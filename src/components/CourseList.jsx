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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando cursos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-600 text-center max-w-md">
          <p className="text-xl font-bold mb-2">Error</p>
          <p className="text-sm bg-red-50 p-4 rounded">{error}</p>
        </div>
        <button
          onClick={fetchCourses}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
        <button
          onClick={handleLogout}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Simulador de Notas</h1>
            {student && (
              <p className="text-sm">{student.nombre} - {student.codigo}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Mis Cursos</h2>
        
        {!courses || courses.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-gray-700">No tienes cursos matriculados</p>
            {student && (
              <p className="text-sm text-gray-500 mt-2">
                Usuario: {student.email}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {course.codigo}
                </h3>
                <p className="text-gray-600 mb-4">{course.nombre}</p>
                <button
                  onClick={() => handleViewGrades(course._id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                  Ver Notas
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}