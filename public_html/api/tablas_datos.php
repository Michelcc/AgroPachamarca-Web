<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

try {
    $tablas = db()->select('catalogo_tablas', [
        'select' => 'codigo,categoria,nombre_display,icono,orden,activo',
        'eq' => ['activo' => 'true'],
        'order' => 'orden.asc,codigo.asc',
    ]);
    jsonResponse(['ok' => true, 'data' => $tablas]);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
