<?php
/**
 * Ejecutar UNA VEZ en el servidor para crear/resetear admin.
 * URL: https://tudominio.com/setup_admin.php?key=TU_CRON_SECRET
 * ELIMINAR este archivo después de usarlo.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/supabase_client.php';

$key = $_GET['key'] ?? '';
if ($key !== CRON_SECRET) {
    http_response_code(403);
    die('Forbidden');
}

$password = $_GET['password'] ?? 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);
$db = new SupabaseClient(true);

try {
    $existing = $db->selectOne('usuarios', ['eq' => ['email' => 'admin@agro.local']]);
    if ($existing) {
        $db->update('usuarios', ['id' => $existing['id']], [
            'password_hash' => $hash,
            'rol' => 'admin',
            'activo' => true,
        ]);
        echo 'Admin actualizado. Email: admin@agro.local Password: ' . htmlspecialchars($password);
    } else {
        $db->insert('usuarios', [
            'nombre' => 'Administrador',
            'email' => 'admin@agro.local',
            'password_hash' => $hash,
            'rol' => 'admin',
            'activo' => true,
        ]);
        echo 'Admin creado. Email: admin@agro.local Password: ' . htmlspecialchars($password);
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
