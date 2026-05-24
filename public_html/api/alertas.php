<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

try {
    $alertas = db()->select('alertas_climaticas', [
        'select' => 'id,titulo,mensaje,nivel,lat,lng,created_at',
        'eq' => ['activo' => 'true'],
        'order' => 'created_at.desc',
        'limit' => 100,
    ]);
    jsonResponse(['ok' => true, 'data' => $alertas]);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
