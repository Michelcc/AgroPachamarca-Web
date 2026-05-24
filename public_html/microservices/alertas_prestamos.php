<?php
/**
 * Cron: alertas de préstamos vencidos
 * Llamar: /microservices/alertas_prestamos.php?key=TU_CRON_SECRET
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json; charset=utf-8');

$key = $_GET['key'] ?? '';
if ($key === '' || !hash_equals(CRON_SECRET, $key)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Clave inválida'], JSON_UNESCAPED_UNICODE);
    exit;
}

$resultado = [
    'ok' => true,
    'fecha' => date('c'),
    'revisados' => 0,
    'alertas_creadas' => 0,
    'correos_simulados' => 0,
    'detalle' => [],
];

try {
    $prestamos = db()->select('prestamos', [
        'select' => '*,carpetas(numero,imputado)',
        'eq' => ['activo' => 'true'],
        'order' => 'fecha_prestamo.asc',
    ]);

    foreach ($prestamos as $p) {
        $resultado['revisados']++;
        $dias = diasTranscurridos($p['fecha_prestamo']);
        $nivel = null;
        $correoSim = false;

        if ($dias >= 10) {
            $nivel = 'critico';
            $correoSim = true;
        } elseif ($dias >= 5) {
            $nivel = 'advertencia';
        } else {
            continue;
        }

        $car = $p['carpetas'] ?? [];
        $desc = 'Carpeta ' . ($car['numero'] ?? $p['carpeta_id']) . ' — ' . $dias . ' días prestada';

        db()->insert('alertas_prestamos', [
            'prestamo_id' => $p['id'],
            'dias_transcurridos' => $dias,
            'nivel' => $nivel,
            'correo_simulado' => $correoSim,
        ]);
        $resultado['alertas_creadas']++;

        if ($correoSim) {
            $resultado['correos_simulados']++;
            if (empty($p['recordatorio_enviado'])) {
                db()->update('prestamos', ['id' => $p['id']], ['recordatorio_enviado' => true]);
            }
        }

        $resultado['detalle'][] = [
            'prestamo_id' => $p['id'],
            'carpeta' => $car['numero'] ?? null,
            'dias' => $dias,
            'nivel' => $nivel,
            'correo_simulado' => $correoSim,
            'mensaje' => $desc,
        ];
    }
} catch (Exception $e) {
    http_response_code(500);
    $resultado = ['ok' => false, 'error' => $e->getMessage()];
}

echo json_encode($resultado, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
