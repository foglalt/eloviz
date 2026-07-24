import type { ReactNode } from "react";
import { AdminNotice, AdminShell } from "@/components/admin-shell";

type Props = {
  eyebrow: string;
  title: string;
  message?: string;
  error?: string;
  index: ReactNode;
  children: ReactNode;
};

export function AdminContentWorkspace({
  eyebrow,
  title,
  message,
  error,
  index,
  children,
}: Props) {
  return (
    <AdminShell>
      <div className="admin-heading">
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
      </div>
      <AdminNotice message={message} error={error} />
      <div className="admin-grid">
        {index}
        <div className="admin-stack">{children}</div>
      </div>
    </AdminShell>
  );
}
