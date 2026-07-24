import type { ReactNode } from "react";

type Props = {
  title: string;
  help?: string;
  children: ReactNode;
};

export function AdminEditorPanel({ title, help, children }: Props) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      {help ? <p className="admin-help">{help}</p> : null}
      {children}
    </section>
  );
}
