"use client";

import { useRef } from "react";

export function DialogTrigger({
  label,
  className = "btn btn-sm btn-outline-primary",
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

export function Dialog({
  id,
  title,
  children
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <dialog id={id} ref={ref} className="modal-dialog">
      <div>
        <div className="modal-header">
          <h5>{title}</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={() => ref.current?.close()}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
