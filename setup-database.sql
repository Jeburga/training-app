-- ============================================
-- TABLAS PARA TRAINING APP - JESÚS BURGA
-- ============================================

-- Tabla de entrenamientos
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  day VARCHAR(10) NOT NULL,
  workout_date DATE NOT NULL,
  exercise_index INTEGER NOT NULL,
  sets JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(day, workout_date, exercise_index)
);

-- Tabla de seguimiento ECN
CREATE TABLE IF NOT EXISTS tracking (
  id SERIAL PRIMARY KEY,
  tracking_date DATE NOT NULL UNIQUE,
  sleep VARCHAR(50),
  motivation VARCHAR(50),
  fatigue VARCHAR(50),
  soreness VARCHAR(50),
  weight DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de ejercicios reemplazados
CREATE TABLE IF NOT EXISTS exercise_replacements (
  id SERIAL PRIMARY KEY,
  day VARCHAR(10) NOT NULL,
  exercise_index INTEGER NOT NULL,
  replacement VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(day, exercise_index)
);

-- Tabla de configuración del usuario
CREATE TABLE IF NOT EXISTS user_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(50) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO user_config (config_key, config_value) 
VALUES 
  ('current_week', '1'),
  ('current_microcycle', 'microcycle1')
ON CONFLICT (config_key) DO NOTHING;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_date ON tracking(tracking_date DESC);

-- Confirmar creación
SELECT 'Tablas creadas exitosamente' as status;
