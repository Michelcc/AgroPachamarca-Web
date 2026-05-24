<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Alertas climáticas';
$activeMenu = 'alertas.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        $payload = [
            'titulo' => trim($_POST['titulo']),
            'mensaje' => trim($_POST['mensaje']),
            'nivel' => $_POST['nivel'] ?? 'info',
            'activo' => !empty($_POST['activo']),
            'lat' => $_POST['lat'] !== '' ? (float) $_POST['lat'] : null,
            'lng' => $_POST['lng'] !== '' ? (float) $_POST['lng'] : null,
        ];
        if ($action === 'create') {
            db()->insert('alertas_climaticas', $payload);
            flash('success', 'Alerta creada.');
        } elseif ($action === 'update') {
            db()->update('alertas_climaticas', ['id' => $_POST['id']], $payload);
            flash('success', 'Alerta actualizada.');
        } elseif ($action === 'toggle') {
            $row = db()->selectOne('alertas_climaticas', ['select' => 'activo', 'eq' => ['id' => $_POST['id']]]);
            if ($row) {
                db()->update('alertas_climaticas', ['id' => $_POST['id']], ['activo' => empty($row['activo'])]);
                flash('success', 'Estado actualizado.');
            }
        } elseif ($action === 'delete') {
            db()->delete('alertas_climaticas', ['id' => $_POST['id']]);
            flash('success', 'Alerta eliminada.');
        }
    } catch (Exception $e) {
        flash('error', $e->getMessage());
    }
    redirect('admin/alertas.php');
}

$alertas = db()->select('alertas_climaticas', ['select' => '*', 'order' => 'created_at.desc']);
$niveles = ['info' => 'Info', 'advertencia' => 'Advertencia', 'critico' => 'Crítico'];

require __DIR__ . '/../includes/header.php';
?>

<div class="d-flex justify-content-between mb-3">
  <p class="text-muted mb-0">Alertas globales visibles en la app móvil</p>
  <button class="btn btn-agro btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreate">+ Nueva alerta</button>
</div>

<div class="table-card">
  <table class="table datatable">
    <thead><tr><th>Título</th><th>Nivel</th><th>Ubicación</th><th>Activo</th><th>Fecha</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($alertas as $a):
      $badge = $a['nivel'] === 'critico' ? 'danger' : ($a['nivel'] === 'advertencia' ? 'warning' : 'info');
    ?>
      <tr>
        <td>
          <strong><?= e($a['titulo']) ?></strong>
          <div class="small text-muted"><?= e(strlen($a['mensaje']) > 80 ? substr($a['mensaje'], 0, 80) . '…' : $a['mensaje']) ?></div>
        </td>
        <td><span class="badge bg-<?= $badge ?>"><?= e($niveles[$a['nivel']] ?? $a['nivel']) ?></span></td>
        <td><?= ($a['lat'] !== null && $a['lng'] !== null) ? e(round($a['lat'], 4) . ', ' . round($a['lng'], 4)) : '—' ?></td>
        <td>
          <form method="post" class="d-inline">
            <input type="hidden" name="action" value="toggle">
            <input type="hidden" name="id" value="<?= e($a['id']) ?>">
            <button class="btn btn-sm btn-<?= !empty($a['activo']) ? 'success' : 'secondary' ?>"><?= !empty($a['activo']) ? 'Activa' : 'Inactiva' ?></button>
          </form>
        </td>
        <td><?= e(substr($a['created_at'], 0, 10)) ?></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEdit<?= e($a['id']) ?>">Editar</button>
          <form method="post" class="d-inline" onsubmit="return confirm('¿Eliminar?')">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= e($a['id']) ?>">
            <button class="btn btn-sm btn-outline-danger">Eliminar</button>
          </form>
        </td>
      </tr>
      <div class="modal fade" id="modalEdit<?= e($a['id']) ?>" tabindex="-1">
        <div class="modal-dialog modal-lg"><form method="post" class="modal-content">
          <input type="hidden" name="action" value="update">
          <input type="hidden" name="id" value="<?= e($a['id']) ?>">
          <div class="modal-header"><h5 class="modal-title">Editar alerta</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <input class="form-control mb-2" name="titulo" value="<?= e($a['titulo']) ?>" required>
            <textarea class="form-control mb-2" name="mensaje" rows="3" required><?= e($a['mensaje']) ?></textarea>
            <select class="form-select mb-2" name="nivel">
              <?php foreach ($niveles as $k => $lbl): ?>
              <option value="<?= $k ?>" <?= $a['nivel']===$k?'selected':'' ?>><?= $lbl ?></option>
              <?php endforeach; ?>
            </select>
            <div class="row mb-2">
              <div class="col"><input class="form-control" name="lat" type="number" step="any" value="<?= e($a['lat'] ?? '') ?>" placeholder="Latitud"></div>
              <div class="col"><input class="form-control" name="lng" type="number" step="any" value="<?= e($a['lng'] ?? '') ?>" placeholder="Longitud"></div>
            </div>
            <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" <?= !empty($a['activo']) ? 'checked' : '' ?>><label class="form-check-label">Activo</label></div>
          </div>
          <div class="modal-footer"><button class="btn btn-agro">Guardar</button></div>
        </form></div>
      </div>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<div class="modal fade" id="modalCreate" tabindex="-1">
  <div class="modal-dialog modal-lg"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="create">
    <div class="modal-header"><h5 class="modal-title">Nueva alerta</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <input class="form-control mb-2" name="titulo" placeholder="Título" required>
      <textarea class="form-control mb-2" name="mensaje" rows="3" placeholder="Mensaje" required></textarea>
      <select class="form-select mb-2" name="nivel">
        <?php foreach ($niveles as $k => $lbl): ?>
        <option value="<?= $k ?>"><?= $lbl ?></option>
        <?php endforeach; ?>
      </select>
      <div class="row mb-2">
        <div class="col"><input class="form-control" name="lat" type="number" step="any" placeholder="Latitud (opcional)"></div>
        <div class="col"><input class="form-control" name="lng" type="number" step="any" placeholder="Longitud (opcional)"></div>
      </div>
      <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" checked><label class="form-check-label">Activo</label></div>
    </div>
    <div class="modal-footer"><button class="btn btn-agro">Crear</button></div>
  </form></div>
</div>

<?php require __DIR__ . '/../includes/footer.php'; ?>
