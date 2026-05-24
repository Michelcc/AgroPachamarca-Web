<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/functions.php';
requireAdmin();

$pageTitle = 'Dashboard';
$activeMenu = 'dashboard.php';

try {
    $totalUsuarios = db()->count('usuarios');
    $totalTablas = db()->count('catalogo_tablas', ['activo' => 'true']);
    $totalProductos = db()->count('productos');
    $totalCarpetas = db()->count('carpetas');
    $prestamosActivos = db()->select('prestamos', [
        'select' => '*,carpetas(numero,imputado)',
        'eq' => ['activo' => 'true'],
        'order' => 'fecha_prestamo.desc',
        'limit' => 50,
    ]);
    $ultimosMovimientos = db()->select('historial_movimientos', [
        'select' => '*,carpetas(numero)',
        'order' => 'fecha.desc',
        'limit' => 5,
    ]);

    // Préstamos por mes (últimos 6 meses)
    $prestamosMes = [];
    for ($i = 5; $i >= 0; $i--) {
        $mes = date('Y-m', strtotime("-$i months"));
        $prestamosMes[$mes] = 0;
    }
    $todosPrestamos = db()->select('prestamos', [
        'select' => 'fecha_prestamo',
        'order' => 'fecha_prestamo.desc',
        'limit' => 500,
    ]);
    foreach ($todosPrestamos as $p) {
        $m = substr($p['fecha_prestamo'], 0, 7);
        if (isset($prestamosMes[$m])) {
            $prestamosMes[$m]++;
        }
    }
} catch (Exception $e) {
    $errorDash = $e->getMessage();
    $totalUsuarios = $totalTablas = $totalProductos = $totalCarpetas = 0;
    $prestamosActivos = $ultimosMovimientos = [];
    $prestamosMes = [];
}

require __DIR__ . '/includes/header.php';
?>

<?php if (!empty($errorDash)): ?>
<div class="alert alert-warning">Algunos datos no cargaron: <?= e($errorDash) ?>. ¿Ejecutaste sql/schema.sql en Supabase?</div>
<?php endif; ?>

<div class="row g-3 mb-4">
  <?php
  $stats = [
    ['Usuarios panel', $totalUsuarios, '👥'],
    ['Tablas activas', $totalTablas, '📋'],
    ['Productos', $totalProductos, '📦'],
    ['Carpetas', $totalCarpetas, '📁'],
  ];
  foreach ($stats as $s):
  ?>
  <div class="col-md-3 col-6">
    <div class="card stat-card p-3">
      <small class="text-muted"><?= $s[2] ?> <?= e($s[0]) ?></small>
      <div class="stat-value"><?= (int) $s[1] ?></div>
    </div>
  </div>
  <?php endforeach; ?>
</div>

<div class="row g-4">
  <div class="col-lg-8">
    <div class="table-card">
      <h2 class="h6 fw-bold mb-3">Préstamos activos (<?= count($prestamosActivos) ?>)</h2>
      <div class="table-responsive">
        <table class="table table-sm datatable">
          <thead><tr><th>Carpeta</th><th>Solicitante</th><th>Fecha</th><th>Días</th></tr></thead>
          <tbody>
          <?php foreach ($prestamosActivos as $p):
            $dias = diasTranscurridos($p['fecha_prestamo']);
            $num = $p['carpetas']['numero'] ?? '—';
          ?>
            <tr>
              <td><?= e($num) ?></td>
              <td><?= e($p['solicitante']) ?></td>
              <td><?= e(substr($p['fecha_prestamo'], 0, 10)) ?></td>
              <td><span class="badge bg-<?= colorPrestamo($dias) ?>"><?= $dias ?></span></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="col-lg-4">
    <div class="table-card mb-4">
      <h2 class="h6 fw-bold mb-3">Préstamos por mes</h2>
      <canvas id="chartPrestamos" height="200"></canvas>
    </div>
    <div class="table-card">
      <h2 class="h6 fw-bold mb-3">Últimos movimientos</h2>
      <ul class="list-group list-group-flush">
        <?php foreach ($ultimosMovimientos as $m): ?>
        <li class="list-group-item px-0 small">
          <strong><?= e($m['tipo']) ?></strong> · <?= e($m['carpetas']['numero'] ?? '') ?><br>
          <span class="text-muted"><?= e(substr($m['fecha'], 0, 16)) ?></span>
        </li>
        <?php endforeach; ?>
        <?php if (empty($ultimosMovimientos)): ?>
        <li class="list-group-item px-0 text-muted">Sin movimientos aún</li>
        <?php endif; ?>
      </ul>
    </div>
  </div>
</div>

<?php
$chartLabels = json_encode(array_keys($prestamosMes));
$chartData = json_encode(array_values($prestamosMes));
$extraScripts = <<<HTML
<script>
new Chart(document.getElementById('chartPrestamos'), {
  type: 'bar',
  data: {
    labels: {$chartLabels},
    datasets: [{ label: 'Préstamos', data: {$chartData}, backgroundColor: '#00450d' }]
  },
  options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
});
</script>
HTML;
require __DIR__ . '/includes/footer.php';
