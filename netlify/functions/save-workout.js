import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const { day, date, exerciseIndex, sets, notes } = JSON.parse(event.body);

    // Validar datos
    if (!day || !date || exerciseIndex === undefined) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Faltan datos requeridos' }) 
      };
    }

    // Guardar o actualizar workout
    await sql`
      INSERT INTO workouts (day, workout_date, exercise_index, sets, notes)
      VALUES (${day}, ${date}, ${exerciseIndex}, ${JSON.stringify(sets)}, ${notes || ''})
      ON CONFLICT (day, workout_date, exercise_index)
      DO UPDATE SET 
        sets = ${JSON.stringify(sets)},
        notes = ${notes || ''},
        updated_at = NOW()
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error guardando workout:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
