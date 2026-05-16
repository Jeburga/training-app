import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const { day, date } = event.queryStringParameters || {};

    let workouts;
    
    if (day && date) {
      // Obtener workout específico
      workouts = await sql`
        SELECT * FROM workouts 
        WHERE day = ${day} AND workout_date = ${date}
        ORDER BY exercise_index
      `;
    } else {
      // Obtener todos los workouts recientes
      workouts = await sql`
        SELECT * FROM workouts 
        ORDER BY workout_date DESC, day, exercise_index
        LIMIT 500
      `;
    }

    // Convertir a formato que usa el frontend
    const formatted = {};
    workouts.forEach(w => {
      const key = `${w.day}-${w.workout_date}`;
      if (!formatted[key]) formatted[key] = {};
      formatted[key][w.exercise_index] = {
        sets: w.sets,
        notes: w.notes
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    };
  } catch (error) {
    console.error('Error obteniendo workouts:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
