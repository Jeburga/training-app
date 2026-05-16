import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    if (event.httpMethod === 'POST') {
      const { key, value } = JSON.parse(event.body);

      await sql`
        INSERT INTO user_config (config_key, config_value)
        VALUES (${key}, ${value})
        ON CONFLICT (config_key)
        DO UPDATE SET config_value = ${value}, updated_at = NOW()
      `;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    } else if (event.httpMethod === 'GET') {
      const config = await sql`
        SELECT * FROM user_config
      `;

      const formatted = {};
      config.forEach(c => {
        formatted[c.config_key] = c.config_value;
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted)
      };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (error) {
    console.error('Error con config:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
