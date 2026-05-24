<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/functions.php';
if (isLoggedIn()) {
    redirect('dashboard.php');
}
redirect('login.php');
