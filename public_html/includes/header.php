<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/functions.php';

$pageTitle = $pageTitle ?? 'Panel';
$activeMenu = $activeMenu ?? '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?> · <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.datatables.net/1.13.8/css/dataTables.bootstrap5.min.css" rel="stylesheet">
  <link href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" rel="stylesheet">
  <link href="<?= e(BASE_URL) ?>/assets/css/app.css" rel="stylesheet">
</head>
<body class="admin-body">
<div class="d-flex" id="wrapper">
  <nav id="sidebar" class="sidebar bg-agro text-white">
    <div class="sidebar-header p-3 border-bottom border-success">
      <span class="fs-4">🌿 Agro</span>
      <small class="d-block opacity-75">Admin Panel</small>
    </div>
    <ul class="nav flex-column p-2">
      <?php
      $menu = [
        ['/dashboard.php', 'dashboard.php', 'Dashboard', '📊'],
        ['/admin/usuarios.php', 'usuarios.php', 'Usuarios', '👥'],
        ['/admin/tablas.php', 'tablas.php', 'Tablas de datos', '📋'],
        ['/admin/productos.php', 'productos.php', 'Productos', '📦'],
        ['/admin/recomendaciones.php', 'recomendaciones.php', 'Recomendaciones', '🌾'],
        ['/admin/alertas.php', 'alertas.php', 'Alertas clima', '☁️'],
        ['/admin/diagnosticos.php', 'diagnosticos.php', 'Diagnósticos IA', '🔬'],
        ['/admin/registros_gps.php', 'registros_gps.php', 'Registros GPS', '📍'],
        ['/admin/carpetas.php', 'carpetas.php', 'Carpetas fiscales', '📁'],
      ];
      foreach ($menu as $info):
        $active = ($activeMenu === $info[1]) ? 'active' : '';
        $href = rtrim(BASE_URL, '/') . $info[0];
      ?>
      <li class="nav-item">
        <a class="nav-link text-white <?= $active ?>" href="<?= e($href) ?>">
          <?= $info[3] ?> <?= e($info[2]) ?>
        </a>
      </li>
      <?php endforeach; ?>
    </ul>
    <div class="sidebar-footer p-3 mt-auto border-top border-success small">
      <div><?= e($_SESSION['nombre'] ?? '') ?></div>
      <div class="opacity-75"><?= e($_SESSION['rol'] ?? '') ?></div>
      <a href="<?= e(BASE_URL) ?>/logout.php" class="text-white-50">Cerrar sesión</a>
    </div>
  </nav>
  <div id="page-content" class="flex-grow-1">
    <header class="topbar d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom">
      <button class="btn btn-outline-secondary btn-sm" id="sidebarToggle">☰</button>
      <h1 class="h5 mb-0 fw-bold text-agro"><?= e($pageTitle) ?></h1>
      <span class="badge bg-success"><?= e(APP_VERSION) ?></span>
    </header>
    <main class="p-4 surface-bg">
      <?php $flash = getFlash(); if ($flash): ?>
        <div class="alert alert-<?= $flash['type'] === 'error' ? 'danger' : 'success' ?> alert-dismissible fade show">
          <?= e($flash['message']) ?>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      <?php endif; ?>
