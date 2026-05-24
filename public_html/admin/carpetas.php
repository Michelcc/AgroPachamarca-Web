<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Carpetas fiscales';
$activeMenu = 'carpetas.php';

$tab = $_GET['tab'] ?? 'consulta';
$filtroNum = trim($_GET['numero'] ?? '');
$filtroEstado = $_GET['estado'] ?? '';
$filtroFiscalia = $_GET['fiscalia_id'] ?? '';

$fiscalias = db()->select('fiscalias', ['select' => '*', 'eq' => ['activo' => 'true'], 'order' => 'nombre.asc']);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'ingreso') {
            $id = null;
            $rows = db()->insert('carpetas', [
                'numero' => trim($_POST['numero']),
                'imputado' => trim($_POST['imputado']),
                'agraviado' => trim($_POST['agraviado'] ?? ''),
                'delito' => trim($_POST['delito']),
                'fiscalia_id' => $_POST['fiscalia_id'] ?: null,
                'despacho_id' => $_POST['despacho_id'] ?: null,
                'fiscal_responsable' => trim($_POST['fiscal_responsable'] ?? ''),
                'folios' => (int) ($_POST['folios'] ?? 0),
                'correo' => trim($_POST['correo'] ?? ''),
                'estado' => 'Archivo Central',
            ]);
            $carpetaId = is_array($rows) && isset($rows[0]['id']) ? $rows[0]['id'] : null;
            if ($carpetaId) {
                registrarHistorial($carpetaId, 'Ingreso', 'Carpeta registrada en archivo central');
            }
            flash('success', 'Carpeta ingresada correctamente.');
        } elseif ($action === 'prestar') {
            $carpetaId = $_POST['carpeta_id'];
            db()->insert('prestamos', [
                'carpeta_id' => $carpetaId,
                'fiscalia_solicitante' => trim($_POST['fiscalia_solicitante']),
                'solicitante' => trim($_POST['solicitante']),
                'motivo' => trim($_POST['motivo'] ?? ''),
                'activo' => true,
            ]);
            db()->update('carpetas', ['id' => $carpetaId], ['estado' => 'Prestada']);
            registrarHistorial($carpetaId, 'Préstamo', 'Prestada a ' . trim($_POST['solicitante']));
            flash('success', 'Préstamo registrado.');
        } elseif ($action === 'devolver') {
            $carpetaId = $_POST['carpeta_id'];
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
            registrarHistorial($carpetaId, 'Devolución', 'Carpeta devuelta al archivo');
            flash('success', 'Devolución registrada.');
        } elseif ($action === 'desarchivar') {
            $carpetaId = $_POST['carpeta_id'];
            db()->update('carpetas', ['id' => $carpetaId], ['estado' => 'Desarchivada']);
            registrarHistorial($carpetaId, 'Desarchivo', trim($_POST['motivo'] ?? 'Desarchivada'));
            flash('success', 'Carpeta desarchivada.');
        }
    } catch (Exception $e) {
        flash('error', $e->getMessage());
    }
    redirect('admin/carpetas.php?tab=' . urlencode($tab));
}

$carpetasParams = [
    'select' => '*,fiscalias(nombre),despachos(nombre)',
    'order' => 'numero.asc',
    'limit' => 500,
];
$carpetas = db()->select('carpetas', $carpetasParams);

if ($filtroNum !== '') {
    $carpetas = array_values(array_filter($carpetas, function ($c) use ($filtroNum) {
        return stripos($c['numero'], $filtroNum) !== false
            || stripos($c['imputado'], $filtroNum) !== false;
    }));
}
if ($filtroEstado !== '') {
    $carpetas = array_values(array_filter($carpetas, function ($c) use ($filtroEstado) {
        return $c['estado'] === $filtroEstado;
    }));
}
if ($filtroFiscalia !== '') {
    $carpetas = array_values(array_filter($carpetas, function ($c) use ($filtroFiscalia) {
        return ($c['fiscalia_id'] ?? '') === $filtroFiscalia;
    }));
}

$prestamosActivos = db()->select('prestamos', [
    'select' => '*,carpetas(numero,imputado,delito)',
    'eq' => ['activo' => 'true'],
    'order' => 'fecha_prestamo.asc',
]);

