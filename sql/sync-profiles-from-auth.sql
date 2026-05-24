-- Sincroniza perfiles faltantes para usuarios que ya existen en Authentication
-- (p. ej. registro desde el móvil sin fila en public.profiles)
-- Ejecutar en Supabase SQL Editor después de schema.sql

insert into public.profiles (id, nombre, username, rol, activo)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'nombre'), ''),
    split_part(u.email, '@', 1)
  ),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'username'), ''),
    regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')
  ),
  'agricultor',
  true
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and u.email is not null
on conflict (id) do update set
  nombre = excluded.nombre,
  username = excluded.username,
  activo = true;
