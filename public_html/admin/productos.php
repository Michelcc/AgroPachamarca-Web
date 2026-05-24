<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Productos';
$activeMenu = 'productos.php';

$profiles = db()->select('profiles', ['select' => 'id,nombre,username', 'order' => 'nombre.asc', 'limit' => 200]);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'create' || $action === 'update') {
            $data = [
                'nombre' => trim($_POST['nombre']),
                'categoria' => trim($_POST['categoria']),
                'precio' => (float) ($_POST['precio'] ?? 0),
                'unidad' => trim($_POST['unidad'] ?: 'kg'),
                'stock' => (float) ($_POST['stock'] ?? 0),
                'disponible' => !empty($_POST['disponible']),
                'destacado' => !empty($_POST['destacado']),
            ];
            if (!empty($_FILES['imagen']['name'])) {
                $data['imagen_url'] = uploadImage($_FILES['imagen'], 'prod');
            }
            if ($action === 'create') {
                $userId = $_POST['user_id'] ?? '';
                if (!$userId && !empty($profiles[0]['id'])) {
                    $userId = $profiles[0]['id'];
                }
                if (!$userId) {
                    throw new RuntimeException('Seleccione un usuario de la app.');
                }
                $data['user_id'] = $userId;
                db()->insert('productos', $data);
                flash('success', 'Producto creado.');
            } else {
                db()->update('productos', ['id' => $_POST['id']], $data);
                flash('success', 'Producto actualizado.');
            }
        } elseif ($action === 'delete') {
            db()->delete('productos', ['id' => $_POST['id']]);
            flash('success', 'Producto eliminado.');
        }
    } catch (Exception $e) {
        flash('error', $e->getMessage());
    }
    redirect('admin/productos.php');
}

$productos = db()->select('productos', [
    'select' => '*,profiles(nombre,username)',
    'order' => 'created_at.desc',
    'limit' => 500,
]);

require __DIR__ . '/../includes/header.php';
?>

<div class="d-flex justify-content-between mb-3">
  <p class="text-muted mb-0">Todos los productos de la app móvil</p>
  <button class="btn btn-agro btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreate">+ Nuevo producto</button>
</div>

<div class="table-card">
  <table class="table datatable">
    <thead>
      <tr><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Usuario</th><th>Estado</th><th></th></tr>
    </thead>
    <tbody>
    <?php foreach ($productos as $p):
      $prof = $p['profiles'] ?? [];
    ?>
      <tr>
        <td>
          <?php if (!empty($p['imagen_url'])): ?>
            <img src="<?= e($p['imagen_url']) ?>" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px">
          <?php else: ?>—<?php endif; ?>
        </td>
        <td><?= e($p['nombre']) ?><?= !empty($p['destacado']) ? ' ⭐' : '' ?></td>
        <td><?= e($p['categoria']) ?></td>
        <td>S/ <?= number_format((float) $p['precio'], 2) ?> / <?= e($p['unidad']) ?></td>
        <td><?= e($p['stock']) ?></td>
        <td><?= e($prof['nombre'] ?? $prof['username'] ?? substr($p['user_id'] ?? '', 0, 8)) ?></td>
        <td><?= !empty($p['disponible']) ? '<span class="badge bg-success">Disponible</span>' : '<span class="badge bg-secondary">No</span>' ?></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEdit<?= e($p['id']) ?>">Editar</button>
          <form method="post" class="d-inline" onsubmit="return confirm('¿Eliminar?')">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= e($p['id']) ?>">
            <button class="btn btn-sm btn-outline-danger">Eliminar</button>
          </form>
        </td>
      </tr>
      <div class="modal fade" id="modalEdit<?= e($p['id']) ?>" tabindex="-1">
        <div class="modal-dialog"><form method="post" enctype="multipart/form-data" class="modal-content">
          <input type="hidden" name="action" value="update">
          <input type="hidden" name="id" value="<?= e($p['id']) ?>">
          <div class="modal-header"><h5 class="modal-title">Editar producto</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <input class="form-control mb-2" name="nombre" value="<?= e($p['nombre']) ?>" required>
            <input class="form-control mb-2" name="categoria" value="<?= e($p['categoria']) ?>" required>
            <div class="row mb-2">
              <div class="col"><input class="form-control" name="precio" type="number" step="0.01" value="<?= e($p['precio']) ?>"></div>
              <div class="col"><input class="form-control" name="unidad" value="<?= e($p['unidad']) ?>"></div>
            </div>
            <input class="form-control mb-2" name="stock" type="number" step="0.01" value="<?= e($p['stock']) ?>">
            <input class="form-control mb-2" type="file" name="imagen" accept="image/*">
            <?php if (!empty($p['imagen_url'])): ?><small class="text-muted">Actual: <?= e(basename($p['imagen_url'])) ?></small><?php endif; ?>
            <div class="form-check"><input class="form-check-input" type="checkbox" name="disponible" value="1" <?= !empty($p['disponible']) ? 'checked' : '' ?>><label class="form-check-label">Disponible</label></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" name="destacado" value="1" <?= !empty($p['destacado']) ? 'checked' : '' ?>><label class="form-check-label">Destacado</label></div>
          </div>
          <div class="modal-footer"><button class="btn btn-agro">Guardar</button></div>
        </form></div>
      </div>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<div class="modal fade" id="modalCreate" tabindex="-1">
  <div class="modal-dialog"><form method="post" enctype="multipart/form-data" class="modal-content">
    <input type="hidden" name="action" value="create">
    <div class="modal-header"><h5 class="modal-title">Nuevo producto</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <select class="form-select mb-2" name="user_id" required>
        <option value="">Usuario app…</option>
        <?php foreach ($profiles as $pr): ?>
        <option value="<?= e($pr['id']) ?>"><?= e($pr['nombre'] . ' (@' . $pr['username'] . ')') ?></option>
        <?php endforeach; ?>
      </select>
      <input class="form-control mb-2" name="nombre" placeholder="Nombre" required>
      <input class="form-control mb-2" name="categoria" placeholder="Categoría" required>
      <div class="row mb-2">
        <div class="col"><input class="form-control" name="precio" type="number" step="0.01" placeholder="Precio" value="0"></div>
        <div class="col"><input class="form-control" name="unidad" value="kg"></div>
      </div>
      <input class="form-control mb-2" name="stock" type="number" step="0.01" value="0">
      <input class="form-control mb-2" type="file" name="imagen" accept="image/*">
      <div class="form-check"><input class="form-check-input" type="checkbox" name="disponible" value="1" checked><label class="form-check-label">Disponible</label></div>
      <div class="form-check"><input class="form-check-input" type="checkbox" name="destacado" value="1"><label class="form-check-label">Destacado</label></div>
    </div>
    <div class="modal-footer"><button class="btn btn-agro">Crear</button></div>
  </form></div>
</div>

<?php require __DIR__ . '/../includes/footer.php'; ?>
