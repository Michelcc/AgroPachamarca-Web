document.getElementById('sidebarToggle')?.addEventListener('click', function () {
  document.getElementById('sidebar')?.classList.toggle('collapsed');
  document.getElementById('sidebar')?.classList.toggle('show');
});

document.querySelectorAll('.datatable').forEach(function (el) {
  if (typeof $ !== 'undefined' && $.fn.DataTable) {
    $(el).DataTable({ language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' } });
  }
});

function showToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toastContainer');
  if (!container) return;
  var id = 'toast-' + Date.now();
  container.insertAdjacentHTML('beforeend',
    '<div id="' + id + '" class="toast align-items-center text-bg-' + type + ' border-0" role="alert">' +
    '<div class="d-flex"><div class="toast-body">' + message + '</div>' +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>'
  );
  var t = document.getElementById(id);
  if (t && bootstrap.Toast) new bootstrap.Toast(t).show();
}
