import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    if (event.httpMethod === 'POST') {
      const { day, exerciseIndex, replacement } = JSON.parse(event.body);

      if (replacement === null) {
        // Eliminar reemplazo
        await sql`
          DELETE FROM exercise_replacements 
          WHERE day = ${day} AND exercise_index = ${exerciseIndex}
        `;
      } else {
        // Guardar reemplazo
        await sql`
          INSERT INTO exercise_replacements (day, exercise_index, replacement)
          VALUES (${day}, ${exerciseIndex}, ${replacement})
          ON CONFLICT (day, exercise_index)
          DO UPDATE SET replacement = ${replacement}
        `;
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    } else if (event.httpMethod === 'GET') {
      const replacements = await sql`
        SELECT * FROM exercise_replacements
      `;

      const formatted = {};
      replacements.forEach(r => {
        formatted[`${r.day}-${r.exercise_index}`] = r.replacement;
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted)
      };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (error) {
    console.error('Error con replacements:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
