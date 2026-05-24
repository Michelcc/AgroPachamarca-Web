# Agro Admin Panel — Despliegue en [FL0](https://fl0.com)

Guía para publicar el panel desde GitHub:  
**https://github.com/Michelcc/AgroPachamarca-Web**

Documentación FL0 PHP: [Buildpacks PHP](https://docs.fl0.com/docs/builds/buildpacks/php)

---

## 1. Supabase (igual que siempre)

En **SQL Editor**, ejecuta en orden:

1. `schema.sql` de la app móvil (repo mobile)
2. `schema-tablas-campo.sql`
3. `public_html/sql/schema.sql` de este repo

Copia en un bloc de notas:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

---

## 2. Conectar GitHub en FL0

1. Entra a [FL0](https://fl0.com) y crea un **proyecto**.
2. **New Service** → conecta el repo `Michelcc/AgroPachamarca-Web`.
3. FL0 detectará el **`Dockerfile`** en la raíz del repo (PHP 8.2 + Apache).
4. **Root directory:** deja la raíz del repo (donde está el `Dockerfile`).
5. **Port:** `80` (Apache en el contenedor).

---

## 3. Variables de entorno en FL0

En el servicio → **Environment Variables**, añade:

| Variable | Ejemplo | Obligatorio |
|----------|---------|-------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Sí |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | Sí |
| `SUPABASE_SERVICE_KEY` | `eyJhbG...` | Sí |
| `BASE_URL` | `https://tu-app.fl0.app` | Sí |
| `CRON_SECRET` | clave larga aleatoria | Sí |
| `TZ` | `America/Lima` | No |

`BASE_URL` = la URL pública que te asigne FL0 **sin** barra final.

El archivo `config.php` lee estas variables automáticamente (no hace falta editar archivos en el servidor).

---

## 4. Deploy

1. Pulsa **Deploy** (o push a `main` si activaste auto-deploy).
2. Espera a que el build del Dockerfile termine.
3. Abre la URL del servicio.

---

## 5. Primer acceso admin

1. Visita una sola vez:
   ```
   https://tu-app.fl0.app/setup_admin.php?key=TU_CRON_SECRET
   ```
2. Login: `admin@agro.local` / `admin123` → **cambia la contraseña**.
3. **Elimina** `setup_admin.php` del repo o bloquea el acceso después.

---

## 6. Uploads de imágenes (productos)

En FL0 el disco del contenedor puede reiniciarse en cada deploy. Para producción seria:

- Usar **volumen persistente** en FL0 (si tu plan lo permite), montado en `/var/www/html/assets/uploads`, **o**
- Guardar imágenes en **Supabase Storage** (mejora futura).

Para pruebas, los uploads funcionan mientras el contenedor no se redepliegue.

---

## 7. Cron — alertas de préstamos

Programa una petición HTTP diaria (cron de FL0 o [cron-job.org](https://cron-job.org)):

```
GET https://tu-app.fl0.app/microservices/alertas_prestamos.php?key=TU_CRON_SECRET
```

---

## 8. API REST

Base: `https://tu-app.fl0.app/api/`

Ejemplo:

```bash
curl -X POST https://tu-app.fl0.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mail.com","password":"secret"}'
```

(Las rutas bonitas `/api/login` funcionan vía `.htaccess` en Apache.)

---

## 9. Desarrollo local con Docker

```bash
cd web-admin
docker build -t agro-admin .
docker run -p 8080:80 \
  -e SUPABASE_URL=https://xxx.supabase.co \
  -e SUPABASE_ANON_KEY=eyJ... \
  -e SUPABASE_SERVICE_KEY=eyJ... \
  -e BASE_URL=http://localhost:8080 \
  -e CRON_SECRET=dev-secret \
  agro-admin
```

Abre http://localhost:8080

---

## 10. InfinityFree (alternativa)

Si prefieres hosting PHP clásico, copia `config.example.php` → `config.local.php` en el servidor y sigue `README-INSTALACION.md`.

---

**App móvil:** no requiere cambios; sigue usando Supabase directamente. El panel admin escribe en las mismas tablas.
