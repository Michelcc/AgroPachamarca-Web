<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Diagnósticos IA';
$activeMenu = 'diagnosticos.php';

$filtroFecha = $_GET['fecha'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    try {
        db()->delete('diagnosticos_ia', ['id' => $_POST['id']]);
        flash('success', 'Diagnóstico eliminado.');
    } catch (Exception $e) {
        flash('error', $e->getMessage());
    }
    redirect('admin/diagnosticos.php' . ($filtroFecha ? '?fecha=' . urlencode($filtroFecha) : ''));
}

$params = [
    'select' => '*,profiles(nombre,username)',
    'order' => 'created_at.desc',
    'limit' => 500,
];
if ($filtroFecha !== '') {
    $params['gte'] = ['created_at' => $filtroFecha . 'T00:00:00'];
    $params['lte'] = ['created_at' => $filtroFecha . 'T23:59:59'];
}

$diagnosticos = db()->select('diagnosticos_ia', $params);

$statsPorDia = [];
foreach ($diagnosticos as $d) {
    $dia = substr($d['created_at'], 0, 10);
    if (!isset($statsPorDia[$dia])) {
        $statsPorDia[$dia] = 0;
    }
    $statsPorDia[$dia]++;
}
krsort($statsPorDia);

require __DIR__ . '/../includes/header.php';
?>

<form method="get" class="row g-2 mb-3 align-items-end">
  <div class="col-auto">
    <label class="form-label small">Filtrar por fecha</label>
    <input type="date" name="fecha" class="form-control form-control-sm" value="<?= e($filtroFecha) ?>">
  </div>
  <div class="col-auto">
    <button class="btn btn-agro btn-sm">Filtrar</button>
    <a href="diagnosticos.php" class="btn btn-outline-secondary btn-sm">Ver todos</a>
  </div>
</form>

<div class="row g-3 mb-4">
  <div class="col-md-4">
    <div class="stat-card p-3">
      <small class="text-muted">Total (vista actual)</small>
      <div class="stat-value"><?= count($diagnosticos) ?></div>
    </div>
  </div>
  <div class="col-md-8">
    <div class="table-card">
      <h2 class="h6 fw-bold mb-2">Diagnósticos por día</h2>
      <table class="table table-sm mb-0">
        <thead><tr><th>Fecha</th><th>Cantidad</th></tr></thead>
        <tbody>
        <?php foreach (array_slice($statsPorDia, 0, 14, true) as $dia => $cnt): ?>
          <tr>
            <td><a href="?fecha=<?= e($dia) ?>"><?= e($dia) ?></a></td>
            <td><span class="badge bg-success"><?= $cnt ?></span></td>
          </tr>
        <?php endforeach; ?>
        <?php if (empty($statsPorDia)): ?>
          <tr><td colspan="2" class="text-muted">Sin datos</td></tr>
        <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div class="table-card">
  <table class="table datatable">
    <thead>
      <tr><th>Imagen</th><th>Título / Resumen</th><th>Modelo</th><th>Severidad</th><th>Usuario</th><th>Fecha</th><th></th></tr>
    </thead>
    <tbody>
    <?php foreach ($diagnosticos as $d):
      $prof = $d['profiles'] ?? [];
    ?>
      <tr>
        <td>
          <?php if (!empty($d['imagen_url'])): ?>
            <a href="<?= e($d['imagen_url']) ?>" target="_blank">
              <img src="<?= e($d['imagen_url']) ?>" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:8px">
            </a>
          <?php else: ?>—<?php endif; ?>
        </td>
        <td>
          <strong><?= e($d['titulo'] ?? 'Sin título') ?></strong>
          <div class="small"><?= e(strlen($d['resumen']) > 100 ? substr($d['resumen'], 0, 100) . '…' : $d['resumen']) ?></div>
        </td>
        <td><?= e($d['modelo']) ?></td>
        <td><span class="badge bg-secondary"><?= e($d['severidad']) ?></span></td>
        <td><?= e($prof['nombre'] ?? $prof['username'] ?? '—') ?></td>
        <td><?= e(substr($d['created_at'], 0, 16)) ?></td>
        <td>
          <form method="post" onsubmit="return confirm('¿Eliminar diagnóstico?')">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= e($d['id']) ?>">
            <button class="btn btn-sm btn-outline-danger">Eliminar</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php require __DIR__ . '/../includes/footer.php'; ?>
