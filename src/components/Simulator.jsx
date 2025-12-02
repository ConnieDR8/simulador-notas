// src/components/Simulator.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Simulator() {
  const { studentId, courseId } = useParams();
  const navigate = useNavigate();
  
  const [curso, setCurso] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [promedioActual, setPromedioActual] = useState(0);
  const [promedioSimulado, setPromedioSimulado] = useState(0);
  const [simulando, setSimulando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    fetchGrades();
    fetchSimulations();
  }, [studentId, courseId]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Obteniendo notas para:', { studentId, courseId });
      
      const response = await axios.get('/api/notas', {
        params: { studentId, courseId }
      });
      
      console.log('✅ Notas recibidas:', response.data);
      
      setCurso(response.data.curso);
      setEvaluaciones(response.data.notas || []);
      setPromedioActual(response.data.promedioActual || 0);
      setPromedioSimulado(response.data.promedioActual || 0);
      
    } catch (error) {
      console.error('❌ Error al cargar notas:', error);
      setError(error.response?.data?.error || 'Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimulations = async () => {
    try {
      console.log('🔍 Obteniendo historial de simulaciones');
      
      const response = await axios.get('/api/simulations', {
        params: { studentId, courseId }
      });
      
      console.log('✅ Historial recibido:', response.data);
      
      setHistorial(response.data.simulations || []);
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
    }
  };

  const calcularPromedio = (evals) => {
    let suma = 0;
    let pesoTotal = 0;

    evals.forEach(ev => {
      const nota = simulando && ev.notaSimulada !== undefined 
        ? ev.notaSimulada 
        : ev.nota;
      
      if (nota !== null && nota !== '') {
        suma += parseFloat(nota) * ev.peso;
        pesoTotal += ev.peso;
      }
    });

    return pesoTotal > 0 ? suma / pesoTotal : 0;
  };

  const handleSimular = () => {
    setSimulando(true);
    const evalsConSimulacion = evaluaciones.map(ev => ({
      ...ev,
      notaSimulada: ev.nota !== null ? ev.nota : ''
    }));
    setEvaluaciones(evalsConSimulacion);
  };

  const handleNotaChange = (index, valor) => {
    const nuevasEvals = [...evaluaciones];
    nuevasEvals[index].notaSimulada = valor === '' ? '' : parseFloat(valor);
    setEvaluaciones(nuevasEvals);
    setPromedioSimulado(calcularPromedio(nuevasEvals));
  };

  const handleGuardar = async () => {
    try {
      const evaluacionesSimuladas = evaluaciones
        .filter(ev => ev.nota === null && ev.notaSimulada !== '')
        .map(ev => ({
          nombre: ev.nombre,
          nota_simulada: ev.notaSimulada
        }));

      if (evaluacionesSimuladas.length === 0) {
        alert('No hay notas simuladas para guardar');
        return;
      }

      console.log('💾 Guardando simulación:', evaluacionesSimuladas);

      await axios.post('/api/simulations', {
        studentId,
        courseId,
        evaluacionesSimuladas,
        promedioActual,
        promedioSimulado
      });

      alert('Simulación guardada exitosamente');
      setSimulando(false);
      fetchSimulations();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la simulación: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelar = () => {
    setSimulando(false);
    fetchGrades();
  };

  const esAprobado = (nota) => nota >= 10.5;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700">Cargando notas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
          >
            <span>←</span>
            Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header del curso */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition duration-200"
          >
            <span>←</span>
            Volver a mis cursos
          </button>
          
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl">
              <span className="text-4xl">🧮</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{curso?.nombre || 'Curso'}</h1>
              <p className="text-gray-600 mt-1">Código: {curso?.codigo || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Evaluaciones */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📊</span>
            <h2 className="text-2xl font-bold text-gray-900">Evaluaciones</h2>
          </div>
          
          {evaluaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <p className="text-gray-500">No hay evaluaciones registradas</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Evaluación</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">Peso</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluaciones.map((ev, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-4 font-medium text-gray-800">{ev.nombre}</td>
                        <td className="text-center py-4 px-4">
                          <span className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {ev.peso}%
                          </span>
                        </td>
                        <td className="text-center py-4 px-4">
                          {simulando && ev.nota === null ? (
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={ev.notaSimulada}
                              onChange={(e) => handleNotaChange(index, e.target.value)}
                              className="w-24 px-3 py-2 border-2 border-blue-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              placeholder="0.0"
                            />
                          ) : (
                            <span className={`text-lg font-bold ${
                              ev.nota === null 
                                ? 'text-gray-400' 
                                : esAprobado(ev.nota) 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                            }`}>
                              {ev.nota !== null ? ev.nota.toFixed(1) : '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Promedios con emojis */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-2">Promedio Actual</p>
                  <p className="text-4xl font-bold text-blue-700">
                    {promedioActual.toFixed(2)}
                  </p>
                </div>
                {simulando && (
                  <div className={`p-6 rounded-2xl border-2 ${
                    esAprobado(promedioSimulado)
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-semibold ${
                        esAprobado(promedioSimulado) ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Promedio Simulado
                      </p>
                      <span className="text-4xl">
                        {esAprobado(promedioSimulado) ? '😊' : '😔'}
                      </span>
                    </div>
                    <p className={`text-4xl font-bold ${
                      esAprobado(promedioSimulado) ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {promedioSimulado.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {!simulando ? (
                  <button
                    onClick={handleSimular}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-xl">🧮</span>
                    Calcular próximas notas
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGuardar}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="text-xl">💾</span>
                      Guardar Simulación
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-300 transition duration-200"
                    >
                      <span className="text-xl">❌</span>
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Historial */}
        {historial.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📜</span>
              <h2 className="text-2xl font-bold text-gray-900">Historial de Simulaciones</h2>
            </div>
            <div className="space-y-4">
              {historial.map((sim, index) => (
                <div key={index} className="border-l-4 border-blue-500 bg-blue-50 pl-6 pr-4 py-4 rounded-r-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <p className="text-sm text-gray-600 font-medium">
                      📅 {new Date(sim.fecha).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className={`text-lg font-bold ${
                      esAprobado(sim.promedio_simulado) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Promedio: {sim.promedio_simulado?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  {sim.evaluaciones_simuladas && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {sim.evaluaciones_simuladas.map((ev, i) => (
                        <span key={i} className="inline-flex items-center bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                          <span className="font-medium text-gray-700">{ev.nombre}:</span>
                          <span className={`ml-1 font-bold ${
                            esAprobado(ev.nota_simulada) ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {ev.nota_simulada}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}