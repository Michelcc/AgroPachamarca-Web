# Agro Pachamarca · Panel Web (Next.js)

Panel de administración y API REST para la app móvil Agro. Arquitectura **BaaS**: el panel usa **Supabase** como única base de datos con clave `service_role` para operaciones globales. Desplegado en **Vercel**.

Repositorio: [Michelcc/AgroPachamarca-Web](https://github.com/Michelcc/AgroPachamarca-Web)

---

## Arquitectura del panel

```
┌──────────────────────────────────────────────────────────────┐
│                    PANEL WEB (Next.js 15)                     │
├──────────────────────────────────────────────────────────────┤
│  App Router                                                   │
│    /dashboard          resumen KPIs                           │
│    /admin/tablas       catálogo tablas de campo               │
│    /admin/tablas/productos | /admin/tablas/sensores           │
│    /admin/dimension/*  4 dimensiones de la tesis              │
│    /admin/alertas | recomendaciones | diagnosticos | usuarios │
├──────────────────────────────────────────────────────────────┤
│  API Routes (/api/*)     ML predict, login móvil, GPS          │
├──────────────────────────────────────────────────────────────┤
│  Supabase Admin Client (SUPABASE_SERVICE_ROLE_KEY)            │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
                  Supabase PostgreSQL + Storage
                           ▲
                  App móvil (anon key + RLS)
```

### Modelo de navegación (sidebar)

La estructura del menú refleja la tesis de investigación:

```
Dashboard
Usuarios
Tablas de datos              ← categoría padre
  ├── Productos              /admin/tablas/productos
  └── Sensores               /admin/tablas/sensores
Productividad                /admin/dimension/productividad
Gestión de recursos          /admin/dimension/gestion-recursos
Predicción agrícola          /admin/dimension/prediccion-agricola
Toma de decisiones           /admin/dimension/toma-decisiones
Diagnósticos IA              /admin/diagnosticos
```

Cada **página de dimensión** muestra:
- Indicadores de operacionalización (matriz tesis)
- Enlaces a módulos técnicos (productos, sensores, alertas, etc.)
- Registros enviados desde la app móvil

Definición compartida con la app: `src/lib/operacionalizacion.ts` + `src/lib/dimensionModulos.ts`.

---

## Requisitos

- Node.js 20+
- Proyecto Supabase (misma instancia que la app Android)
- Cuenta Vercel

---

## Variables de entorno

Copia `.env.example` a `.env.local` en desarrollo, o configúralas en Vercel → Settings → Environment Variables:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (app móvil + Auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (panel admin, bypass RLS) |
| `SESSION_SECRET` | Clave JWT sesión panel (mín. 16 caracteres) |
| `CRON_SECRET` | Clave para `/setup` (crear admin inicial) |

---

## SQL en Supabase (orden)

Ejecuta en el **SQL Editor** de Supabase, en este orden:

1. `android/supabase/schema.sql` — esquema base app móvil  
2. `android/supabase/schema-tablas-campo.sql` — tablas de campo dinámicas  
3. `web-admin/sql/schema.sql` — extensiones panel (usuarios, alertas, GPS, etc.)
4. `sql/schema-sensores-suelo.sql` — columnas sensores IoT de suelo
5. `sql/schema-operacionalizacion.sql` — variables de tesis (12 indicadores)
6. `sql/patch-productos-catalog-rls.sql` — catálogo productos multi-usuario

Si usuarios de la app aparecen en **Authentication** pero no en el panel, ejecuta `sql/sync-profiles-from-auth.sql` y luego `sql/trigger-profile-on-signup.sql`.

---

## Primer administrador

Tras el deploy, visita una sola vez:

```
https://tu-dominio.vercel.app/setup?key=TU_CRON_SECRET&email=...&password=...&nombre=...
```

O ejecuta `sql/seed-admin.sql` en Supabase.

Luego inicia sesión en `/login`.

---

## Desarrollo local

```bash
cd web-admin
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Despliegue en Vercel

1. Conecta el repositorio **Michelcc/AgroPachamarca-Web** en [vercel.com](https://vercel.com).  
2. Framework: **Next.js** (detectado automáticamente).  
3. Añade las variables de entorno de la tabla anterior.  
4. Deploy.

---

## API móvil

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/login` | — |
| POST | `/api/register` | — |
| GET | `/api/tablas_datos` | — |
| GET | `/api/productos` | — |
| GET | `/api/recomendaciones?altitud=&mes=` | — |
| POST | `/api/recomendaciones/predict` | — |
| GET | `/api/alertas` | — |
| POST | `/api/alertas/predict` | — |
| POST | `/api/diagnostico` | Bearer |
| GET/PUT | `/api/perfil` | Bearer |
| POST | `/api/registros_gps` | Bearer |

---

## Tablas Supabase principales

| Tabla | Uso |
|-------|-----|
| `productos` | Catálogo e inventario |
| `lecturas_sensor_suelo` | Lecturas IoT de suelo |
| `sensores_iot_registry` | Registro de sensores |
| `indicadores_operacionalizacion` | Indicadores de tesis |
| `alertas_climaticas` | Alertas ML clima |
| `recomendaciones_cultivo` | Recomendaciones ML |
| `diagnosticos_ia` | Diagnósticos Gemini |
| `catalogo_tablas` | Diccionario tablas de campo |
| `profiles` | Perfiles usuarios app |

---

## Verificación

```powershell
npm run build
```
