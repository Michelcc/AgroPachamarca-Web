<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Recomendaciones de cultivo';
$activeMenu = 'recomendaciones.php';

$filtroAlt = isset($_GET['altitud']) ? (int) $_GET['altitud'] : null;
$filtroMes = isset($_GET['mes']) ? (int) $_GET['mes'] : null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        $payload = [
            'cultivo' => trim($_POST['cultivo']),
            'altitud_min_m' => (int) ($_POST['altitud_min_m'] ?? 0),
            'altitud_max_m' => (int) ($_POST['altitud_max_m'] ?? 5000),
            'mes_inicio' => (int) $_POST['mes_inicio'],
            'mes_fin' => (int) $_POST['mes_fin'],
            'probabilidad' => (float) ($_POST['probabilidad'] ?? 80),
            'notas' => trim($_POST['notas'] ?? ''),
            'activo' => !empty($_POST['activo']),
        ];
        if ($action === 'create') {
            db()->insert('recomendaciones_cultivo', $payload);
            flash('success', 'Recomendación creada.');
        } elseif ($action === 'update') {
            db()->update('recomendaciones_cultivo', ['id' => $_POST['id']], $payload);
            flash('success', 'Recomendación actualizada.');
        } elseif ($action === 'delete') {
            db()->delete('recomendaciones_cultivo', ['id' => $_POST['id']]);
            flash('success', 'Recomendación eliminada.');
        }
    } catch (Exception $e) {
        flash('error', $e->getMessage());
    }
    $q = [];
    if ($filtroAlt !== null) {
        $q['altitud'] = $filtroAlt;
    }
    if ($filtroMes !== null) {
        $q['mes'] = $filtroMes;
    }
    redirect('admin/recomendaciones.php' . ($q ? '?' . http_build_query($q) : ''));
}

$params = ['select' => '*', 'order' => 'cultivo.asc,altitud_min_m.asc'];
$rows = db()->select('recomendaciones_cultivo', $params);

if ($filtroAlt !== null) {
    $rows = array_values(array_filter($rows, function ($r) use ($filtroAlt) {
        return $filtroAlt >= (int) $r['altitud_min_m'] && $filtroAlt <= (int) $r['altitud_max_m'];
    }));
}
if ($filtroMes !== null && $filtroMes >= 1 && $filtroMes <= 12) {
    $rows = array_values(array_filter($rows, function ($r) use ($filtroMes) {
        $ini = (int) $r['mes_inicio'];
        $fin = (int) $r['mes_fin'];
        if ($ini <= $fin) {
            return $filtroMes >= $ini && $filtroMes <= $fin;
        }
        return $filtroMes >= $ini || $filtroMes <= $fin;
    }));
}

$meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

require __DIR__ . '/../includes/header.php';
?>

<form method="get" class="row g-2 mb-3 align-items-end">
  <div class="col-auto">
    <label class="form-label small">Altitud (msnm)</label>
    <input type="number" name="altitud" class="form-control form-control-sm" value="<?= $filtroAlt !== null ? e($filtroAlt) : '' ?>" placeholder="Ej. 3200">
  </div>
  <div class="col-auto">
    <label class="form-label small">Mes (1-12)</label>
    <input type="number" name="mes" class="form-control form-control-sm" min="1" max="12" value="<?= $filtroMes ?: '' ?>" placeholder="Ej. 4">
  </div>
  <div class="col-auto">
    <button class="btn btn-agro btn-sm">Filtrar</button>
    <a href="recomendaciones.php" class="btn btn-outline-secondary btn-sm">Limpiar</a>
  </div>
  <div class="col-auto ms-auto">
    <button type="button" class="btn btn-agro btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreate">+ Nueva</button>
  </div>
</form>

