<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/functions.php';

if (isLoggedIn()) {
    redirect('dashboard.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    try {
        $user = db()->selectOne('usuarios', [
            'select' => 'id,nombre,email,password_hash,rol,activo',
            'eq' => ['email' => $email],
        ]);

        if (!$user || !$user['activo']) {
            $error = 'Credenciales incorrectas o usuario inactivo.';
        } elseif (!password_verify($password, $user['password_hash'])) {
            $error = 'Credenciales incorrectas.';
        } elseif ($user['rol'] !== 'admin') {
            $error = 'Solo administradores pueden acceder al panel.';
        } else {
            $_SESSION['usuario_id'] = $user['id'];
            $_SESSION['nombre'] = $user['nombre'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['rol'] = $user['rol'];

            db()->update('usuarios', ['id' => $user['id']], [
                'ultimo_acceso' => date('c'),
            ]);

            redirect('dashboard.php');
        }
    } catch (Exception $e) {
        $error = 'Error de conexión: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login · <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="<?= e(BASE_URL) ?>/assets/css/app.css" rel="stylesheet">
</head>
<body class="login-page">
  <div class="login-card card shadow-lg border-0">
    <div class="card-body p-5">
      <div class="text-center mb-4">
        <span class="login-logo">🌿</span>
        <h1 class="h4 fw-bold text-agro">AGRO ADMIN</h1>
        <p class="text-muted small">Panel web · Supabase</p>
      </div>
      <?php if ($error): ?>
        <div class="alert alert-danger"><?= e($error) ?></div>
      <?php endif; ?>
      <form method="post">
        <div class="mb-3">
          <label class="form-label">Correo</label>
          <input type="email" name="email" class="form-control" required value="<?= e($_POST['email'] ?? '') ?>">
        </div>
        <div class="mb-4">
          <label class="form-label">Contraseña</label>
          <input type="password" name="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-agro w-100">Entrar</button>
      </form>
    </div>
  </div>
</body>
</html>
