import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import {
  DialogTrigger,
  EnterpriseDialog,
  ModalActions,
  ModalBody,
  ModalFooter
} from "@/components/EnterpriseDialog";
import { ProductFormFields } from "@/components/forms/ProductForm";
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

  const profileOpts = (profiles ?? []).map((pr) => ({
    id: pr.id,
    nombre: pr.nombre,
    username: pr.username
  }));

  return (
    <AdminShell
      user={user}
      title="Gestión de productos"
      subtitle="Catálogo e inventario agrícola con imágenes."
    >
      <div className="page-toolbar">
        <div>
          <h2>Inventario general</h2>
          <p>{(productos ?? []).length} productos en el catálogo</p>
        </div>
        <DialogTrigger label="+ Nuevo producto" dialogId="modal-create-prod" className="btn btn-agro" />
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
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
                      <img src={p.imagen_url} alt="" className="product-thumb" />
                    ) : (
                      <div className="product-thumb-empty">📦</div>
                    )}
                  </td>
                  <td>
                    <strong>{p.nombre}</strong>
                    {p.destacado ? (
                      <span className="badge bg-warning" style={{ marginLeft: 6 }}>
                        Destacado
                      </span>
                    ) : null}
                  </td>
                  <td>{p.categoria}</td>
                  <td>
                    S/ {Number(p.precio).toFixed(2)} <span className="text-muted small">/ {p.unidad}</span>
                  </td>
                  <td>
                    {Number(p.stock) <= 15 ? (
                      <span className="badge bg-danger">{p.stock} uds</span>
                    ) : (
                      `${p.stock} uds`
                    )}
                  </td>
                  <td>{prof?.nombre ?? prof?.username ?? String(p.user_id).slice(0, 8)}</td>
                  <td>
                    {p.disponible ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-secondary">Inactivo</span>
                    )}
                  </td>
                  <td className="text-nowrap">
                    <DialogTrigger label="Editar" dialogId={`edit-prod-${p.id}`} className="btn btn-sm btn-outline-primary" />
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

      <EnterpriseDialog
        id="modal-create-prod"
        title="Crear Nuevo Producto"
        subtitle="Completa la información técnica para dar de alta un producto en el sistema."
        size="lg"
      >
        <form action={createProducto}>
          <ModalBody>
            <ProductFormFields profiles={profileOpts} />
          </ModalBody>
          <ModalFooter>
            <ModalActions dialogId="modal-create-prod" submitLabel="Guardar Producto" />
          </ModalFooter>
        </form>
      </EnterpriseDialog>

      {(productos ?? []).map((p) => (
        <EnterpriseDialog
          key={p.id}
          id={`edit-prod-${p.id}`}
          title="Editar producto"
          subtitle={String(p.nombre)}
          size="lg"
        >
          <form action={updateProducto}>
            <input type="hidden" name="id" value={p.id} />
            <ModalBody>
              <ProductFormFields
                profiles={profileOpts}
                showUserSelect={false}
                defaultValues={{
                  nombre: p.nombre,
                  categoria: p.categoria,
                  precio: Number(p.precio),
                  unidad: p.unidad,
                  stock: Number(p.stock),
                  imagen_url: p.imagen_url,
                  disponible: p.disponible,
                  destacado: p.destacado
                }}
              />
            </ModalBody>
            <ModalFooter>
              <ModalActions dialogId={`edit-prod-${p.id}`} submitLabel="Guardar cambios" />
            </ModalFooter>
          </form>
        </EnterpriseDialog>
      ))}
    </AdminShell>
  );
}
