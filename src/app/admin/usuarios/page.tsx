import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Dialog, DialogTrigger } from "@/components/DialogForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  createUsuario,
  createUsuarioMovil,
  updateUsuario,
  deleteUsuario
} from "./actions";

export default async function UsuariosPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const user = await getAdminPageUser();
  const { ok } = await searchParams;
  const db = getSupabaseAdmin();

  const [
    { data: usuarios, error: errUsuarios },
    { data: profiles, error: errProfiles }
  ] = await Promise.all([
    db.from("usuarios").select("*").order("created_at", { ascending: false }),
    db
      .from("profiles")
      .select("id,nombre,username,rol,activo,ultimo_acceso,created_at")
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  const okMsg =
    ok === "created"
      ? "Usuario del panel creado."
      : ok === "mobile_created"
        ? "Usuario de la app móvil creado."
        : ok === "updated"
          ? "Usuario actualizado."
          : ok === "deleted"
            ? "Usuario eliminado."
            : null;

  return (
    <AdminShell user={user} title="Usuarios">
      {okMsg ? <div className="alert alert-success">{okMsg}</div> : null}
      {errUsuarios ? (
        <div className="alert alert-warning">Panel: {errUsuarios.message}</div>
      ) : null}
      {errProfiles ? (
        <div className="alert alert-warning">
          App móvil: {errProfiles.message}. ¿Ejecutaste{" "}
          <code>web-admin/sql/schema.sql</code> en Supabase?
        </div>
      ) : null}

      <div className="table-card mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="h6 fw-bold mb-1">Usuarios panel (login web)</h2>
            <p className="text-muted small mb-0">
              Tabla <code>usuarios</code> — solo entran al panel admin en el navegador.
            </p>
          </div>
          <DialogTrigger label="+ Usuario panel" dialogId="modal-create-user" />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>Último acceso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(usuarios ?? []).map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge bg-secondary">{u.rol}</span>
                </td>
                <td>{u.activo ? "✓" : "—"}</td>
                <td>{u.ultimo_acceso ? String(u.ultimo_acceso).slice(0, 16) : "—"}</td>
                <td className="text-nowrap">
                  <DialogTrigger label="Editar" dialogId={`edit-user-${u.id}`} />
                  {u.id !== user.id ? (
                    <form action={deleteUsuario} className="d-inline" style={{ marginLeft: 4 }}>
                      <input type="hidden" name="id" value={u.id} />
                      <ConfirmDeleteButton />
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
            {(usuarios ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  Sin usuarios del panel.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="h6 fw-bold mb-1">Usuarios app móvil</h2>
            <p className="text-muted small mb-0">
              Tabla <code>profiles</code> + Supabase Auth — quienes se registran en la app
              Android.
            </p>
          </div>
          <DialogTrigger label="+ Usuario app" dialogId="modal-create-mobile" />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.username}</td>
                <td>{p.nombre}</td>
                <td>{p.rol ?? "agricultor"}</td>
                <td>{p.activo ? "✓" : "—"}</td>
                <td>{String(p.created_at ?? "").slice(0, 10)}</td>
              </tr>
            ))}
            {(profiles ?? []).length === 0 && !errProfiles ? (
              <tr>
                <td colSpan={5} className="text-muted">
                  Nadie registrado en la app aún. Usa «+ Usuario app» o registro desde el
                  celular.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog id="modal-create-user" title="Nuevo usuario panel (web)">
        <form action={createUsuario}>
          <div className="modal-body">
            <input className="form-control mb-2" name="nombre" placeholder="Nombre" required />
            <input
              className="form-control mb-2"
              name="email"
              type="email"
              placeholder="Email"
              required
            />
            <input
              className="form-control mb-2"
              name="password"
              type="password"
              placeholder="Contraseña"
              required
            />
            <select className="form-select mb-2" name="rol" defaultValue="operador">
              <option value="admin">admin</option>
              <option value="operador">operador</option>
            </select>
            <label className="form-check">
              <input type="checkbox" name="activo" defaultChecked /> Activo
            </label>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-agro">
              Crear
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog id="modal-create-mobile" title="Nuevo usuario app móvil">
        <form action={createUsuarioMovil}>
          <div className="modal-body">
            <input className="form-control mb-2" name="nombre" placeholder="Nombre completo" required />
            <input
              className="form-control mb-2"
              name="username"
              placeholder="Username (login app)"
              required
            />
            <input
              className="form-control mb-2"
              name="email"
              type="email"
              placeholder="Email"
              required
            />
            <input
              className="form-control mb-2"
              name="password"
              type="password"
              placeholder="Contraseña"
              required
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-agro">
              Crear en app
            </button>
          </div>
        </form>
      </Dialog>

      {(usuarios ?? []).map((u) => (
        <Dialog key={u.id} id={`edit-user-${u.id}`} title="Editar usuario panel">
          <form action={updateUsuario}>
            <input type="hidden" name="id" value={u.id} />
            <div className="modal-body">
              <input className="form-control mb-2" name="nombre" defaultValue={u.nombre} required />
              <input
                className="form-control mb-2"
                name="email"
                type="email"
                defaultValue={u.email}
                required
              />
              <select className="form-select mb-2" name="rol" defaultValue={u.rol}>
                {["admin", "operador", "agricultor"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                className="form-control mb-2"
                name="password"
                type="password"
                placeholder="Nueva contraseña (opcional)"
              />
              <label className="form-check">
                <input type="checkbox" name="activo" defaultChecked={u.activo} /> Activo
              </label>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-agro">
                Guardar
              </button>
            </div>
          </form>
        </Dialog>
      ))}
    </AdminShell>
  );
}
