import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const { date, sleep, motivation, fatigue, soreness, weight } = JSON.parse(event.body);

    await sql`
      INSERT INTO tracking (tracking_date, sleep, motivation, fatigue, soreness, weight)
      VALUES (${date}, ${sleep}, ${motivation}, ${fatigue}, ${soreness}, ${weight})
      ON CONFLICT (tracking_date)
      DO UPDATE SET 
        sleep = ${sleep},
        motivation = ${motivation},
        fatigue = ${fatigue},
        soreness = ${soreness},
        weight = ${weight},
        updated_at = NOW()
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error guardando tracking:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
