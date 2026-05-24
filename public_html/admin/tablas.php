<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Tablas de datos';
$activeMenu = 'tablas.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'create') {
            db()->insert('catalogo_tablas', [
                'codigo' => trim($_POST['codigo']),
                'categoria' => trim($_POST['categoria']),
                'nombre_display' => trim($_POST['nombre_display']),
                'icono' => trim($_POST['icono'] ?: '📋'),
                'orden' => (int) ($_POST['orden'] ?? 0),
                'activo' => !empty($_POST['activo']),
            ]);
            flash('success', 'Tabla registrada.');
        } elseif ($action === 'update') {
            db()->update('catalogo_tablas', ['codigo' => $_POST['codigo']], [
                'categoria' => trim($_POST['categoria']),
                'nombre_display' => trim($_POST['nombre_display']),
                'icono' => trim($_POST['icono'] ?: '📋'),
                'orden' => (int) ($_POST['orden'] ?? 0),
                'activo' => !empty($_POST['activo']),
            ]);
            flash('success', 'Tabla actualizada.');
        } elseif ($action === 'toggle') {
            $row = db()->selectOne('catalogo_tablas', [
                'select' => 'activo',
                'eq' => ['codigo' => $_POST['codigo']],
            ]);
            if ($row) {
                db()->update('catalogo_tablas', ['codigo' => $_POST['codigo']], [
                    'activo' => empty($row['activo']),
                ]);
                flash('success', 'Estado actualizado.');
            }
        } elseif ($action === 'reorder') {
            $codigo = $_POST['codigo'] ?? '';
            $dir = $_POST['dir'] ?? '';
            $tablas = db()->select('catalogo_tablas', [
                'select' => 'codigo,orden',
                'order' => 'orden.asc,codigo.asc',
            ]);
            $idx = null;
            foreach ($tablas as $i => $t) {
                if ($t['codigo'] === $codigo) {
                    $idx = $i;
                    break;
                }
            }
            if ($idx !== null) {
                $swap = ($dir === 'up' && $idx > 0) ? $idx - 1 : (($dir === 'down' && $idx < count($tablas) - 1) ? $idx + 1 : null);
                if ($swap !== null) {
                    $a = $tablas[$idx]['orden'];
                    $b = $tablas[$swap]['orden'];
                    db()->update('catalogo_tablas', ['codigo' => $tablas[$idx]['codigo']], ['orden' => $b]);
                    db()->update('catalogo_tablas', ['codigo' => $tablas[$swap]['codigo']], ['orden' => $a]);
                    flash('success', 'Orden actualizado.');
                }
            }
        } elseif ($action === 'delete') {
            db()->delete('catalogo_tablas', ['codigo' => $_POST['codigo']]);
            flash('success', 'Tabla eliminada.');
        }
    } catch (Exception $e) {
        flash('error', $e->getMessage());
    }
    redirect('admin/tablas.php');
}

$tablas = db()->select('catalogo_tablas', [
    'select' => '*',
    'order' => 'orden.asc,codigo.asc',
]);

require __DIR__ . '/../includes/header.php';
?>

<div class="d-flex justify-content-between mb-3">
  <p class="text-muted mb-0">Catálogo de tablas de campo para la app móvil (<?= count($tablas) ?> registros)</p>
  <button class="btn btn-agro btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreate">+ Nueva tabla</button>
</div>

<div class="table-card">
  <table class="table datatable">
    <thead>
      <tr>
        <th>Orden</th>
        <th>Icono</th>
        <th>Código</th>
        <th>Nombre</th>
        <th>Categoría</th>
        <th>Activo</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($tablas as $t): ?>
      <tr>
        <td>
          <form method="post" class="d-inline">
            <input type="hidden" name="action" value="reorder">
            <input type="hidden" name="codigo" value="<?= e($t['codigo']) ?>">
            <input type="hidden" name="dir" value="up">
            <button type="submit" class="btn btn-sm btn-outline-secondary" title="Subir">↑</button>
          </form>
          <?= (int) ($t['orden'] ?? 0) ?>
          <form method="post" class="d-inline">
            <input type="hidden" name="action" value="reorder">
            <input type="hidden" name="codigo" value="<?= e($t['codigo']) ?>">
            <input type="hidden" name="dir" value="down">
            <button type="submit" class="btn btn-sm btn-outline-secondary" title="Bajar">↓</button>
          </form>
        </td>
        <td><?= e($t['icono'] ?? '📋') ?></td>
        <td><code><?= e($t['codigo']) ?></code></td>
        <td><?= e($t['nombre_display'] ?? $t['codigo']) ?></td>
        <td><?= e($t['categoria']) ?></td>
        <td>
          <form method="post" class="d-inline">
            <input type="hidden" name="action" value="toggle">
            <input type="hidden" name="codigo" value="<?= e($t['codigo']) ?>">
            <button type="submit" class="btn btn-sm btn-<?= !empty($t['activo']) ? 'success' : 'secondary' ?>">
              <?= !empty($t['activo']) ? 'Activo' : 'Inactivo' ?>
            </button>
          </form>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEdit<?= e(preg_replace('/[^a-z0-9]/i', '', $t['codigo'])) ?>">Editar</button>
          <form method="post" class="d-inline" onsubmit="return confirm('¿Eliminar tabla del catálogo?')">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="codigo" value="<?= e($t['codigo']) ?>">
            <button class="btn btn-sm btn-outline-danger">Eliminar</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php foreach ($tablas as $t):
  $mid = preg_replace('/[^a-z0-9]/i', '', $t['codigo']);
?>
<div class="modal fade" id="modalEdit<?= e($mid) ?>" tabindex="-1">
  <div class="modal-dialog"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="update">
    <input type="hidden" name="codigo" value="<?= e($t['codigo']) ?>">
    <div class="modal-header"><h5 class="modal-title">Editar <?= e($t['codigo']) ?></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <input class="form-control mb-2" name="nombre_display" value="<?= e($t['nombre_display'] ?? '') ?>" placeholder="Nombre visible" required>
      <input class="form-control mb-2" name="categoria" value="<?= e($t['categoria']) ?>" required>
      <input class="form-control mb-2" name="icono" value="<?= e($t['icono'] ?? '📋') ?>" placeholder="Icono emoji">
      <input class="form-control mb-2" name="orden" type="number" value="<?= (int) ($t['orden'] ?? 0) ?>">
      <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" <?= !empty($t['activo']) ? 'checked' : '' ?>><label class="form-check-label">Activo</label></div>
    </div>
    <div class="modal-footer"><button class="btn btn-agro">Guardar</button></div>
  </form></div>
</div>
<?php endforeach; ?>

<div class="modal fade" id="modalCreate" tabindex="-1">
  <div class="modal-dialog"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="create">
    <div class="modal-header"><h5 class="modal-title">Nueva tabla</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <input class="form-control mb-2" name="codigo" placeholder="codigo_tabla (snake_case)" pattern="[a-z0-9_]+" required>
      <input class="form-control mb-2" name="nombre_display" placeholder="Nombre visible" required>
      <input class="form-control mb-2" name="categoria" placeholder="Categoría" required>
      <input class="form-control mb-2" name="icono" value="📋" placeholder="Icono">
      <input class="form-control mb-2" name="orden" type="number" value="0">
      <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" checked><label class="form-check-label">Activo</label></div>
    </div>
    <div class="modal-footer"><button class="btn btn-agro">Crear</button></div>
  </form></div>
</div>

<?php require __DIR__ . '/../includes/footer.php'; ?>
