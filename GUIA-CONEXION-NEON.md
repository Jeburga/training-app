# 🗄️ CONEXIÓN CON BASE DE DATOS NEON

## 📋 LO QUE NECESITO DE TU DASHBOARD DE NEON

Para conectar tu app a Neon PostgreSQL, necesito que me proporciones la siguiente información:

### 1. **Connection String**
En tu dashboard de Neon (la captura que enviaste):
- Ve a la pestaña **"Connect"** o **"Connection string"**
- Copia el string que aparece (algo así):
  ```
  postgresql://usuario:password@host.neon.tech/database?sslmode=require
  ```

⚠️ **NO me lo pegues directamente aquí** - te diré cómo usarlo de forma segura

### 2. **Opciones de Backend**

Tenemos 3 opciones para conectar la app con Neon:

#### **Opción A: Netlify Functions (RECOMENDADA)**
✅ **Ventajas:**
- Todo en un solo lugar (frontend + backend)
- Deploy automático
- Gratis hasta 125k requests/mes
- Muy fácil de configurar

❌ **Desventajas:**
- Un poco más lento que un backend dedicado
- Límite de 10 segundos por request

#### **Opción B: Vercel Functions**
✅ **Ventajas:**
- Similar a Netlify
- Muy buena integración con Next.js (si decides migrar después)
- Rápido deploy

❌ **Desventajas:**
- Límites similares a Netlify

#### **Opción C: Backend separado (Node.js + Express)**
✅ **Ventajas:**
- Máximo control
- Sin límites de tiempo
- Puedes hostear en Railway, Render, o fly.io gratis

❌ **Desventajas:**
- Más setup inicial
- Tienes que mantener 2 proyectos separados

---

## 🎯 MI RECOMENDACIÓN: Netlify Functions

Te recomiendo **Netlify Functions** porque:
1. Ya estás usando Netlify para el frontend
2. Todo queda en un solo proyecto
3. Es muy fácil de configurar
4. Escalable para tu caso de uso

---

## 📝 PASOS PARA CONECTAR (NETLIFY FUNCTIONS)

### **Paso 1: Estructura del proyecto**
```
training-app/
├── public/
│   └── training-simple.html  (tu frontend actual)
├── netlify/
│   └── functions/
│       ├── save-workout.js
│       ├── get-workouts.js
│       ├── save-tracking.js
│       └── get-tracking.js
├── .env  (variables secretas - NO subir a Git)
└── netlify.toml  (configuración de Netlify)
```

### **Paso 2: Variables de entorno**
Crea un archivo `.env` con:
```
DATABASE_URL=tu_connection_string_de_neon_aqui
```

### **Paso 3: Configurar Netlify**
Crea un archivo `netlify.toml`:
```toml
[build]
  functions = "netlify/functions"
  publish = "public"

[functions]
  node_bundler = "esbuild"
```

### **Paso 4: Instalar dependencias**
```bash
npm init -y
npm install @neondatabase/serverless
```

### **Paso 5: Crear función de ejemplo**
`netlify/functions/save-workout.js`:
```javascript
import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sql = neon(process.env.DATABASE_URL);
  const data = JSON.parse(event.body);

  try {
    // Guardar workout en la base de datos
    await sql`
      INSERT INTO workouts (user_id, day, date, data)
      VALUES (${data.userId}, ${data.day}, ${data.date}, ${data.data})
      ON CONFLICT (user_id, day, date) 
      DO UPDATE SET data = ${data.data}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### **Paso 6: Crear tablas en Neon**
Ejecuta este SQL en tu dashboard de Neon (sección SQL Editor):

```sql
-- Tabla de entrenamientos
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL DEFAULT 'jesus',
  day VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, day, date)
);

-- Tabla de seguimiento ECN
CREATE TABLE IF NOT EXISTS tracking (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL DEFAULT 'jesus',
  date DATE NOT NULL,
  sleep VARCHAR(50),
  motivation VARCHAR(50),
  fatigue VARCHAR(50),
  soreness VARCHAR(50),
  weight DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tabla de ejercicios reemplazados
CREATE TABLE IF NOT EXISTS exercise_replacements (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL DEFAULT 'jesus',
  day VARCHAR(10) NOT NULL,
  exercise_index INTEGER NOT NULL,
  replacement VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, day, exercise_index)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_user_date ON tracking(user_id, date DESC);
```

### **Paso 7: Actualizar el frontend**
En tu `training-simple.html`, cambiar de localStorage a API:

```javascript
// Antes
await window.storage.set('workouts', JSON.stringify(workoutData));

// Después
await fetch('/.netlify/functions/save-workout', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'jesus',
    day: 'A',
    date: '2026-05-15',
    data: workoutData
  })
});
```

---

## 🚀 ALTERNATIVA RÁPIDA: Solo arreglar problemas 2 y 3

Si quieres empezar más simple, puedo:
1. **Arreglar el problema de recarga** (añadir botones de guardar)
2. **Añadir el date picker**
3. **Mantener localStorage por ahora**
4. **Migrar a Neon después** cuando estés listo

Esto te permite usar la app YA, mientras preparamos la conexión a base de datos.

---

## ❓ DIME QUÉ PREFIERES:

**Opción 1:** Arreglo los problemas 2 y 3 YA (sin base de datos)
- ✅ Funciona de inmediato
- ✅ Botones de guardar + date picker
- ⏳ Base de datos después

**Opción 2:** Implemento todo con Neon de una vez
- ⏳ Requiere más setup
- ✅ Persistencia real desde el inicio
- ✅ Sync entre dispositivos posible

¿Cuál prefieres? Mientras decides, voy preparando el código mejorado para ambas opciones.
