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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-red-800 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700">Cargando notas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="w-full bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition duration-200"
          >
            Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header del curso */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-red-800 hover:text-red-900 font-semibold mb-4 transition duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver a mis cursos
          </button>
          
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-red-800 to-red-900 p-4 rounded-lg">
              <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{curso?.nombre || 'Curso'}</h1>
              <p className="text-gray-600 mt-1">Código: {curso?.codigo || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Evaluaciones */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-red-800 to-amber-400 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">Evaluaciones</h2>
          </div>
          
          {evaluaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No hay evaluaciones registradas</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Evaluación</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Peso</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluaciones.map((ev, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-4 font-medium text-gray-800">{ev.nombre}</td>
                        <td className="text-center py-4 px-4">
                          <span className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
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
                              className="w-24 px-3 py-2 border-2 border-red-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none"
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

              {/* Promedios */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                  <p className="text-sm font-bold text-gray-600 mb-2">Promedio Actual</p>
                  <p className="text-4xl font-bold text-gray-800">
                    {promedioActual.toFixed(2)}
                  </p>
                </div>
                {simulando && (
                  <div className={`p-6 rounded-xl border-2 ${
                    esAprobado(promedioSimulado)
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-bold ${
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
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-800 to-red-900 text-white px-8 py-4 rounded-lg font-bold hover:from-red-900 hover:to-red-950 transition duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                    Calcular próximas notas
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGuardar}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-700 transition duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                      </svg>
                      Guardar Simulación
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-bold hover:bg-gray-300 transition duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
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
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-red-800 to-amber-400 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900">Historial de Simulaciones</h2>
            </div>
            <div className="space-y-4">
              {historial.map((sim, index) => (
                <div key={index} className="border-l-4 border-red-800 bg-red-50 pl-6 pr-4 py-4 rounded-r-lg hover:bg-red-100 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <p className="text-sm text-gray-700 font-medium">
                      {new Date(sim.fecha).toLocaleString('es-PE', {
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
                        <span key={i} className="inline-flex items-center bg-white px-3 py-1 rounded-full text-sm border border-gray-300 shadow-sm">
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