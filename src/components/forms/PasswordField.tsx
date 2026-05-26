"use client";

import { useState } from "react";
import { FormField } from "./FormField";

export function PasswordField({
  name = "password",
  label = "Password",
  placeholder = "••••••••",
  required = false,
  defaultValue = ""
}: {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <FormField label={label}>
      <div className="input-with-icon">
        <input
          className="form-control"
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          autoComplete={required ? "new-password" : "off"}
        />
        <button
          type="button"
          className="input-icon-btn"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
    </FormField>
  );
}
