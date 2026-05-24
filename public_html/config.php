<?php
/**
 * Configuración del panel · FL0 / Docker / hosting tradicional
 *
 * FL0: define variables de entorno en el dashboard (no subas claves al repo).
 * Local/InfinityFree: copia config.example.php como config.local.php o usa env.
 */

function agro_env($key, $default = '')
{
    $v = getenv($key);
    if ($v !== false && $v !== '') {
        return $v;
    }
    return $default;
}

$localFile = __DIR__ . '/config.local.php';
if (is_file($localFile)) {
    require $localFile;
    return;
}

define('SUPABASE_URL', agro_env('SUPABASE_URL', ''));
define('SUPABASE_ANON_KEY', agro_env('SUPABASE_ANON_KEY', ''));
define('SUPABASE_SERVICE_KEY', agro_env('SUPABASE_SERVICE_KEY', ''));

define('APP_NAME', agro_env('APP_NAME', 'Agro Admin Panel'));
define('APP_VERSION', agro_env('APP_VERSION', '1.0.0'));
define('APP_PRIMARY', '#00450d');
define('APP_SURFACE', '#faf9f5');

define('BASE_URL', rtrim(agro_env('BASE_URL', ''), '/'));

define('UPLOAD_DIR', __DIR__ . '/assets/uploads/');
define('UPLOAD_URL', BASE_URL ? BASE_URL . '/assets/uploads/' : '/assets/uploads/');

define('CRON_SECRET', agro_env('CRON_SECRET', ''));

date_default_timezone_set(agro_env('TZ', 'America/Lima'));

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (SUPABASE_URL === '' || SUPABASE_SERVICE_KEY === '') {
    if (php_sapi_name() !== 'cli') {
        http_response_code(503);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Configuración incompleta: define SUPABASE_URL y SUPABASE_SERVICE_KEY (FL0 → Environment Variables).';
    }
    exit(1);
}
