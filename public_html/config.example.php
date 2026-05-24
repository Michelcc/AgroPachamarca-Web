<?php
/**
 * Copia este archivo como config.php y rellena tus credenciales Supabase.
 * NO subas config.php a repositorios públicos.
 */

define('SUPABASE_URL', 'https://midominio.supabase.co');
define('SUPABASE_ANON_KEY', 'mi-clave-anon-publica');
define('SUPABASE_SERVICE_KEY', 'mi-clave-service-role');

define('APP_NAME', 'Agro Admin Panel');
define('APP_VERSION', '1.0.0');
define('APP_PRIMARY', '#00450d');
define('APP_SURFACE', '#faf9f5');

/** URL base del sitio (sin barra final). Ej: https://tuusuario.infinityfreeapp.com */
define('BASE_URL', 'https://tuusuario.infinityfreeapp.com');

/** Carpeta de uploads (relativa a public_html) */
define('UPLOAD_DIR', __DIR__ . '/assets/uploads/');
define('UPLOAD_URL', BASE_URL . '/assets/uploads/');

/** Clave secreta para cron del microservicio (cámbiala) */
define('CRON_SECRET', 'cambia-esta-clave-secreta-cron');

/** Zona horaria */
date_default_timezone_set('America/Lima');

session_start();
