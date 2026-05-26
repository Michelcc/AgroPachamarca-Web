"use client";

export function ToggleActive({
  name = "activo",
  defaultChecked = true,
  title = "Estado Activo",
  description = "Permite que el registro sea visible en el sistema."
}: {
  name?: string;
  defaultChecked?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <label className="toggle-active-box">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="toggle-active-input" />
      <span className="toggle-active-icon" aria-hidden>
        🛡
      </span>
      <span className="toggle-active-text">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className="toggle-active-switch" aria-hidden />
    </label>
  );
}
