"use client";

import { useActionState, useEffect, useEffectEvent, useState } from "react";
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
      {pending ? "Küldés..." : "Kapcsolat kérése"}
    </button>
  );
}

function InterestDialog({ onClose, source }: InterestDialogProps) {
  const [state, formAction] = useActionState<InterestActionState, FormData>(
    submitHusvetInterestAction,
    idleInterestActionState,
  );
  const [showNoteField, setShowNoteField] = useState(false);
  const handleEscape = useEffectEvent(() => onClose());

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleEscape();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      aria-labelledby="learn-more-title"
      aria-modal="true"
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className={styles.dialog}>
        <button
          aria-label="Kapcsolatfelvételi ablak bezárása"
          className={styles.dismissButton}
          onClick={onClose}
          type="button"
        >
          X
        </button>

        <div className={styles.dialogHeader}>
          <p className={styles.kicker}>Kapcsolat</p>
          <h3 id="learn-more-title">Szeretnék többet megtudni a húsvétról</h3>
          <p className={styles.dialogIntro}>
            Add meg, hogyan érhetünk el, és később jelentkezünk.
          </p>
        </div>

        {state.status === "success" ? (
          <div className={styles.successPanel}>
            <p className={styles.successKicker}>Köszönjük</p>
            <h4>Jelentkezni fogunk</h4>
            <p>{state.message}</p>
            <button className={styles.closeButton} onClick={onClose} type="button">
              Rendben
            </button>
          </div>
        ) : (
          <form action={formAction} className={styles.form}>
            <input name="source" type="hidden" value={source} />

            <div className={styles.fieldGrid}>
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
            </div>

            <button
              className={styles.noteToggle}
              onClick={() => setShowNoteField((currentValue) => !currentValue)}
              type="button"
            >
              {showNoteField ? "Üzenet elrejtése" : "Üzenet hozzáadása"}
            </button>

            {showNoteField ? (
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Üzenet</span>
                <textarea
                  name="note"
                  placeholder="Mi érdekel jobban, vagy mikor keressünk?"
                  rows={3}
                />
              </label>
            ) : null}

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
