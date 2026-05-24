# Agro Admin Panel — Instalación en InfinityFree

Guía paso a paso para desplegar el panel web PHP + API REST con Supabase.

## Requisitos

- Cuenta en [InfinityFree](https://www.infinityfree.com/)
- Proyecto [Supabase](https://supabase.com/) con las tablas de la app móvil
- SQL del panel: `public_html/sql/schema.sql` (ejecutar en el SQL Editor de Supabase)

## 1. Preparar Supabase

1. En Supabase → **SQL Editor**, ejecuta en orden:
   - `android/supabase/schema.sql` (app móvil base)
   - `android/supabase/schema-tablas-campo.sql` (109 tablas de campo)
   - `web-admin/public_html/sql/schema.sql` (extensiones del panel)
2. En **Project Settings → API**, copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_KEY` (solo servidor, nunca en la app)

## 2. Crear cuenta InfinityFree

1. Regístrate en InfinityFree y crea un sitio (subdominio gratuito, ej. `tuusuario.infinityfreeapp.com`).
2. En el panel de control, anota la ruta **htdocs** (document root).

## 3. Subir archivos

1. Sube **todo el contenido** de `web-admin/public_html/` a `htdocs/` (no la carpeta `public_html` en sí, sino su interior).
2. Estructura esperada en el servidor:

```
htdocs/
  config.php
  index.php
  login.php
  admin/
  api/
  includes/
  assets/
  microservices/
  sql/          (opcional, no público si .htaccess bloquea)
```

## 4. Configurar `config.php`

1. En el servidor, copia `config.example.php` como `config.php` (o edita el `config.php` subido).
2. Rellena:

```php
define('SUPABASE_URL', 'https://xxxxx.supabase.co');
define('SUPABASE_ANON_KEY', 'eyJ...');
define('SUPABASE_SERVICE_KEY', 'eyJ...');
define('BASE_URL', 'https://tuusuario.infinityfreeapp.com');
define('CRON_SECRET', 'una-clave-larga-aleatoria');
```

3. `BASE_URL` debe coincidir con tu dominio **sin** barra final.

## 5. Permisos de carpetas

1. Crea o verifica que exista `assets/uploads/` con permisos de escritura (755 o 775).
2. Las imágenes de productos se guardan ahí vía `uploadImage()`.

## 6. Primer acceso al panel

1. Abre `https://tuusuario.infinityfreeapp.com/setup_admin.php` **una sola vez** para generar el hash del admin, o actualiza la contraseña en Supabase tabla `usuarios`.
2. Credencial demo (si ejecutaste el SQL): `admin@agro.local` / `admin123` — **cámbiala de inmediato**.
3. Entra en `login.php` → Dashboard.

## 7. API REST para la app móvil

Base: `https://tuusuario.infinityfreeapp.com/api/`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/login` | POST | Login Supabase o usuarios panel |
| `/api/register` | POST | Registro + profiles |
| `/api/tablas_datos` | GET | Catálogo tablas activas |
| `/api/productos` | GET | Listado productos |
| `/api/recomendaciones?altitud=&mes=` | GET | Recomendaciones filtradas |
| `/api/alertas` | GET | Alertas climáticas activas |
| `/api/diagnostico` | POST | Insertar diagnóstico (Bearer) |
| `/api/perfil` | GET/PUT | Perfil usuario (Bearer) |
| `/api/registros_gps` | POST | Insertar GPS (Bearer) |
| `/api/carpetas` | GET | Listar carpetas |
| `/api/carpetas/prestamo` | POST | Préstamo (`action` + JSON) |

Ejemplo login:

```bash
curl -X POST https://tuusuario.infinityfreeapp.com/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mail.com","password":"secret"}'
```

## 8. Cron de alertas de préstamos

1. En InfinityFree → **Cron Jobs** (si está disponible) o usa un servicio externo (cron-job.org).
2. URL a llamar cada día:

```
https://tuusuario.infinityfreeapp.com/microservices/alertas_prestamos.php?key=TU_CRON_SECRET
```

3. Respuesta JSON con préstamos ≥5 días (alerta) y ≥10 días (simulación de correo).

## 9. Seguridad

- No expongas `SUPABASE_SERVICE_KEY` en la app Flutter (solo en PHP del servidor).
- No subas `config.php` a Git público.
- El `.htaccess` bloquea acceso directo a `config.php`.
- Cambia `CRON_SECRET` y contraseñas por defecto.

## 10. Solución de problemas

| Problema | Solución |
|----------|----------|
| Pantalla en blanco | Activa errores en un `phpinfo` temporal; revisa PHP ≥7.4 |
| Error Supabase 401 | Revisa `SERVICE_KEY` y RLS |
| Upload falla | Permisos en `assets/uploads/` |
| API CORS | Ya configurado en `api/bootstrap.php` |
| Mapa GPS vacío | Ejecuta `schema.sql` y RPC `list_registros_campo_gps` |

## 11. Enlazar la app móvil

En Flutter, apunta la base URL de la API al mismo `BASE_URL` del hosting y usa el token `access_token` de Supabase en el header:

```
Authorization: Bearer <access_token>
```

---

**Versión:** 1.0.0 · Agro Admin Panel
