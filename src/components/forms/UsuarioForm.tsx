import { FormField } from "./FormField";
import { PasswordField } from "./PasswordField";
import { ToggleActive } from "./ToggleActive";

export function UsuarioPanelFormFields({
  defaultValues,
  isEdit = false
}: {
  isEdit?: boolean;
  defaultValues?: {
    nombre?: string;
    email?: string;
    rol?: string;
    activo?: boolean;
  };
}) {
  const dv = defaultValues ?? {};
  return (
    <>
      <FormField label="Full Name">
        <input
          className="form-control"
          name="nombre"
          defaultValue={dv.nombre ?? ""}
          placeholder="Ej. Juan Pérez"
          required
        />
      </FormField>
      <FormField label="Email Address">
        <input
          className="form-control"
          name="email"
          type="email"
          defaultValue={dv.email ?? ""}
          placeholder="juan.perez@agrosystem.com"
          required
        />
      </FormField>
      <PasswordField
        label="Password"
        placeholder={isEdit ? "Nueva contraseña (opcional)" : "••••••••"}
        required={!isEdit}
      />
      <FormField label="Role">
        <select className="form-select" name="rol" defaultValue={dv.rol ?? "operador"}>
          <option value="admin">Super Admin</option>
          <option value="operador">Analyst</option>
          <option value="agricultor">Operador</option>
        </select>
      </FormField>
      <ToggleActive
        title="Cuenta Activa"
        description="El usuario podrá iniciar sesión inmediatamente."
        defaultChecked={dv.activo !== false}
      />
    </>
  );
}

export function UsuarioMovilFormFields() {
  return (
    <>
      <FormField label="Nombre completo">
        <input className="form-control" name="nombre" placeholder="Carlos Arboleda" required />
      </FormField>
      <FormField label="Username (login app)">
        <input className="form-control" name="username" placeholder="carlos.a" required />
      </FormField>
      <FormField label="Email Address">
        <input
          className="form-control"
          name="email"
          type="email"
          placeholder="carlos.a@agro.co"
          required
        />
      </FormField>
      <PasswordField label="Password" required />
    </>
  );
}
