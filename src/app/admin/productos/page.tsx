import { AdminShell } from "@/components/AdminShell";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { EmptyTable } from "@/components/EmptyTable";
import {
  DialogTrigger,
  EnterpriseDialog,
  ModalActions,
  ModalBody,
  ModalFooter
} from "@/components/EnterpriseDialog";
import { PageFlash } from "@/components/PageFlash";
import { ProductThumb } from "@/components/ProductThumb";
import { ProductFormFields } from "@/components/forms/ProductForm";
import { getAdminPageUser } from "@/lib/admin-page";
import { fetchProductos, fetchProfiles } from "@/lib/admin-queries";
import { createProducto, updateProducto, deleteProducto } from "./actions";

export default async function ProductosPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await getAdminPageUser();
  const sp = await searchParams;
  const [{ data: productos, error: errProductos }, { data: profiles, error: errProfiles }] =
    await Promise.all([fetchProductos(), fetchProfiles()]);

  const profileOpts = profiles.map((pr) => ({
    id: pr.id,
    nombre: pr.nombre,
    username: pr.username
  }));

  const activos = productos.filter((p) => p.disponible).length;
  const stockBajo = productos.filter((p) => Number(p.stock) <= 15).length;

  return (
    <AdminShell
      user={user}
      title="Gestión de productos"
      subtitle="Catálogo en tabla productos (Supabase) — visible en la app móvil."
    >
      <PageFlash ok={sp.ok} error={sp.error} />

      {errProductos ? (
        <div className="alert alert-danger">
          No se pudieron cargar productos: {errProductos}. Verifica que exista la tabla{" "}
          <code>productos</code> en Supabase.
        </div>
      ) : null}
      {errProfiles ? (
        <div className="alert alert-warning">
          Perfiles app: {errProfiles}. Ejecuta <code>sql/schema.sql</code> y{" "}
          <code>sync-profiles-from-auth.sql</code>.
        </div>
      ) : null}

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Total productos</div>
            <div className="stat-value">{productos.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Disponibles</div>
            <div className="stat-value">{activos}</div>
            <div className="stat-trend">
              {productos.length
                ? `${((activos / productos.length) * 100).toFixed(0)}% del catálogo`
                : "—"}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Stock bajo</div>
            <div className="stat-value">{stockBajo}</div>
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <div>
          <h2>Inventario general</h2>
          <p>Datos desde <code>public.productos</code></p>
        </div>
        <DialogTrigger label="+ Nuevo producto" dialogId="modal-create-prod" className="btn btn-agro" />
      </div>

      <div className="table-card">
        {productos.length === 0 ? (
          <EmptyTable
            emoji="📦"
            title="Sin productos en la base de datos"
            message="Crea el primero con «+ Nuevo producto». Si ya guardaste y no aparece, revisa SUPABASE_SERVICE_ROLE_KEY en Vercel."
          />
        ) : (
          <table className="table table-hover-lite">
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
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <ProductThumb url={p.imagen_url} alt={p.nombre} />
                  </td>
                  <td>
                    <strong>{p.nombre}</strong>
                    {p.destacado ? (
                      <span className="badge badge-featured">Destacado</span>
                    ) : null}
                  </td>
                  <td>
                    <span className="badge badge-cat">{p.categoria}</span>
                  </td>
                  <td>
                    S/ {Number(p.precio).toFixed(2)}{" "}
                    <span className="text-muted small">/ {p.unidad}</span>
                  </td>
                  <td>
                    {Number(p.stock) <= 15 ? (
                      <span className="badge bg-danger">{p.stock} uds</span>
                    ) : (
                      `${p.stock} uds`
                    )}
                  </td>
                  <td className="small">
                    {p.profile?.nombre ?? p.profile?.username ?? (
                      <span className="text-muted">{String(p.user_id).slice(0, 8)}…</span>
                    )}
                  </td>
                  <td>
                    {p.disponible ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-secondary">Inactivo</span>
                    )}
                  </td>
                  <td className="text-nowrap">
                    <DialogTrigger
                      label="Editar"
                      dialogId={`edit-prod-${p.id}`}
                      className="btn btn-sm btn-outline-primary"
                    />
                    <form action={deleteProducto} className="d-inline" style={{ marginLeft: 4 }}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmDeleteButton />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

      {productos.map((p) => (
        <EnterpriseDialog
          key={p.id}
          id={`edit-prod-${p.id}`}
          title="Editar producto"
          subtitle={p.nombre}
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
