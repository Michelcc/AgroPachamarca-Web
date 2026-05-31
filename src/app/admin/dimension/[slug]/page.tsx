import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { EmptyTable } from "@/components/EmptyTable";
import { getAdminPageUser } from "@/lib/admin-page";
import { fetchIndicadoresOperacionales } from "@/lib/admin-queries";
import {
  getDimensionById,
  MODULOS_POR_DIMENSION,
  slugToDimensionId
} from "@/lib/dimensionModulos";
import { VARIABLE_DEPENDIENTE } from "@/lib/operacionalizacion";

function formatValor(r: {
  valor_numerico: number | null;
  valor_texto: string | null;
  unidad: string | null;
}) {
  if (r.valor_numerico != null) {
    return `${r.valor_numerico}${r.unidad ? ` ${r.unidad}` : ""}`;
  }
  return r.valor_texto ?? "—";
}

export default async function DimensionPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dimensionId = slugToDimensionId(slug);
  if (!dimensionId) notFound();

  const dimension = getDimensionById(dimensionId);
  if (!dimension) notFound();

  const user = await getAdminPageUser();
  const modulos = MODULOS_POR_DIMENSION[dimensionId] ?? [];
  const { data: registros, error: err } = await fetchIndicadoresOperacionales();

  const idsDim = new Set(dimension.indicadores.map((i) => i.id));
  const registrosDim = registros.filter((r) => idsDim.has(r.indicador_id));
  const indicadoresConRegistro = new Set(registrosDim.map((r) => r.indicador_id));
  const cobertura = dimension.indicadores.length
    ? Math.round((indicadoresConRegistro.size / dimension.indicadores.length) * 100)
    : 0;

  return (
    <AdminShell
      user={user}
      title={dimension.nombre}
      subtitle={`${VARIABLE_DEPENDIENTE} · dimensión de operacionalización`}
    >
      {err ? (
        <div className="alert alert-danger">
          Error al cargar indicadores: {err}. Ejecuta <code>sql/schema-operacionalizacion.sql</code>.
        </div>
      ) : null}

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Indicadores</div>
            <div className="stat-value">{dimension.indicadores.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Con registro</div>
            <div className="stat-value">{indicadoresConRegistro.size}</div>
            <div className="stat-trend">{cobertura}% cobertura</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="stat-label">Registros totales</div>
            <div className="stat-value">{registrosDim.length}</div>
          </div>
        </div>
      </div>

      {modulos.length > 0 ? (
        <>
          <div className="page-toolbar">
            <div>
              <h2>Módulos y tablas</h2>
              <p>Herramientas técnicas dentro de {dimension.nombre}</p>
            </div>
          </div>
          <div className="row g-3 mb-3">
            {modulos.map((mod) => (
              <div className="col-md-4" key={mod.id}>
                <Link href={mod.href} className="card stat-card p-3 dimension-mod-card">
                  <div className="stat-label">{mod.emoji} {mod.label}</div>
                  <p className="small text-muted mb-0">{mod.descripcion}</p>
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="page-toolbar">
        <div>
          <h2>Indicadores</h2>
          <p>Matriz de operacionalización — {dimension.nombre}</p>
        </div>
      </div>

      <div className="table-card mb-3">
        <table className="table table-hover-lite">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Instrumento</th>
              <th>Unidad</th>
              <th>Fuente en app</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {dimension.indicadores.map((ind) => {
              const ok = indicadoresConRegistro.has(ind.id);
              return (
                <tr key={ind.id}>
                  <td>
                    <strong>{ind.nombre}</strong>
                  </td>
                  <td>
                    <span className="badge badge-cat">{ind.instrumento}</span>
                  </td>
                  <td className="small">{ind.unidad ?? "—"}</td>
                  <td className="small table-excerpt">{ind.fuenteApp ?? "—"}</td>
                  <td>
                    {ok ? (
                      <span className="badge bg-success">Con datos</span>
                    ) : (
                      <span className="badge bg-secondary">Pendiente</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="page-toolbar">
        <div>
          <h2>Registros desde app móvil</h2>
          <p>Filtrado por dimensión {dimension.nombre}</p>
        </div>
      </div>

      <div className="table-card">
        {registrosDim.length === 0 ? (
          <EmptyTable
            emoji="📊"
            title="Sin registros en esta dimensión"
            message="Los productores registran indicadores en la app → pestaña Dimensiones."
          />
        ) : (
          <table className="table table-hover-lite">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Instrumento</th>
                <th>Valor</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {registrosDim.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.indicador_label}</strong>
                  </td>
                  <td>
                    <span className="badge badge-cat">{r.instrumento}</span>
                  </td>
                  <td>{formatValor(r)}</td>
                  <td className="small">
                    {r.profile?.nombre ?? r.profile?.username ?? r.user_id.slice(0, 8)}
                  </td>
                  <td className="small">{String(r.created_at).slice(0, 16).replace("T", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
