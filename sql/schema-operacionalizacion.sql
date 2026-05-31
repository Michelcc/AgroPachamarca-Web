-- Copia de android/supabase/schema-operacionalizacion.sql
-- Operacionalización — Variable dependiente: Cultivos agrícolas

create table if not exists public.indicadores_operacionalizacion (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  variable_dependiente text not null default 'Cultivos agrícolas',
  dimension_id text not null,
  dimension_label text not null,
  indicador_id text not null,
  indicador_label text not null,
  instrumento text not null,
  tipo_instrumento text not null,
  valor_numerico double precision,
  valor_texto text,
  unidad text,
  lat double precision,
  lng double precision,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_indicadores_op_user on public.indicadores_operacionalizacion (user_id, created_at desc);
create index if not exists idx_indicadores_op_dim on public.indicadores_operacionalizacion (dimension_id, indicador_id);

alter table public.indicadores_operacionalizacion enable row level security;

drop policy if exists "indicadores_op_own" on public.indicadores_operacionalizacion;
create policy "indicadores_op_own" on public.indicadores_operacionalizacion
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
