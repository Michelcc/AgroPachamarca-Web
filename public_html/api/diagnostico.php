<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$userId = apiBearerUserId();
if (!$userId) {
    jsonResponse(['ok' => false, 'error' => 'Token Bearer requerido'], 401);
}

$body = readJsonBody();
$modelo = trim($body['modelo'] ?? 'gemini');
$severidad = trim($body['severidad'] ?? 'media');
$resumen = trim($body['resumen'] ?? '');

if ($resumen === '') {
    jsonResponse(['ok' => false, 'error' => 'resumen requerido'], 400);
}

try {
    $row = db()->insert('diagnosticos_ia', [
        'user_id' => $userId,
        'modelo' => $modelo,
        'severidad' => $severidad,
        'titulo' => $body['titulo'] ?? null,
        'resumen' => $resumen,
        'imagen_url' => $body['imagen_url'] ?? null,
        'lat' => isset($body['lat']) ? (float) $body['lat'] : null,
        'lng' => isset($body['lng']) ? (float) $body['lng'] : null,
    ]);
    $data = is_array($row) && isset($row[0]) ? $row[0] : $row;
    jsonResponse(['ok' => true, 'data' => $data], 201);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
