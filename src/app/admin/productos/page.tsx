import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { Dialog, DialogTrigger } from "@/components/DialogForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createProducto, updateProducto, deleteProducto } from "./actions";

export default async function ProductosPage() {
  const user = await getAdminPageUser();
  const db = getSupabaseAdmin();
  const [{ data: productos }, { data: profiles }] = await Promise.all([
    db
      .from("productos")
      .select("*,profiles(nombre,username)")
      .order("created_at", { ascending: false })
      .limit(500),
    db.from("profiles").select("id,nombre,username").order("nombre").limit(200)
  ]);

  return (
    <AdminShell
      user={user}
      title="Gestión de productos"
      subtitle="Catálogo e inventario agrícola."
    >
      <div className="d-flex justify-content-between mb-3">
        <p className="text-muted mb-0">Todos los productos de la app móvil</p>
        <DialogTrigger label="+ Nuevo producto" dialogId="modal-create-prod" />
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(productos ?? []).map((p) => {
              const prof = p.profiles as { nombre?: string; username?: string } | null;
              return (
                <tr key={p.id}>
                  <td>
                    {p.imagen_url ? (
                      <img
                        src={p.imagen_url}
                        alt=""
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {p.nombre}
                    {p.destacado ? " ⭐" : ""}
                  </td>
                  <td>{p.categoria}</td>
                  <td>
                    S/ {Number(p.precio).toFixed(2)} / {p.unidad}
                  </td>
                  <td>{p.stock}</td>
                  <td>{prof?.nombre ?? prof?.username ?? String(p.user_id).slice(0, 8)}</td>
                  <td>
                    {p.disponible ? (
                      <span className="badge bg-success">Disponible</span>
                    ) : (
                      <span className="badge bg-secondary">No</span>
                    )}
                  </td>
                  <td className="text-nowrap">
                    <DialogTrigger label="Editar" dialogId={`edit-prod-${p.id}`} />
                    <form action={deleteProducto} className="d-inline" style={{ marginLeft: 4 }}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmDeleteButton />
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog id="modal-create-prod" title="Nuevo producto">
        <form action={createProducto}>
          <div className="modal-body">
            <select className="form-select mb-2" name="user_id" required>
              <option value="">Usuario app…</option>
              {(profiles ?? []).map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.nombre ?? pr.username}
                </option>
              ))}
            </select>
            <input className="form-control mb-2" name="nombre" placeholder="Nombre" required />
            <input className="form-control mb-2" name="categoria" placeholder="Categoría" required />
            <div className="row mb-2">
              <div className="col">
                <input className="form-control" name="precio" type="number" step="0.01" defaultValue={0} />
              </div>
              <div className="col">
                <input className="form-control" name="unidad" defaultValue="kg" />
              </div>
            </div>
            <input className="form-control mb-2" name="stock" type="number" step="0.01" defaultValue={0} />
            <input className="form-control mb-2" name="imagen_url" placeholder="URL imagen" />
            <label className="form-check">
              <input type="checkbox" name="disponible" defaultChecked /> Disponible
            </label>
            <label className="form-check">
              <input type="checkbox" name="destacado" /> Destacado
            </label>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-agro">
              Crear
            </button>
          </div>
        </form>
      </Dialog>

      {(productos ?? []).map((p) => (
        <Dialog key={p.id} id={`edit-prod-${p.id}`} title="Editar producto">
          <form action={updateProducto}>
            <input type="hidden" name="id" value={p.id} />
            <div className="modal-body">
              <input className="form-control mb-2" name="nombre" defaultValue={p.nombre} required />
              <input className="form-control mb-2" name="categoria" defaultValue={p.categoria} required />
              <div className="row mb-2">
                <div className="col">
                  <input className="form-control" name="precio" type="number" step="0.01" defaultValue={p.precio} />
                </div>
                <div className="col">
                  <input className="form-control" name="unidad" defaultValue={p.unidad} />
                </div>
              </div>
              <input className="form-control mb-2" name="stock" type="number" step="0.01" defaultValue={p.stock} />
              <input className="form-control mb-2" name="imagen_url" defaultValue={p.imagen_url ?? ""} placeholder="URL imagen" />
              <label className="form-check">
                <input type="checkbox" name="disponible" defaultChecked={p.disponible} /> Disponible
              </label>
              <label className="form-check">
                <input type="checkbox" name="destacado" defaultChecked={p.destacado} /> Destacado
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
