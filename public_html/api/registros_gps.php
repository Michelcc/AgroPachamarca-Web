<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$userId = apiRequireAuth();
$body = readJsonBody();

$lat = isset($body['lat']) ? (float) $body['lat'] : null;
$lng = isset($body['lng']) ? (float) $body['lng'] : null;

if ($lat === null || $lng === null) {
    jsonResponse(['ok' => false, 'error' => 'lat y lng requeridos'], 400);
}

try {
    $row = db()->insert('registros_gps', [
        'user_id' => $userId,
        'tabla_origen' => $body['tabla_origen'] ?? null,
        'lat' => $lat,
        'lng' => $lng,
        'altitud_msnm' => isset($body['altitud_msnm']) ? (float) $body['altitud_msnm'] : null,
        'titulo' => $body['titulo'] ?? null,
        'notas' => $body['notas'] ?? null,
    ]);
    $data = is_array($row) && isset($row[0]) ? $row[0] : $row;
    jsonResponse(['ok' => true, 'data' => $data], 201);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
