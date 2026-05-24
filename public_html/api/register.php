<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$body = readJsonBody();
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';
$nombre = trim($body['nombre'] ?? '');
$username = trim($body['username'] ?? '');

if ($email === '' || $password === '' || $nombre === '' || $username === '') {
    jsonResponse(['ok' => false, 'error' => 'email, password, nombre y username requeridos'], 400);
}

try {
    $auth = db()->authRegister($email, $password, [
        'nombre' => $nombre,
        'username' => $username,
    ]);

    $userId = $auth['user']['id'] ?? ($auth['id'] ?? null);
    if (!$userId && !empty($auth['user_id'])) {
        $userId = $auth['user_id'];
    }

    if ($userId) {
        try {
            db()->insert('profiles', [
                'id' => $userId,
                'nombre' => $nombre,
                'username' => $username,
                'rol' => 'agricultor',
                'activo' => true,
            ]);
        } catch (Exception $e) {
            // Perfil puede existir si trigger lo creó
        }
    }

    jsonResponse([
        'ok' => true,
        'user' => $auth['user'] ?? $auth,
        'message' => 'Registro exitoso. Verifique su correo si la confirmación está activa.',
    ], 201);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 400);
}