$prestamosDevueltos = db()->select('prestamos', [
    'select' => '*,carpetas(numero,imputado)',
    'eq' => ['activo' => 'false'],
    'order' => 'fecha_devolucion.desc',
    'limit' => 100,
]);

$historial = db()->select('historial_movimientos', [
    'select' => '*,carpetas(numero),usuarios(nombre)',
    'order' => 'fecha.desc',
    'limit' => 200,
]);

$estados = estadosCarpeta();
$ajaxUrl = rtrim(BASE_URL, '/') . '/admin/ajax_despachos.php';

require __DIR__ . '/../includes/header.php';
?>

<ul class="nav nav-tabs mb-3">
  <li class="nav-item"><a class="nav-link <?= $tab === 'ingreso' ? 'active' : '' ?>" href="?tab=ingreso">Ingreso</a></li>
  <li class="nav-item"><a class="nav-link <?= $tab === 'consulta' ? 'active' : '' ?>" href="?tab=consulta">Consulta</a></li>
  <li class="nav-item"><a class="nav-link <?= $tab === 'prestamos' ? 'active' : '' ?>" href="?tab=prestamos">Préstamos activos</a></li>
  <li class="nav-item"><a class="nav-link <?= $tab === 'devueltas' ? 'active' : '' ?>" href="?tab=devueltas">Devueltas</a></li>
  <li class="nav-item"><a class="nav-link <?= $tab === 'historial' ? 'active' : '' ?>" href="?tab=historial">Historial</a></li>
</ul>

