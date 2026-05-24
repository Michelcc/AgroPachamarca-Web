<?php
require_once __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    try {
        $params = [
            'select' => 'id,numero,imputado,agraviado,delito,estado,fecha_registro,fiscalias(nombre),despachos(nombre)',
            'order' => 'numero.asc',
            'limit' => 200,
        ];
        if (!empty($_GET['numero'])) {
            $all = db()->select('carpetas', $params);
            $q = strtolower($_GET['numero']);
            $all = array_values(array_filter($all, function ($c) use ($q) {
                return strpos(strtolower($c['numero']), $q) !== false
                    || strpos(strtolower($c['imputado']), $q) !== false;
            }));
            jsonResponse(['ok' => true, 'data' => $all]);
        }
        if (!empty($_GET['estado'])) {
            $params['eq'] = ['estado' => $_GET['estado']];
        }
        $carpetas = db()->select('carpetas', $params);
        jsonResponse(['ok' => true, 'data' => $carpetas]);
    } catch (Exception $e) {
        jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
    }
}

if ($method !== 'POST') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$body = readJsonBody();
$action = $action ?: ($body['action'] ?? '');

if ($action === '') {
    jsonResponse(['ok' => false, 'error' => 'action requerida: prestamo, devolucion, desarchivar'], 400);
}

$carpetaId = $body['carpeta_id'] ?? '';
if ($carpetaId === '') {
    jsonResponse(['ok' => false, 'error' => 'carpeta_id requerido'], 400);
}

try {
    if ($action === 'prestamo' || $action === 'prestar') {
        $solicitante = trim($body['solicitante'] ?? '');
        $fiscaliaSol = trim($body['fiscalia_solicitante'] ?? '');
        if ($solicitante === '' || $fiscaliaSol === '') {
            jsonResponse(['ok' => false, 'error' => 'solicitante y fiscalia_solicitante requeridos'], 400);
        }
        $prestamo = db()->insert('prestamos', [
            'carpeta_id' => $carpetaId,
            'fiscalia_solicitante' => $fiscaliaSol,
            'solicitante' => $solicitante,
            'motivo' => $body['motivo'] ?? null,
            'activo' => true,
        ]);
        db()->update('carpetas', ['id' => $carpetaId], ['estado' => 'Prestada']);
        registrarHistorial($carpetaId, 'Préstamo API', 'Prestada a ' . $solicitante, $body['usuario_id'] ?? null);
        jsonResponse(['ok' => true, 'data' => $prestamo]);
    }

    if ($action === 'devolucion' || $action === 'devolver') {
        $prestamo = db()->selectOne('prestamos', [
            'select' => 'id',
            'eq' => ['carpeta_id' => $carpetaId, 'activo' => 'true'],
        ]);
        if ($prestamo) {
            db()->update('prestamos', ['id' => $prestamo['id']], [
                'activo' => false,
                'fecha_devolucion' => date('c'),
            ]);
        }
        db()->update('carpetas', ['id' => $carpetaId], ['estado' => 'Devuelta']);
        registrarHistorial($carpetaId, 'Devolución API', 'Devuelta vía API', $body['usuario_id'] ?? null);
        jsonResponse(['ok' => true, 'message' => 'Devolución registrada']);
    }

    if ($action === 'desarchivar') {
        $motivo = trim($body['motivo'] ?? 'Desarchivada vía API');
        db()->update('carpetas', ['id' => $carpetaId], ['estado' => 'Desarchivada']);
        registrarHistorial($carpetaId, 'Desarchivo API', $motivo, $body['usuario_id'] ?? null);
        jsonResponse(['ok' => true, 'message' => 'Carpeta desarchivada']);
    }

    jsonResponse(['ok' => false, 'error' => 'Acción no reconocida'], 400);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
