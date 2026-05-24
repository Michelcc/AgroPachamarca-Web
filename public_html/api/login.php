<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$body = readJsonBody();
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if ($email === '' || $password === '') {
    jsonResponse(['ok' => false, 'error' => 'Email y contraseña requeridos'], 400);
}

try {
  // 1) Supabase Auth (app móvil)
    $auth = db()->authLogin($email, $password);
    if (!empty($auth['access_token'])) {
        $userId = $auth['user']['id'] ?? null;
        $profile = null;
        if ($userId) {
            try {
                $profile = db()->selectOne('profiles', ['select' => '*', 'eq' => ['id' => $userId]]);
            } catch (Exception $e) {
                $profile = null;
            }
        }
        jsonResponse([
            'ok' => true,
            'source' => 'supabase',
            'access_token' => $auth['access_token'],
            'refresh_token' => $auth['refresh_token'] ?? null,
            'user' => $auth['user'] ?? null,
            'profile' => $profile,
        ]);
    }
} catch (Exception $e) {
    // Continuar con tabla usuarios
}

try {
  // 2) Usuarios panel (PHP)
    $user = db()->selectOne('usuarios', [
        'select' => 'id,nombre,email,password_hash,rol,activo',
        'eq' => ['email' => $email],
    ]);
    if ($user && !empty($user['activo']) && password_verify($password, $user['password_hash'])) {
        db()->update('usuarios', ['id' => $user['id']], ['ultimo_acceso' => date('c')]);
        jsonResponse([
            'ok' => true,
            'source' => 'usuarios',
            'usuario' => [
                'id' => $user['id'],
                'nombre' => $user['nombre'],
                'email' => $user['email'],
                'rol' => $user['rol'],
            ],
        ]);
    }
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}

jsonResponse(['ok' => false, 'error' => 'Credenciales inválidas'], 401);
