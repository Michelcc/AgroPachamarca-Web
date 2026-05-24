import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Dialog, DialogTrigger } from "@/components/DialogForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createUsuario, updateUsuario, deleteUsuario } from "./actions";

export default async function UsuariosPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const user = await getAdminPageUser();
  const { ok } = await searchParams;
  const db = getSupabaseAdmin();

  const [{ data: usuarios }, { data: profiles }] = await Promise.all([
    db.from("usuarios").select("*").order("created_at", { ascending: false }),
    db
      .from("profiles")
      .select("id,nombre,username,rol,activo,ultimo_acceso,created_at")
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  return (
    <AdminShell user={user} title="Usuarios">
      {ok ? <div className="alert alert-success">Operación realizada.</div> : null}
      <div className="d-flex justify-content-between mb-3">
        <p className="text-muted mb-0">
          Usuarios del panel web y perfiles de la app móvil (Supabase Auth)
        </p>
        <DialogTrigger label="+ Nuevo usuario panel" dialogId="modal-create-user" />
      </div>

      <div className="table-card mb-4">
        <h2 className="h6 fw-bold">Usuarios panel (login web)</h2>
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
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <h2 className="h6 fw-bold">Perfiles app móvil (profiles)</h2>
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
          </tbody>
        </table>
      </div>

      <Dialog id="modal-create-user" title="Nuevo usuario">
        <form action={createUsuario}>
          <div className="modal-body">
            <input className="form-control mb-2" name="nombre" placeholder="Nombre" required />
            <input className="form-control mb-2" name="email" type="email" placeholder="Email" required />
            <input className="form-control mb-2" name="password" type="password" placeholder="Contraseña" required />
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

      {(usuarios ?? []).map((u) => (
        <Dialog key={u.id} id={`edit-user-${u.id}`} title="Editar usuario">
          <form action={updateUsuario}>
            <input type="hidden" name="id" value={u.id} />
            <div className="modal-body">
              <input className="form-control mb-2" name="nombre" defaultValue={u.nombre} required />
              <input className="form-control mb-2" name="email" type="email" defaultValue={u.email} required />
              <select className="form-select mb-2" name="rol" defaultValue={u.rol}>
                {["admin", "operador", "agricultor"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input className="form-control mb-2" name="password" type="password" placeholder="Nueva contraseña (opcional)" />
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
