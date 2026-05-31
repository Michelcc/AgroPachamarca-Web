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

### ¿Qué hace exactamente el panel?

El panel web **no reemplaza** a Supabase: lo **complementa**. Es la cara administrativa del mismo proyecto. Un investigador o administrador entra por `/login`, obtiene una sesión de panel (independiente de Supabase Auth de la app móvil) y navega por módulos que leen y escriben PostgreSQL con privilegios elevados.

**Next.js App Router** organiza cada URL como una página en `src/app/`. Las páginas de admin (`/admin/*`) son en su mayoría **Server Components**: ejecutan consultas a Supabase en el servidor de Vercel en el momento de la petición, sin exponer la service role al navegador del admin. El HTML llega ya con tablas, KPIs y listados renderizados.

**Dos niveles de menú**  
El sidebar sigue la lógica de la tesis, igual que la app:

1. **Tablas de datos** — datos crudos y catálogos: productos (`/admin/tablas/productos`), sensores (`/admin/tablas/sensores`) y el catálogo de esquemas de campo (`/admin/tablas`).
2. **Cuatro dimensiones** — marco de investigación: cada ruta `/admin/dimension/[slug]` muestra los indicadores de esa dimensión, su cobertura (cuántos tienen registro en BD) y enlaces a los módulos técnicos relacionados (alertas, recomendaciones, etc.).

Así el menú deja de ser una lista plana de “Productos, Alertas, Variables…” y refleja **cómo está estructurado el estudio**: primero qué se mide (indicadores), y dentro de cada dimensión qué herramientas alimentan esas mediciones.

**Clave service_role**  
En Vercel (o `.env.local` en desarrollo) se configura `SUPABASE_SERVICE_ROLE_KEY`. Esa clave **nunca** debe ir en la app móvil ni en código cliente. Permite al panel listar todos los usuarios, editar cualquier producto, ver todas las lecturas de sensores y auditar indicadores de todos los productores. Es el equivalente a “root” sobre los datos, acotado solo al backend del panel.

**API REST (`/api/*`)**  
Algunas rutas existen para la app móvil o para lógica server-side: login/registro, predicción ML de cultivos, predicción de alertas climáticas, diagnóstico con Gemini, registro GPS. Muchas operaciones cotidianas de la app ya van **directo a Supabase**; las APIs quedan para procesos que requieren combinar servicios, ocultar claves o ejecutar reglas en el servidor.

**Storage**  
Las imágenes de productos pueden alojarse en Supabase Storage. El panel normaliza URLs (`normalizeImageUrl`) y muestra miniaturas en tablas. La app móvil consume las mismas URLs públicas o firmadas según la política del bucket.

**Despliegue**  
Cada push a `main` en GitHub puede disparar un deploy en Vercel. No hay que levantar PostgreSQL en Vercel: solo se actualiza el frontend/admin y las serverless functions. La base de datos sigue en Supabase; los scripts SQL en `sql/` documentan el esquema que debe existir allí antes de usar el panel.

**Coherencia con la app móvil**  
Los archivos `src/lib/operacionalizacion.ts` y `src/lib/dimensionModulos.ts` están alineados con `src/schema/` del repo móvil. Si cambia un indicador o una dimensión en la tesis, hay que actualizar ambos repos para que app y panel muestren la misma matriz.

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
