-- PROPUESTA OPCIONAL. La demo utiliza memoria y NO necesita ejecutar este archivo.
-- Para una futura base nueva; no migra ni elimina las tablas del prototipo de Google.
BEGIN;
CREATE TABLE IF NOT EXISTS estudiantes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  correo TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS docentes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  correo TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS tareas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  docente_id BIGINT NOT NULL REFERENCES docentes(id),
  codigo VARCHAR(64) NOT NULL,
  UNIQUE(docente_id, codigo)
);
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY,
  estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id),
  tarea_id BIGINT NOT NULL REFERENCES tareas(id),
  enviado TIMESTAMPTZ NOT NULL,
  recibido TIMESTAMPTZ NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_contenido BYTEA NOT NULL
);
CREATE TABLE IF NOT EXISTS feedback (
  entrega_id UUID PRIMARY KEY REFERENCES entregas(id),
  correcto TEXT NOT NULL CHECK (length(trim(correcto)) > 0),
  incorrecto TEXT NOT NULL CHECK (length(trim(incorrecto)) > 0),
  corregir TEXT NOT NULL CHECK (length(trim(corregir)) > 0),
  actualizado TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMIT;
