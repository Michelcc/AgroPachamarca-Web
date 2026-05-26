-- =============================================================================
-- Imágenes de productos en Supabase Storage (opcional)
-- Ejecutar en SQL Editor de Supabase si quieres subir archivos en vez de URL externa
-- =============================================================================

-- 1) Crear bucket público "productos" desde el panel:
--    Storage → New bucket → Name: productos → Public bucket: ON

-- 2) Políticas (lectura pública, escritura solo autenticados o service role)
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;

create policy "productos_public_read"
on storage.objects for select
using (bucket_id = 'productos');

create policy "productos_auth_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'productos');

-- 3) Tras subir un archivo, copia la URL pública en productos.imagen_url, por ejemplo:
--    https://TU_PROYECTO.supabase.co/storage/v1/object/public/productos/fertilizante.jpg