<div class="table-card">
  <table class="table datatable">
    <thead>
      <tr><th>Cultivo</th><th>Altitud</th><th>Meses</th><th>Prob.</th><th>Notas</th><th>Activo</th><th></th></tr>
    </thead>
    <tbody>
    <?php foreach ($rows as $r): ?>
      <tr>
        <td><?= e($r['cultivo']) ?></td>
        <td><?= (int) $r['altitud_min_m'] ?> – <?= (int) $r['altitud_max_m'] ?> m</td>
        <td><?= e($meses[(int) $r['mes_inicio']] ?? $r['mes_inicio']) ?> – <?= e($meses[(int) $r['mes_fin']] ?? $r['mes_fin']) ?></td>
        <td><?= e($r['probabilidad']) ?>%</td>
        <td class="small"><?= e($r['notas'] ?? '') ?></td>
        <td><?= !empty($r['activo']) ? '✓' : '—' ?></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEdit<?= e($r['id']) ?>">Editar</button>
          <form method="post" class="d-inline" onsubmit="return confirm('¿Eliminar?')">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= e($r['id']) ?>">
            <button class="btn btn-sm btn-outline-danger">Eliminar</button>
          </form>
        </td>
      </tr>
      <div class="modal fade" id="modalEdit<?= e($r['id']) ?>" tabindex="-1">
        <div class="modal-dialog"><form method="post" class="modal-content">
          <input type="hidden" name="action" value="update">
          <input type="hidden" name="id" value="<?= e($r['id']) ?>">
          <div class="modal-header"><h5 class="modal-title">Editar recomendación</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <input class="form-control mb-2" name="cultivo" value="<?= e($r['cultivo']) ?>" required>
            <div class="row mb-2">
              <div class="col"><input class="form-control" name="altitud_min_m" type="number" value="<?= (int) $r['altitud_min_m'] ?>" placeholder="Alt. mín"></div>
              <div class="col"><input class="form-control" name="altitud_max_m" type="number" value="<?= (int) $r['altitud_max_m'] ?>" placeholder="Alt. máx"></div>
            </div>
            <div class="row mb-2">
              <div class="col"><input class="form-control" name="mes_inicio" type="number" min="1" max="12" value="<?= (int) $r['mes_inicio'] ?>"></div>
              <div class="col"><input class="form-control" name="mes_fin" type="number" min="1" max="12" value="<?= (int) $r['mes_fin'] ?>"></div>
            </div>
            <input class="form-control mb-2" name="probabilidad" type="number" step="0.01" value="<?= e($r['probabilidad']) ?>">
            <textarea class="form-control mb-2" name="notas" rows="2"><?= e($r['notas'] ?? '') ?></textarea>
            <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" <?= !empty($r['activo']) ? 'checked' : '' ?>><label class="form-check-label">Activo</label></div>
          </div>
          <div class="modal-footer"><button class="btn btn-agro">Guardar</button></div>
        </form></div>
      </div>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<div class="modal fade" id="modalCreate" tabindex="-1">
  <div class="modal-dialog"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="create">
    <div class="modal-header"><h5 class="modal-title">Nueva recomendación</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <input class="form-control mb-2" name="cultivo" placeholder="Cultivo" required>
      <div class="row mb-2">
        <div class="col"><input class="form-control" name="altitud_min_m" type="number" value="0" placeholder="Alt. mín"></div>
        <div class="col"><input class="form-control" name="altitud_max_m" type="number" value="5000" placeholder="Alt. máx"></div>
      </div>
      <div class="row mb-2">
        <div class="col"><input class="form-control" name="mes_inicio" type="number" min="1" max="12" value="1"></div>
        <div class="col"><input class="form-control" name="mes_fin" type="number" min="1" max="12" value="12"></div>
      </div>
      <input class="form-control mb-2" name="probabilidad" type="number" value="80">
      <textarea class="form-control mb-2" name="notas" rows="2" placeholder="Notas"></textarea>
      <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" checked><label class="form-check-label">Activo</label></div>
    </div>
    <div class="modal-footer"><button class="btn btn-agro">Crear</button></div>
  </form></div>
</div>

<?php require __DIR__ . '/../includes/footer.php'; ?>
