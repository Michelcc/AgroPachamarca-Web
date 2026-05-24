<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdmin();

$pageTitle = 'Registros GPS';
$activeMenu = 'registros_gps.php';

$filtroUser = $_GET['user_id'] ?? '';
$filtroFecha = $_GET['fecha'] ?? '';

$profiles = db()->select('profiles', ['select' => 'id,nombre,username', 'order' => 'nombre.asc', 'limit' => 200]);

$params = [
    'select' => '*,profiles(nombre,username)',
    'order' => 'created_at.desc',
    'limit' => 300,
];
if ($filtroUser !== '') {
    $params['eq'] = ['user_id' => $filtroUser];
}
if ($filtroFecha !== '') {
    $params['gte'] = ['created_at' => $filtroFecha . 'T00:00:00'];
    $params['lte'] = ['created_at' => $filtroFecha . 'T23:59:59'];
}

$registros = [];
try {
    $registros = db()->select('registros_gps', $params);
} catch (Exception $e) {
    $errorGps = $e->getMessage();
}

$campo = [];
try {
    $campo = db()->rpc('list_registros_campo_gps', ['p_limit' => 150]);
    if (!is_array($campo)) {
        $campo = [];
    }
} catch (Exception $e) {
    $errorCampo = $e->getMessage();
}

if ($filtroUser !== '') {
    $campo = array_values(array_filter($campo, function ($r) use ($filtroUser) {
        return ($r['user_id'] ?? '') === $filtroUser;
    }));
}
if ($filtroFecha !== '') {
    $campo = array_values(array_filter($campo, function ($r) use ($filtroFecha) {
        return strpos($r['created_at'] ?? '', $filtroFecha) === 0;
    }));
}

$markers = [];
foreach ($registros as $r) {
    if (!isset($r['lat'], $r['lng'])) {
        continue;
    }
    $prof = $r['profiles'] ?? [];
    $markers[] = [
        'lat' => (float) $r['lat'],
        'lng' => (float) $r['lng'],
        'titulo' => $r['titulo'] ?? 'Registro API',
        'origen' => 'registros_gps',
        'usuario' => $prof['nombre'] ?? $prof['username'] ?? '',
        'fecha' => substr($r['created_at'], 0, 16),
    ];
}
foreach ($campo as $c) {
    if (!isset($c['lat'], $c['lng'])) {
        continue;
    }
    $markers[] = [
        'lat' => (float) $c['lat'],
        'lng' => (float) $c['lng'],
        'titulo' => $c['titulo'] ?? ($c['tabla_origen'] ?? 'Campo'),
        'origen' => $c['tabla_origen'] ?? 'campo',
        'usuario' => substr($c['user_id'] ?? '', 0, 8),
        'fecha' => substr($c['created_at'] ?? '', 0, 16),
    ];
}

$markersJson = json_encode($markers, JSON_UNESCAPED_UNICODE);

require __DIR__ . '/../includes/header.php';
?>

<?php if (!empty($errorGps)): ?>
<div class="alert alert-warning">Tabla registros_gps: <?= e($errorGps) ?></div>
<?php endif; ?>
<?php if (!empty($errorCampo)): ?>
<div class="alert alert-info small">RPC list_registros_campo_gps: <?= e($errorCampo) ?></div>
<?php endif; ?>

<form method="get" class="row g-2 mb-3 align-items-end">
  <div class="col-md-4">
    <label class="form-label small">Usuario</label>
    <select name="user_id" class="form-select form-select-sm">
      <option value="">Todos</option>
      <?php foreach ($profiles as $pr): ?>
      <option value="<?= e($pr['id']) ?>" <?= $filtroUser === $pr['id'] ? 'selected' : '' ?>><?= e($pr['nombre']) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
  <div class="col-auto">
    <label class="form-label small">Fecha</label>
    <input type="date" name="fecha" class="form-control form-control-sm" value="<?= e($filtroFecha) ?>">
  </div>
  <div class="col-auto">
    <button class="btn btn-agro btn-sm">Filtrar</button>
    <a href="registros_gps.php" class="btn btn-outline-secondary btn-sm">Limpiar</a>
  </div>
  <div class="col-auto ms-auto">
    <span class="badge bg-success"><?= count($markers) ?> marcadores</span>
  </div>
</form>

<div id="map" class="mb-4"></div>

<div class="table-card">
  <h2 class="h6 fw-bold mb-2">Registros API (registros_gps)</h2>
  <table class="table datatable table-sm">
    <thead><tr><th>Título</th><th>Lat/Lng</th><th>Altitud</th><th>Usuario</th><th>Fecha</th></tr></thead>
    <tbody>
    <?php foreach ($registros as $r):
      $prof = $r['profiles'] ?? [];
    ?>
      <tr>
        <td><?= e($r['titulo'] ?? '—') ?></td>
        <td><?= e(round($r['lat'], 5)) ?>, <?= e(round($r['lng'], 5)) ?></td>
        <td><?= e($r['altitud_msnm'] ?? '—') ?></td>
        <td><?= e($prof['nombre'] ?? '—') ?></td>
        <td><?= e(substr($r['created_at'], 0, 16)) ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php
$extraScripts = <<<HTML
<script>
(function () {
  var markers = {$markersJson};
  var map = L.map('map').setView([-13.5, -72], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  var bounds = [];
  markers.forEach(function (m) {
    var popup = '<strong>' + (m.titulo || '') + '</strong><br>' +
      'Origen: ' + m.origen + '<br>' +
      (m.usuario ? 'Usuario: ' + m.usuario + '<br>' : '') +
      (m.fecha || '');
    var mk = L.marker([m.lat, m.lng]).addTo(map).bindPopup(popup);
    bounds.push(mk.getLatLng());
  });
  if (bounds.length) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 14 });
  }
})();
</script>
HTML;
require __DIR__ . '/../includes/footer.php';
