<?php

require_once __DIR__ . '/../supabase_client.php';

function db()
{
    static $client = null;
    if ($client === null) {
        $client = new SupabaseClient(true);
    }
    return $client;
}

function e($str)
{
    return htmlspecialchars((string) $str, ENT_QUOTES, 'UTF-8');
}

function redirect($path)
{
    $url = (strpos($path, 'http') === 0) ? $path : rtrim(BASE_URL, '/') . '/' . ltrim($path, '/');
    header('Location: ' . $url);
    exit;
}

function isLoggedIn()
{
    return !empty($_SESSION['usuario_id']);
}

function isAdmin()
{
    return isLoggedIn() && (!empty($_SESSION['rol']) && $_SESSION['rol'] === 'admin');
}

function requireLogin()
{
    if (!isLoggedIn()) {
        redirect('login.php');
    }
}

function requireAdmin()
{
    requireLogin();
    if ($_SESSION['rol'] !== 'admin') {
        flash('error', 'Solo administradores pueden acceder al panel.');
        redirect('login.php');
    }
}

function flash($type, $message)
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function getFlash()
{
    if (empty($_SESSION['flash'])) {
        return null;
    }
    $f = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $f;
}

function jsonResponse($data, $code = 200)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, apikey');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function readJsonBody()
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function uploadImage(array $file, $prefix = 'prod')
{
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Error al subir archivo.');
    }
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mime, $allowed, true)) {
        throw new RuntimeException('Formato de imagen no permitido.');
    }
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $name = $prefix . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);
    $dest = UPLOAD_DIR . $name;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new RuntimeException('No se pudo guardar la imagen.');
    }
    return UPLOAD_URL . $name;
}

function diasTranscurridos($fecha)
{
    $inicio = new DateTime($fecha);
    $hoy = new DateTime('today');
    return (int) $inicio->diff($hoy)->days;
}

function colorPrestamo($dias)
{
    if ($dias <= 3) {
        return 'success';
    }
    if ($dias <= 5) {
        return 'warning';
    }
    return 'danger';
}

function estadosCarpeta()
{
    return ['Archivo Central', 'Prestada', 'Devuelta', 'Desarchivada'];
}

function registrarHistorial($carpetaId, $tipo, $descripcion, $usuarioId = null)
{
    db()->insert('historial_movimientos', [
        'carpeta_id' => $carpetaId,
        'tipo' => $tipo,
        'descripcion' => $descripcion,
        'usuario_id' => $usuarioId ?: ($_SESSION['usuario_id'] ?? null),
    ]);
}

function currentPage()
{
    return basename($_SERVER['PHP_SELF']);
}
