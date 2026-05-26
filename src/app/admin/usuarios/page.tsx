import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import {
  DialogTrigger,
  EnterpriseDialog,
  ModalActions,
  ModalBody,
  ModalFooter
} from "@/components/EnterpriseDialog";
import { UsuarioMovilFormFields, UsuarioPanelFormFields } from "@/components/forms/UsuarioForm";
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
    <AdminShell
      user={user}
      title="Gestión de usuarios"
      subtitle="Panel web y perfiles de la app móvil."
    >
      {okMsg ? <div className="alert alert-success">{okMsg}</div> : null}
      {errUsuarios ? (
        <div className="alert alert-warning">Panel: {errUsuarios.message}</div>
      ) : null}
      {errProfiles ? (
        <div className="alert alert-warning">
          App móvil: {errProfiles.message}. ¿Ejecutaste sql/schema.sql en Supabase?
        </div>
      ) : null}

      <div className="table-card mb-4">
        <div className="page-toolbar" style={{ marginBottom: 0, boxShadow: "none", border: "none", padding: "0 0 1rem" }}>
          <div>
            <h2>Usuarios panel (login web)</h2>
            <p>Administradores con permisos de gestión</p>
          </div>
          <DialogTrigger label="+ Nuevo administrador" dialogId="modal-create-user" className="btn btn-agro" />
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
                  <DialogTrigger label="Editar" dialogId={`edit-user-${u.id}`} className="btn btn-sm btn-outline-primary" />
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
        <div className="page-toolbar" style={{ marginBottom: 0, boxShadow: "none", border: "none", padding: "0 0 1rem" }}>
          <div>
            <h2>Usuarios app móvil</h2>
            <p>Personal de campo registrado en la app</p>
          </div>
          <DialogTrigger label="+ Usuario app" dialogId="modal-create-mobile" className="btn btn-agro btn-sm" />
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
                  Nadie registrado en la app aún.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <EnterpriseDialog
        id="modal-create-user"
        title="Crear Nuevo Usuario"
        subtitle="Configura el perfil y los permisos del sistema."
      >
        <form action={createUsuario}>
          <ModalBody>
            <UsuarioPanelFormFields />
          </ModalBody>
          <ModalFooter>
            <ModalActions dialogId="modal-create-user" submitLabel="Guardar Usuario" />
          </ModalFooter>
        </form>
      </EnterpriseDialog>

      <EnterpriseDialog
        id="modal-create-mobile"
        title="Nuevo usuario app móvil"
        subtitle="Crea acceso para personal de campo en Android."
      >
        <form action={createUsuarioMovil}>
          <ModalBody>
            <UsuarioMovilFormFields />
          </ModalBody>
          <ModalFooter>
            <ModalActions dialogId="modal-create-mobile" submitLabel="Crear en app" />
          </ModalFooter>
        </form>
      </EnterpriseDialog>

      {(usuarios ?? []).map((u) => (
        <EnterpriseDialog
          key={u.id}
          id={`edit-user-${u.id}`}
          title="Editar usuario"
          subtitle={u.email}
        >
          <form action={updateUsuario}>
            <input type="hidden" name="id" value={u.id} />
            <ModalBody>
              <UsuarioPanelFormFields
                isEdit
                defaultValues={{
                  nombre: u.nombre,
                  email: u.email,
                  rol: u.rol,
                  activo: u.activo
                }}
              />
            </ModalBody>
            <ModalFooter>
              <ModalActions dialogId={`edit-user-${u.id}`} submitLabel="Guardar cambios" />
            </ModalFooter>
          </form>
        </EnterpriseDialog>
      ))}
    </AdminShell>
  );
}
