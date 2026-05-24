<?php
/**
 * Bootstrap API REST · CORS y helpers JSON
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, apikey');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Obtiene user_id (UUID) del token Bearer vía Supabase Auth.
 */
function apiBearerUserId()
{
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/Bearer\s+(\S+)/i', $auth, $m)) {
        return null;
    }
    $token = $m[1];

    $ch = curl_init(rtrim(SUPABASE_URL, '/') . '/auth/v1/user');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_ANON_KEY,
            'Authorization: Bearer ' . $token,
        ],
        CURLOPT_TIMEOUT => 15,
    ]);
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200 || !$response) {
        return null;
    }
    $user = json_decode($response, true);
    return isset($user['id']) ? $user['id'] : null;
}

function apiRequireAuth()
{
    $uid = apiBearerUserId();
    if (!$uid) {
        jsonResponse(['ok' => false, 'error' => 'No autorizado'], 401);
    }
    return $uid;
}
