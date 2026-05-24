-- =============================================================================
-- Eliminar módulo CARPETAS FISCALES (otro proyecto) de Supabase
-- Ejecutar UNA VEZ en SQL Editor si ya corriste schema.sql con fiscalias
-- =============================================================================

drop table if exists public.alertas_prestamos cascade;
drop table if exists public.historial_movimientos cascade;
drop table if exists public.prestamos cascade;
drop table if exists public.carpetas cascade;
drop table if exists public.despachos cascade;
drop table if exists public.fiscalias cascade;
