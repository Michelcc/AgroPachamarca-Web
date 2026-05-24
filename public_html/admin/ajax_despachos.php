<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

header('Content-Type: application/json; charset=utf-8');

$fiscaliaId = $_GET['fiscalia_id'] ?? '';
if ($fiscaliaId === '') {
    echo json_encode(['ok' => false, 'error' => 'fiscalia_id requerido'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $despachos = db()->select('despachos', [
        'select' => 'id,nombre,activo',
        'eq' => ['fiscalia_id' => $fiscaliaId, 'activo' => 'true'],
        'order' => 'nombre.asc',
    ]);
    echo json_encode(['ok' => true, 'data' => $despachos], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
