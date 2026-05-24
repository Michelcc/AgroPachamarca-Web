<?php
require_once __DIR__ . '/bootstrap.php';

$userId = apiRequireAuth();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $profile = db()->selectOne('profiles', ['select' => '*', 'eq' => ['id' => $userId]]);
        if (!$profile) {
            jsonResponse(['ok' => false, 'error' => 'Perfil no encontrado'], 404);
        }
        jsonResponse(['ok' => true, 'data' => $profile]);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $body = readJsonBody();
        $allowed = ['nombre', 'username', 'rol', 'activo'];
        $data = [];
        foreach ($allowed as $key) {
            if (array_key_exists($key, $body)) {
                $data[$key] = $body[$key];
            }
        }
        if (empty($data)) {
            jsonResponse(['ok' => false, 'error' => 'Sin campos para actualizar'], 400);
        }
        $updated = db()->update('profiles', ['id' => $userId], $data);
        $row = is_array($updated) && isset($updated[0]) ? $updated[0] : db()->selectOne('profiles', ['eq' => ['id' => $userId]]);
        jsonResponse(['ok' => true, 'data' => $row]);
    }

    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
