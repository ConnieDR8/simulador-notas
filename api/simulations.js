// api/simulations.js
// Función serverless para manejar las simulaciones de notas

import { getDatabase } from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDatabase();

    // GET: Obtener simulaciones de un estudiante para un curso
    if (req.method === 'GET') {
      const { studentId, courseId } = req.query;

      console.log('📋 Buscando simulaciones para:', { studentId, courseId });

      if (!studentId || !courseId) {
        return res.status(400).json({ 
          error: 'studentId y courseId son requeridos' 
        });
      }

      const simulations = await db.collection('simulations')
        .find({
          student_id: new ObjectId(studentId),
          course_id: new ObjectId(courseId)
        })
        .sort({ fecha: -1 })
        .limit(10)
        .toArray();

      console.log('✅ Simulaciones encontradas:', simulations.length);

      return res.status(200).json({ simulations });
    }

    // POST: Guardar una nueva simulación
    if (req.method === 'POST') {
      const { studentId, courseId, evaluacionesSimuladas, promedioActual, promedioSimulado } = req.body;

      console.log('💾 Guardando simulación:', {
        studentId,
        courseId,
        evaluacionesSimuladas
      });

      if (!studentId || !courseId || !evaluacionesSimuladas) {
        return res.status(400).json({ 
          error: 'Faltan datos requeridos' 
        });
      }

      const newSimulation = {
        student_id: new ObjectId(studentId),
        course_id: new ObjectId(courseId),
        fecha: new Date(),
        evaluaciones_simuladas: evaluacionesSimuladas,
        promedio_actual: promedioActual,
        promedio_simulado: promedioSimulado
      };

      const result = await db.collection('simulations').insertOne(newSimulation);

      console.log('✅ Simulación guardada con ID:', result.insertedId);

      return res.status(201).json({
        message: 'Simulación guardada exitosamente',
        simulationId: result.insertedId
      });
    }

    // DELETE: Eliminar una simulación
    if (req.method === 'DELETE') {
      const { simulationId } = req.query;

      console.log('🗑️ Eliminando simulación:', simulationId);

      if (!simulationId) {
        return res.status(400).json({ error: 'simulationId es requerido' });
      }

      await db.collection('simulations').deleteOne({
        _id: new ObjectId(simulationId)
      });

      console.log('✅ Simulación eliminada');

      return res.status(200).json({ message: 'Simulación eliminada' });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('❌ Error en /api/simulations:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}