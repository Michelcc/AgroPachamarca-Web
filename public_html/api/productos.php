<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

try {
    $params = [
        'select' => 'id,nombre,categoria,precio,unidad,stock,disponible,destacado,imagen_url,created_at',
        'order' => 'created_at.desc',
        'limit' => 500,
    ];
    if (!empty($_GET['user_id'])) {
        $params['eq'] = ['user_id' => $_GET['user_id']];
    }
  // Solo disponibles para catálogo público
    if (!empty($_GET['disponible'])) {
        $params['eq'] = array_merge($params['eq'] ?? [], ['disponible' => 'true']);
    }
    $productos = db()->select('productos', $params);
    jsonResponse(['ok' => true, 'data' => $productos]);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
