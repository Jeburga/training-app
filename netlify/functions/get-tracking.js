import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const tracking = await sql`
      SELECT * FROM tracking 
      ORDER BY tracking_date DESC
      LIMIT 365
    `;

    // Convertir a formato del frontend
    const formatted = {
      sleep: {},
      motivation: {},
      fatigue: {},
      soreness: {},
      weight: {}
    };

    tracking.forEach(t => {
      const date = t.tracking_date;
      if (t.sleep) formatted.sleep[date] = t.sleep;
      if (t.motivation) formatted.motivation[date] = t.motivation;
      if (t.fatigue) formatted.fatigue[date] = t.fatigue;
      if (t.soreness) formatted.soreness[date] = t.soreness;
      if (t.weight) formatted.weight[date] = t.weight;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    };
  } catch (error) {
    console.error('Error obteniendo tracking:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
