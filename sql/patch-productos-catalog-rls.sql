-- App móvil: ver productos del panel (disponible=true) además de los propios.
-- Ejecutar en Supabase SQL Editor.

drop policy if exists "productos_own" on public.productos;
drop policy if exists "productos_select_catalog" on public.productos;
drop policy if exists "productos_insert_own" on public.productos;
drop policy if exists "productos_update_own" on public.productos;
drop policy if exists "productos_delete_own" on public.productos;

create policy "productos_select_catalog" on public.productos
  for select using (auth.uid() = user_id or disponible = true);

create policy "productos_insert_own" on public.productos
  for insert with check (auth.uid() = user_id);

create policy "productos_update_own" on public.productos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "productos_delete_own" on public.productos
  for delete using (auth.uid() = user_id);

alter table public.productos
  add column if not exists imagen_url text,
  add column if not exists destacado boolean not null default false;