<?php if ($tab === 'ingreso'): ?>
<div class="table-card">
  <h2 class="h6 fw-bold mb-3">Ingreso de carpeta</h2>
  <form method="post" class="row g-3">
    <input type="hidden" name="action" value="ingreso">
    <div class="col-md-3"><label class="form-label">Número</label><input class="form-control" name="numero" required></div>
    <div class="col-md-4"><label class="form-label">Imputado</label><input class="form-control" name="imputado" required></div>
    <div class="col-md-4"><label class="form-label">Agraviado</label><input class="form-control" name="agraviado"></div>
    <div class="col-md-6"><label class="form-label">Delito</label><input class="form-control" name="delito" required></div>
    <div class="col-md-3">
      <label class="form-label">Fiscalía</label>
      <select class="form-select" name="fiscalia_id" id="fiscaliaSelect">
        <option value="">—</option>
        <?php foreach ($fiscalias as $f): ?>
        <option value="<?= e($f['id']) ?>"><?= e($f['nombre']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="col-md-3">
      <label class="form-label">Despacho</label>
      <select class="form-select" name="despacho_id" id="despachoSelect"><option value="">Seleccione fiscalía…</option></select>
    </div>
    <div class="col-md-4"><label class="form-label">Fiscal responsable</label><input class="form-control" name="fiscal_responsable"></div>
    <div class="col-md-2"><label class="form-label">Folios</label><input class="form-control" name="folios" type="number" value="0"></div>
    <div class="col-md-4"><label class="form-label">Correo</label><input class="form-control" name="correo" type="email"></div>
    <div class="col-12"><button class="btn btn-agro">Registrar carpeta</button></div>
  </form>
</div>
<?php endif; ?>

<?php if ($tab === 'consulta'): ?>
<form method="get" class="row g-2 mb-3">
  <input type="hidden" name="tab" value="consulta">
  <div class="col-md-2"><input class="form-control form-control-sm" name="numero" placeholder="Número / imputado" value="<?= e($filtroNum) ?>"></div>
  <div class="col-md-2">
    <select name="estado" class="form-select form-select-sm">
      <option value="">Estado</option>
      <?php foreach ($estados as $e): ?>
      <option value="<?= e($e) ?>" <?= $filtroEstado === $e ? 'selected' : '' ?>><?= e($e) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
  <div class="col-md-3">
    <select name="fiscalia_id" class="form-select form-select-sm">
      <option value="">Fiscalía</option>
      <?php foreach ($fiscalias as $f): ?>
      <option value="<?= e($f['id']) ?>" <?= $filtroFiscalia === $f['id'] ? 'selected' : '' ?>><?= e($f['nombre']) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
  <div class="col-auto"><button class="btn btn-agro btn-sm">Buscar</button></div>
</form>
<div class="table-card">
  <table class="table datatable">
    <thead><tr><th>Número</th><th>Imputado</th><th>Delito</th><th>Fiscalía</th><th>Estado</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($carpetas as $c):
      $diasPrestamo = null;
      if ($c['estado'] === 'Prestada') {
        $p = db()->selectOne('prestamos', ['select' => 'fecha_prestamo', 'eq' => ['carpeta_id' => $c['id'], 'activo' => 'true']]);
        if ($p) {
            $diasPrestamo = diasTranscurridos($p['fecha_prestamo']);
        }
      }
    ?>
      <tr>
        <td><strong><?= e($c['numero']) ?></strong></td>
        <td><?= e($c['imputado']) ?></td>
        <td><?= e($c['delito']) ?></td>
        <td><?= e($c['fiscalias']['nombre'] ?? '—') ?></td>
        <td>
          <span class="badge bg-secondary"><?= e($c['estado']) ?></span>
          <?php if ($diasPrestamo !== null): ?>
          <span class="badge bg-<?= colorPrestamo($diasPrestamo) ?>"><?= $diasPrestamo ?> d</span>
          <?php endif; ?>
        </td>
        <td class="text-nowrap">
          <?php if ($c['estado'] === 'Archivo Central' || $c['estado'] === 'Devuelta'): ?>
          <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#modalPrestar<?= e($c['id']) ?>">Prestar</button>
          <?php endif; ?>
          <?php if ($c['estado'] === 'Prestada'): ?>
          <button class="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#modalDevolver<?= e($c['id']) ?>">Devolver</button>
          <?php endif; ?>
          <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#modalDesarchivar<?= e($c['id']) ?>">Desarchivar</button>
          <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#modalHistorial<?= e($c['id']) ?>">Historial</button>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php
foreach ($carpetas as $c):
  $histCarpeta = array_values(array_filter($historial, function ($h) use ($c) {
      return ($h['carpeta_id'] ?? '') === $c['id'];
  }));
?>
<div class="modal fade" id="modalPrestar<?= e($c['id']) ?>" tabindex="-1">
  <div class="modal-dialog"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="prestar">
    <input type="hidden" name="carpeta_id" value="<?= e($c['id']) ?>">
    <div class="modal-header"><h5 class="modal-title">Prestar <?= e($c['numero']) ?></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <input class="form-control mb-2" name="fiscalia_solicitante" placeholder="Fiscalía solicitante" required>
      <input class="form-control mb-2" name="solicitante" placeholder="Solicitante" required>
      <textarea class="form-control" name="motivo" rows="2" placeholder="Motivo"></textarea>
    </div>
    <div class="modal-footer"><button class="btn btn-agro">Confirmar préstamo</button></div>
  </form></div>
</div>
<div class="modal fade" id="modalDevolver<?= e($c['id']) ?>" tabindex="-1">
  <div class="modal-dialog"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="devolver">
    <input type="hidden" name="carpeta_id" value="<?= e($c['id']) ?>">
    <div class="modal-header"><h5 class="modal-title">Devolver <?= e($c['numero']) ?></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><p>¿Confirmar devolución de la carpeta al archivo?</p></div>
    <div class="modal-footer"><button class="btn btn-success">Devolver</button></div>
  </form></div>
</div>
<div class="modal fade" id="modalDesarchivar<?= e($c['id']) ?>" tabindex="-1">
  <div class="modal-dialog"><form method="post" class="modal-content">
    <input type="hidden" name="action" value="desarchivar">
    <input type="hidden" name="carpeta_id" value="<?= e($c['id']) ?>">
    <div class="modal-header"><h5 class="modal-title">Desarchivar <?= e($c['numero']) ?></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><textarea class="form-control" name="motivo" rows="2" placeholder="Motivo" required></textarea></div>
    <div class="modal-footer"><button class="btn btn-agro">Desarchivar</button></div>
  </form></div>
</div>
<div class="modal fade" id="modalHistorial<?= e($c['id']) ?>" tabindex="-1">
  <div class="modal-dialog modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Historial · <?= e($c['numero']) ?></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <ul class="list-group list-group-flush">
        <?php foreach ($histCarpeta as $h): ?>
        <li class="list-group-item px-0">
          <strong><?= e($h['tipo']) ?></strong> — <?= e($h['descripcion']) ?><br>
          <small class="text-muted"><?= e(substr($h['fecha'], 0, 16)) ?> · <?= e($h['usuarios']['nombre'] ?? 'Sistema') ?></small>
        </li>
        <?php endforeach; ?>
        <?php if (empty($histCarpeta)): ?><li class="text-muted">Sin movimientos</li><?php endif; ?>
      </ul>
    </div>
  </div></div>
</div>
<?php endforeach; ?>
<?php endif; ?>

<?php if ($tab === 'prestamos'): ?>
<div class="table-card">
  <h2 class="h6 fw-bold mb-3">Préstamos activos (<?= count($prestamosActivos) ?>)</h2>
  <table class="table datatable">
    <thead><tr><th>Carpeta</th><th>Solicitante</th><th>Fiscalía</th><th>Días</th><th>Fecha préstamo</th></tr></thead>
    <tbody>
    <?php foreach ($prestamosActivos as $p):
      $dias = diasTranscurridos($p['fecha_prestamo']);
      $car = $p['carpetas'] ?? [];
    ?>
      <tr class="table-<?= colorPrestamo($dias) === 'danger' ? 'danger' : '' ?>">
        <td><?= e($car['numero'] ?? '') ?> · <?= e($car['imputado'] ?? '') ?></td>
        <td><?= e($p['solicitante']) ?></td>
        <td><?= e($p['fiscalia_solicitante']) ?></td>
        <td><span class="badge bg-<?= colorPrestamo($dias) ?>"><?= $dias ?> días</span></td>
        <td><?= e(substr($p['fecha_prestamo'], 0, 10)) ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>

<?php if ($tab === 'devueltas'): ?>
<div class="table-card">
  <table class="table datatable">
    <thead><tr><th>Carpeta</th><th>Solicitante</th><th>Prestado</th><th>Devuelto</th></tr></thead>
    <tbody>
    <?php foreach ($prestamosDevueltos as $p):
      $car = $p['carpetas'] ?? [];
    ?>
      <tr>
        <td><?= e($car['numero'] ?? '') ?></td>
        <td><?= e($p['solicitante']) ?></td>
        <td><?= e(substr($p['fecha_prestamo'], 0, 10)) ?></td>
        <td><?= e(substr($p['fecha_devolucion'] ?? '', 0, 10)) ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>

<?php if ($tab === 'historial'): ?>
<div class="table-card">
  <table class="table datatable">
    <thead><tr><th>Fecha</th><th>Carpeta</th><th>Tipo</th><th>Descripción</th><th>Usuario</th></tr></thead>
    <tbody>
    <?php foreach ($historial as $h): ?>
      <tr>
        <td><?= e(substr($h['fecha'], 0, 16)) ?></td>
        <td><?= e($h['carpetas']['numero'] ?? '') ?></td>
        <td><?= e($h['tipo']) ?></td>
        <td><?= e($h['descripcion']) ?></td>
        <td><?= e($h['usuarios']['nombre'] ?? '—') ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>

<?php
$extraScripts = <<<HTML
<script>
document.getElementById('fiscaliaSelect') && document.getElementById('fiscaliaSelect').addEventListener('change', function () {
  var fid = this.value;
  var sel = document.getElementById('despachoSelect');
  sel.innerHTML = '<option value="">Cargando…</option>';
  if (!fid) { sel.innerHTML = '<option value="">Seleccione fiscalía…</option>'; return; }
  fetch('{$ajaxUrl}?fiscalia_id=' + encodeURIComponent(fid))
    .then(function (r) { return r.json(); })
    .then(function (j) {
      sel.innerHTML = '<option value="">—</option>';
      if (j.ok && j.data) {
        j.data.forEach(function (d) {
          var o = document.createElement('option');
          o.value = d.id;
          o.textContent = d.nombre;
          sel.appendChild(o);
        });
      }
    });
});
</script>
HTML;
require __DIR__ . '/../includes/footer.php';
