// api/notas.js
// Función serverless para obtener las notas de un estudiante en un curso específico

import { getDatabase } from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { studentId, courseId } = req.query;

    console.log('📝 Buscando notas para:', { studentId, courseId });

    if (!studentId || !courseId) {
      return res.status(400).json({ 
        error: 'studentId y courseId son requeridos' 
      });
    }

    const db = await getDatabase();

    // Buscar las notas del estudiante para el curso
    const notas = await db.collection('notas').findOne({
      student_id: new ObjectId(studentId),
      course_id: new ObjectId(courseId)
    });

    console.log('📊 Notas encontradas:', notas);

    if (!notas) {
      return res.status(404).json({ 
        error: 'No se encontraron notas para este estudiante y curso' 
      });
    }

    // Calcular el promedio actual (solo con notas existentes)
    let sumaNotas = 0;
    let sumaPesos = 0;

    notas.evaluaciones.forEach(evaluacion => {
      if (evaluacion.nota !== null) {
        sumaNotas += evaluacion.nota * evaluacion.peso;
        sumaPesos += evaluacion.peso;
      }
    });

    const promedioActual = sumaPesos > 0 ? sumaNotas / sumaPesos : 0;

    console.log('📈 Promedio calculado:', promedioActual);

    // Obtener información del curso
    const course = await db.collection('courses').findOne({
      _id: new ObjectId(courseId)
    });

    console.log('📚 Curso encontrado:', course);

    return res.status(200).json({
      notas: notas.evaluaciones,
      promedioActual: parseFloat(promedioActual.toFixed(2)),
      curso: {
        codigo: course?.codigo || 'N/A',
        nombre: course?.nombre || 'Curso sin nombre'
      }
    });

  } catch (error) {
    console.error('❌ Error en /api/notas:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}