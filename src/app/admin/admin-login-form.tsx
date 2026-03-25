"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdminAction } from "./actions";
import {
  idleAdminActionState,
  type AdminActionState,
} from "./action-state";
import styles from "./admin.module.css";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.primaryButton} type="submit">
      {pending ? "Belépés folyamatban..." : "Belépés"}
    </button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    loginAdminAction,
    idleAdminActionState,
  );

  return (
    <form action={formAction} className={styles.loginPanel}>
      <div className={styles.loginCopy}>
        <p className={styles.kicker}>Admin</p>
        <h1>Kérdésszerkesztő</h1>
        <p>
          Itt tudod frissíteni a húsvéti kvíz kérdéseit, válaszait és magyarázatait.
        </p>
      </div>

      <label className={styles.field}>
        <span>Jelszó</span>
        <input
          autoComplete="current-password"
          name="password"
          placeholder="Admin jelszó"
          type="password"
        />
      </label>

      {state.message ? (
        <p
          className={
            state.status === "error" ? styles.errorMessage : styles.successMessage
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <LoginButton />
    </form>
  );
}
