-- Admin del panel (ejecutar en Supabase SQL Editor después de schema.sql)
-- Email: maycolccq@gmail.com  ·  Contraseña: maycol123

insert into public.usuarios (nombre, email, password_hash, rol, activo)
values (
  'Maycol',
  'maycolccq@gmail.com',
  '$2b$10$yZe/82t1xa9sVI5UxdY.MeKQbtk0/ewGG4uSloZFM.CVpq7cOBqgy',
  'admin',
  true
)
on conflict (email) do update set
  nombre = excluded.nombre,
  password_hash = excluded.password_hash,
  rol = 'admin',
  activo = true;
