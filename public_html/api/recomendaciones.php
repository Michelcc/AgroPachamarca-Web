<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$altitud = isset($_GET['altitud']) ? (int) $_GET['altitud'] : null;
$mes = isset($_GET['mes']) ? (int) $_GET['mes'] : null;

try {
    $rows = db()->select('recomendaciones_cultivo', [
        'select' => '*',
        'eq' => ['activo' => 'true'],
        'order' => 'probabilidad.desc',
    ]);

    if ($altitud !== null) {
        $rows = array_values(array_filter($rows, function ($r) use ($altitud) {
            return $altitud >= (int) $r['altitud_min_m'] && $altitud <= (int) $r['altitud_max_m'];
        }));
    }
    if ($mes !== null && $mes >= 1 && $mes <= 12) {
        $rows = array_values(array_filter($rows, function ($r) use ($mes) {
            $ini = (int) $r['mes_inicio'];
            $fin = (int) $r['mes_fin'];
            if ($ini <= $fin) {
                return $mes >= $ini && $mes <= $fin;
            }
            return $mes >= $ini || $mes <= $fin;
        }));
    }

    jsonResponse(['ok' => true, 'data' => $rows, 'filtros' => ['altitud' => $altitud, 'mes' => $mes]]);
} catch (Exception $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}
