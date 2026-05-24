-- Crea perfil automático al registrarse (Auth → profiles)
-- Ejecutar una vez en Supabase SQL Editor

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    regexp_replace(split_part(coalesce(new.email, 'usuario'), '@', 1), '[^a-zA-Z0-9_]', '', 'g')
  );
  if v_username = '' then
    v_username := 'usuario';
  end if;

  insert into public.profiles (id, nombre, username, rol, activo)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''),
      split_part(coalesce(new.email, 'usuario'), '@', 1)
    ),
    v_username,
    'agricultor',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
