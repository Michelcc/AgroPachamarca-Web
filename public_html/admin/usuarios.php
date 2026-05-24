<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Usuarios';
$activeMenu = 'usuarios.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'create') {
            $pass = $_POST['password'] ?? 'changeme123';
            db()->insert('usuarios', [
                'nombre' => trim($_POST['nombre']),
                'email' => trim($_POST['email']),
                'password_hash' => password_hash($pass, PASSWORD_DEFAULT),
                'rol' => $_POST['rol'],
                'activo' => !empty($_POST['activo']),
            ]);
            flash('success', 'Usuario creado.');
        } elseif ($action === 'update') {
            $data = [
                'nombre' => trim($_POST['nombre']),
                'email' => trim($_POST['email']),
                'rol' => $_POST['rol'],
                'activo' => !empty($_POST['activo']),
            ];
            if (!empty($_POST['password'])) {
                $data['password_hash'] = password_hash($_POST['password'], PASSWORD_DEFAULT);
            }
            db()->update('usuarios', ['id' => $_POST['id']], $data);
            flash('success', 'Usuario actualizado.');
        } elseif ($action === 'delete') {
            db()->delete('usuarios', ['id' => $_POST['id']]);
            flash('success', 'Usuario eliminado.');
        }
    } catch (Exception $e) {
        flash('error', $e->getMessage());
    }
    redirect('admin/usuarios.php');
}

$usuarios = db()->select('usuarios', ['select' => '*', 'order' => 'created_at.desc']);
$profiles = db()->select('profiles', ['select' => 'id,nombre,username,rol,activo,ultimo_acceso,created_at', 'order' => 'created_at.desc', 'limit' => 100]);

require __DIR__ . '/../includes/header.php';
?>

<div class="d-flex justify-content-between mb-3">
  <p class="text-muted mb-0">Usuarios del panel web y perfiles de la app móvil (Supabase Auth)</p>
  <button class="btn btn-agro btn-sm" data-bs-toggle="modal" data-bs-target="#modalCreate">+ Nuevo usuario panel</button>
</div>

<div class="table-card mb-4">
  <h2 class="h6 fw-bold">Usuarios panel (login PHP)</h2>
  <table class="table datatable">
    <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th>Último acceso</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($usuarios as $u): ?>
      <tr>
        <td><?= e($u['nombre']) ?></td>
        <td><?= e($u['email']) ?></td>
        <td><span class="badge bg-secondary"><?= e($u['rol']) ?></span></td>
        <td><?= $u['activo'] ? '✓' : '—' ?></td>
        <td><?= e($u['ultimo_acceso'] ? substr($u['ultimo_acceso'], 0, 16) : '—') ?></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEdit<?= e($u['id']) ?>">Editar</button>
          <?php if ($u['id'] !== $_SESSION['usuario_id']): ?>
          <form method="post" class="d-inline" onsubmit="return confirm('¿Eliminar?')">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= e($u['id']) ?>">
            <button class="btn btn-sm btn-outline-danger">Eliminar</button>
          </form>
          <?php endif; ?>
        </td>
      </tr>
      <div class="modal fade" id="modalEdit<?= e($u['id']) ?>" tabindex="-1">
        <div class="modal-dialog"><form method="post" class="modal-content">
          <input type="hidden" name="action" value="update">
          <input type="hidden" name="id" value="<?= e($u['id']) ?>">
          <div class="modal-header"><h5 class="modal-title">Editar usuario</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body">
            <input class="form-control mb-2" name="nombre" value="<?= e($u['nombre']) ?>" required>
            <input class="form-control mb-2" name="email" type="email" value="<?= e($u['email']) ?>" required>
            <select class="form-select mb-2" name="rol">
              <?php foreach (['admin','operador','agricultor'] as $r): ?>
              <option value="<?= $r ?>" <?= $u['rol']===$r?'selected':'' ?>><?= $r ?></option>
              <?php endforeach; ?>
            </select>
            <input class="form-control mb-2" name="password" type="password" placeholder="Nueva contraseña (opcional)">
            <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" <?= $u['activo']?'checked':'' ?>><label class="form-check-label">Activo</label></div>
          </div>
          <div class="modal-footer"><button class="btn btn-agro">Guardar</button></div>
        </form></div>
      </div>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<div class="table-card">
  <h2 class="h6 fw-bold">Perfiles app móvil (profiles)</h2>
  <table class="table datatable">
    <thead><tr><th>Username</th><th>Nombre</th><th>Rol</th><th>Activo</th><th>Registro</th></tr></thead>
    <tbody>
    <?php foreach ($profiles as $p): ?>
      <tr>
        <td><?= e($p['username']) ?></td>
        <td><?= e($p['nombre']) ?></td>
        <td><?= e($p['rol'] ?? 'agricultor') ?></td>
        <td><?= !empty($p['activo']) ? '✓' : '—' ?></td>
        <td><?= e(substr($p['created_at'], 0, 10)) ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<div class="modal fade" id="modalCreate" tabindex="-1">
  <div class="modal-dialog"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="create">
    <div class="modal-header"><h5 class="modal-title">Nuevo usuario</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <input class="form-control mb-2" name="nombre" placeholder="Nombre" required>
      <input class="form-control mb-2" name="email" type="email" placeholder="Email" required>
      <input class="form-control mb-2" name="password" type="password" placeholder="Contraseña" required>
      <select class="form-select mb-2" name="rol">
        <option value="admin">admin</option>
        <option value="operador">operador</option>
      </select>
      <div class="form-check"><input class="form-check-input" type="checkbox" name="activo" value="1" checked><label class="form-check-label">Activo</label></div>
    </div>
    <div class="modal-footer"><button class="btn btn-agro">Crear</button></div>
  </form></div>
</div>

<?php require __DIR__ . '/../includes/footer.php'; ?>
