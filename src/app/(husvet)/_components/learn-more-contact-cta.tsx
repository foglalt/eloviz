"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  idleInterestActionState,
  type InterestActionState,
} from "../interest-action-state";
import { submitHusvetInterestAction } from "../interest-actions";
import styles from "./learn-more-contact-cta.module.css";

type LearnMoreContactCtaProps = {
  source: "quiz" | "timeline";
  title: string;
  description: string;
};

type InterestDialogProps = {
  onClose: () => void;
  source: "quiz" | "timeline";
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.submitButton} type="submit">
      {pending ? "Küldés folyamatban..." : "Kapcsolat elküldése"}
    </button>
  );
}

function InterestDialog({ onClose, source }: InterestDialogProps) {
  const [state, formAction] = useActionState<InterestActionState, FormData>(
    submitHusvetInterestAction,
    idleInterestActionState,
  );

  return (
    <div
      aria-labelledby="learn-more-title"
      aria-modal="true"
      className={styles.overlay}
      role="dialog"
    >
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <p className={styles.kicker}>Kapcsolatfelvétel</p>
          <h3 id="learn-more-title">Szeretnék többet megtudni a húsvétról</h3>
          <p className={styles.dialogIntro}>
            Add meg az elérhetőségedet, és később fel tudjuk venni veled a
            kapcsolatot további húsvéti tartalmakkal vagy beszélgetéssel.
          </p>
        </div>

        {state.status === "success" ? (
          <div className={styles.successPanel}>
            <p>{state.message}</p>
            <button className={styles.closeButton} onClick={onClose} type="button">
              Bezárás
            </button>
          </div>
        ) : (
          <form action={formAction} className={styles.form}>
            <input name="source" type="hidden" value={source} />

            <label className={styles.field}>
              <span>Név</span>
              <input name="name" placeholder="Hogyan szólíthatunk?" />
            </label>

            <label className={styles.field}>
              <span>E-mail vagy telefonszám</span>
              <input
                name="contact"
                placeholder="pelda@email.hu vagy +36..."
                required
              />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Üzenet</span>
              <textarea
                name="note"
                placeholder="Melyik rész érdekel jobban, vagy hogyan keressünk?"
                rows={4}
              />
            </label>

            {state.message ? (
              <p
                className={
                  state.status === "error"
                    ? styles.errorMessage
                    : styles.successMessage
                }
                role="status"
              >
                {state.message}
              </p>
            ) : null}

            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={onClose}
                type="button"
              >
                Mégsem
              </button>
              <SubmitButton />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function LearnMoreContactCta({
  source,
  title,
  description,
}: LearnMoreContactCtaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  function openDialog() {
    setDialogKey((currentKey) => currentKey + 1);
    setIsOpen(true);
  }

  return (
    <div className={styles.ctaPanel}>
      <div className={styles.copy}>
        <p className={styles.kicker}>Továbblépés</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <button className={styles.triggerButton} onClick={openDialog} type="button">
        Szeretnék többet megtudni a húsvétról
      </button>

      {isOpen ? (
        <InterestDialog key={dialogKey} onClose={() => setIsOpen(false)} source={source} />
      ) : null}
    </div>
  );
}
