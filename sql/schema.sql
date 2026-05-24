-- =============================================================================
-- Agro Admin Panel · SQL para Supabase (PostgreSQL)
-- Ejecutar DESPUÉS de schema.sql y schema-tablas-campo.sql de la app móvil
-- =============================================================================

-- ── Extensiones al catálogo de tablas de campo (app móvil "Datos de campo") ──
alter table public.catalogo_tablas
  add column if not exists nombre_display text,
  add column if not exists icono text default '📋',
  add column if not exists orden int not null default 0;

update public.catalogo_tablas
set nombre_display = initcap(replace(codigo, '_', ' '))
where nombre_display is null;

-- ── Extensiones productos (app móvil Productos) ──
alter table public.productos
  add column if not exists imagen_url text,
  add column if not exists destacado boolean not null default false;

-- ── Usuarios del panel web (login PHP con password_hash) ──
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null default 'operador'
    check (rol in ('admin', 'operador', 'agricultor')),
  activo boolean not null default true,
  ultimo_acceso timestamptz,
  created_at timestamptz not null default now()
);

-- Admin inicial: créalo con /setup?key=CRON_SECRET (ver README).

-- ── Perfiles app móvil: campos admin ──
alter table public.profiles
  add column if not exists rol text default 'agricultor',
  add column if not exists activo boolean not null default true,
  add column if not exists ultimo_acceso timestamptz;

-- ── Recomendaciones de cultivo (reglas editables desde panel) ──
create table if not exists public.recomendaciones_cultivo (
  id uuid primary key default gen_random_uuid(),
  cultivo text not null,
  altitud_min_m int not null default 0,
  altitud_max_m int not null default 5000,
  mes_inicio int not null check (mes_inicio between 1 and 12),
  mes_fin int not null check (mes_fin between 1 and 12),
  probabilidad numeric(5,2) not null default 80,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.recomendaciones_cultivo (cultivo, altitud_min_m, altitud_max_m, mes_inicio, mes_fin, probabilidad, notas) values
  ('Papa', 2800, 4200, 3, 5, 92, 'Siembra en época seca'),
  ('Maíz', 2000, 3500, 9, 12, 88, 'Variedades adaptadas a altura'),
  ('Quinua', 3000, 4500, 8, 10, 85, 'Resistente a heladas'),
  ('Haba', 2500, 3800, 4, 6, 80, 'Rotación con cereales')
on conflict do nothing;

-- ── Alertas climáticas globales (panel → app móvil) ──
create table if not exists public.alertas_climaticas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensaje text not null,
  nivel text not null default 'info' check (nivel in ('info', 'advertencia', 'critico')),
  activo boolean not null default true,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

-- ── Diagnósticos IA: imagen URL ──
alter table public.diagnosticos_ia
  add column if not exists imagen_url text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- ── Registros GPS unificados (API + panel; app puede seguir usando tablas de campo) ──
create table if not exists public.registros_gps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  tabla_origen text,
  lat double precision not null,
  lng double precision not null,
  altitud_msnm double precision,
  titulo text,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_registros_gps_user on public.registros_gps (user_id, created_at desc);
create index if not exists idx_registros_gps_fecha on public.registros_gps (created_at desc);

-- ── RPC: listar registros GPS desde tablas de campo ──
create or replace function public.list_registros_campo_gps(p_limit int default 200)
returns table (
  id uuid,
  user_id uuid,
  tabla_origen text,
  lat double precision,
  lng double precision,
  altitud_msnm double precision,
  titulo text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in select codigo from catalogo_tablas where activo = true order by orden, codigo loop
    return query execute format(
      'select id, user_id, %L::text, lat, lng, altitud_msnm, titulo, created_at
       from %I order by created_at desc limit %s',
      r.codigo, r.codigo, greatest(1, p_limit / 109)
    );
  end loop;
  return;
end;
$$;

-- ── RLS: panel usa service_role (bypass). App móvil mantiene sus políticas. ──
alter table public.usuarios enable row level security;
alter table public.recomendaciones_cultivo enable row level security;
alter table public.alertas_climaticas enable row level security;
alter table public.registros_gps enable row level security;

-- Lectura pública para app móvil (anon key)
drop policy if exists "recomendaciones_read" on public.recomendaciones_cultivo;
create policy "recomendaciones_read" on public.recomendaciones_cultivo
  for select using (activo = true);

drop policy if exists "alertas_climaticas_read" on public.alertas_climaticas;
create policy "alertas_climaticas_read" on public.alertas_climaticas
  for select using (activo = true);

drop policy if exists "catalogo_read_all" on public.catalogo_tablas;
create policy "catalogo_read_all" on public.catalogo_tablas
  for select using (activo = true);

drop policy if exists "registros_gps_insert_own" on public.registros_gps;
create policy "registros_gps_insert_own" on public.registros_gps
  for insert with check (auth.uid() = user_id);

drop policy if exists "registros_gps_read_own" on public.registros_gps;
create policy "registros_gps_read_own" on public.registros_gps
  for select using (auth.uid() = user_id);

-- Service role bypasses RLS automatically when using SUPABASE_SERVICE_ROLE_KEY in el panel Next.js.
