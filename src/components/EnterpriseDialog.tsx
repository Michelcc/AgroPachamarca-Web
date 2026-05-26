"use client";

import { useRef } from "react";

export function DialogTrigger({
  label,
  className = "btn btn-agro btn-sm",
  dialogId
}: {
  label: string;
  className?: string;
  dialogId: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const el = document.getElementById(dialogId) as HTMLDialogElement | null;
        el?.showModal();
      }}
    >
      {label}
    </button>
  );
}

export function EnterpriseDialog({
  id,
  title,
  subtitle,
  size = "md",
  children
}: {
  id: string;
  title: string;
  subtitle?: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      id={id}
      ref={ref}
      className={`modal-enterprise${size === "lg" ? " modal-enterprise-lg" : ""}`}
    >
      <div className="modal-enterprise-inner">
        <header className="modal-enterprise-header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="modal-close-btn"
            aria-label="Cerrar"
            onClick={() => ref.current?.close()}
          >
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

export function ModalBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`modal-enterprise-body ${className}`.trim()}>{children}</div>;
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return <footer className="modal-enterprise-footer">{children}</footer>;
}

export function ModalActions({
  dialogId,
  submitLabel,
  cancelLabel = "Cancelar"
}: {
  dialogId: string;
  submitLabel: string;
  cancelLabel?: string;
}) {
  return (
    <>
      <button
        type="button"
        className="btn btn-outline-agro"
        onClick={() => {
          const el = document.getElementById(dialogId) as HTMLDialogElement | null;
          el?.close();
        }}
      >
        {cancelLabel}
      </button>
      <button type="submit" className="btn btn-agro btn-with-icon">
        <span className="btn-icon" aria-hidden>
          💾
        </span>
        {submitLabel}
      </button>
    </>
  );
}
