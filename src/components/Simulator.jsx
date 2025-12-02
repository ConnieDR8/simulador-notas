// src/components/Simulator.jsx
// Componente principal del simulador de notas

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
      // No mostramos error al usuario porque el historial es opcional
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando notas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-600 text-center">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/courses')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Volver a cursos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Volver a mis cursos
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">{curso?.nombre || 'Curso'}</h1>
          <p className="text-gray-600">Código: {curso?.codigo || 'N/A'}</p>
        </div>

        {/* Tabla de Evaluaciones */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Evaluaciones</h2>
          
          {evaluaciones.length === 0 ? (
            <p className="text-gray-500">No hay evaluaciones registradas</p>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Evaluación</th>
                    <th className="text-center py-2">Peso (%)</th>
                    <th className="text-center py-2">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((ev, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{ev.nombre}</td>
                      <td className="text-center">{ev.peso}%</td>
                      <td className="text-center">
                        {simulando && ev.nota === null ? (
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={ev.notaSimulada}
                            onChange={(e) => handleNotaChange(index, e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-center"
                            placeholder="0.0"
                          />
                        ) : (
                          <span className={ev.nota === null ? 'text-gray-400' : 'font-semibold'}>
                            {ev.nota !== null ? ev.nota : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Promedios */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Promedio Actual</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {promedioActual.toFixed(2)}
                  </p>
                </div>
                {simulando && (
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Promedio Simulado</p>
                    <p className="text-2xl font-bold text-green-600">
                      {promedioSimulado.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="mt-6 flex gap-4">
                {!simulando ? (
                  <button
                    onClick={handleSimular}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Calcular próximas notas
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGuardar}
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                      Guardar Simulación
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
                    >
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Historial de Simulaciones</h2>
            <div className="space-y-4">
              {historial.map((sim, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm text-gray-600">
                    {new Date(sim.fecha).toLocaleString('es-PE')}
                  </p>
                  <p className="font-semibold">
                    Promedio simulado: {sim.promedio_simulado?.toFixed(2) || 'N/A'}
                  </p>
                  {sim.evaluaciones_simuladas && (
                    <div className="text-sm text-gray-600 mt-1">
                      {sim.evaluaciones_simuladas.map((ev, i) => (
                        <span key={i}>
                          {ev.nombre}: {ev.nota_simulada}
                          {i < sim.evaluaciones_simuladas.length - 1 && ' • '}
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