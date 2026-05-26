# Agro Pachamarca · Panel Web (Next.js)

Panel de administración y API REST para la app móvil Agro, desplegado en **Vercel** con **Supabase**.

Repositorio GitHub: [Michelcc/AgroPachamarca-Web](https://github.com/Michelcc/AgroPachamarca-Web)

## Requisitos

- Node.js 20+
- Proyecto Supabase (misma instancia que la app Android)
- Cuenta Vercel

## Variables de entorno

Copia `.env.example` a `.env.local` en desarrollo, o configúralas en Vercel → Settings → Environment Variables:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (app móvil + Auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (panel admin, bypass RLS) |
| `SESSION_SECRET` | Clave JWT sesión panel (mín. 16 caracteres) |
| `CRON_SECRET` | Clave para `/setup` (crear admin inicial) |

## SQL en Supabase (orden)

Ejecuta en el **SQL Editor** de Supabase, en este orden:

1. `android/supabase/schema.sql` — esquema base app móvil  
2. `android/supabase/schema-tablas-campo.sql` — tablas de campo dinámicas  
3. `web-admin/sql/schema.sql` — extensiones panel (usuarios, alertas, GPS, etc.)

Si antes subiste el módulo fiscal por error, ejecuta también `web-admin/sql/schema-drop-modulo-fiscal.sql`.

Si usuarios de la app aparecen en **Authentication** pero no en el panel, ejecuta `sql/sync-profiles-from-auth.sql` y luego `sql/trigger-profile-on-signup.sql`.

## Primer administrador

Tras el deploy, visita una sola vez:

```
https://tu-dominio.vercel.app/setup?key=TU_CRON_SECRET&email=maycolccq@gmail.com&password=maycol123&nombre=Maycol
```

O ejecuta `sql/seed-admin.sql` en Supabase (mismo usuario).

Crea/actualiza el admin indicado. Luego inicia sesión en `/login`.

## Desarrollo local

```bash
cd web-admin
npm install
cp .env.example .env.local
# Edita .env.local con tus credenciales Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

1. Conecta el repositorio **Michelcc/AgroPachamarca-Web** en [vercel.com](https://vercel.com).  
2. **Root Directory**: `web-admin` (si el monorepo está en la raíz del repo).  
3. Framework: **Next.js** (detectado automáticamente).  
4. Añade las variables de entorno de la tabla anterior.  
5. Deploy.

## API móvil

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/login` | — |
| POST | `/api/register` | — |
| GET | `/api/tablas_datos` | — |
| GET | `/api/productos` | — |
| GET | `/api/recomendaciones?altitud=&mes=` | — |
| POST | `/api/recomendaciones/predict` | — (body: lat, lng, altitud, mes, clima) |
| GET | `/api/alertas` | — |
| POST | `/api/alertas/predict` | — (body: lat, lng, altitud, temp, prob. lluvia) |
| POST | `/api/diagnostico` | Bearer |
| GET/PUT | `/api/perfil` | Bearer |
| POST | `/api/registros_gps` | Bearer (solo app móvil) |

## Panel admin

Rutas protegidas (rol `admin`): `/dashboard`, `/admin/*`.
