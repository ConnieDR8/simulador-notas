// api/courses.js
import { getDatabase } from './_utils/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
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
    const { firebaseUid } = req.query;

    console.log('🔍 Buscando estudiante con firebaseUid:', firebaseUid);

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid es requerido' });
    }

    const db = await getDatabase();

    // 1. Buscar el estudiante por firebaseUid
    const student = await db.collection('students').findOne({ firebaseUid });

    console.log('👤 Estudiante encontrado:', student);

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // 2. Obtener las matrículas del estudiante
    const registrations = await db.collection('registrations')
      .find({ student_id: student._id })
      .toArray();

    console.log('📝 Matrículas encontradas:', registrations.length);

    // 3. Obtener los IDs de cursos (ya son ObjectId)
    const courseIds = registrations.map(r => r.course_id);

    // 4. Obtener los detalles de cada curso
    const courses = await db.collection('courses')
      .find({ _id: { $in: courseIds } })
      .toArray();

    console.log('📚 Cursos encontrados:', courses.length);

    // 5. Retornar los cursos con información del estudiante
    return res.status(200).json({
      student: {
        id: student._id.toString(),
        codigo: student.codigo,
        nombre: student.nombre,
        email: student.email
      },
      courses: courses.map(course => ({
        _id: course._id.toString(),
        codigo: course.codigo,
        nombre: course.nombre,
        evaluaciones: course.evaluaciones
      }))
    });

  } catch (error) {
    console.error('❌ Error en /api/courses:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}