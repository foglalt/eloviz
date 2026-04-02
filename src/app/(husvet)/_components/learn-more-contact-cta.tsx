"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useModalA11y } from "@/lib/client/use-modal-a11y";
import { isRecord } from "@/lib/value-utils";
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
  kicker?: string | null;
};

type InterestDialogProps = {
  onClose: () => void;
  source: "quiz" | "timeline";
};

type InterestDraft = {
  contact: string;
  name: string;
  note: string;
  showNoteField: boolean;
};

const emptyInterestDraft: InterestDraft = {
  contact: "",
  name: "",
  note: "",
  showNoteField: false,
};

function getInterestDraftStorageKey(source: "quiz" | "timeline") {
  return `husvet-interest-draft-v1:${source}`;
}

function getStoredInterestDraft(rawValue: string | null): InterestDraft | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsedValue)) {
      return null;
    }

    return {
      contact:
        typeof parsedValue.contact === "string" ? parsedValue.contact : "",
      name: typeof parsedValue.name === "string" ? parsedValue.name : "",
      note: typeof parsedValue.note === "string" ? parsedValue.note : "",
      showNoteField:
        parsedValue.showNoteField === true ||
        (typeof parsedValue.note === "string" && parsedValue.note.length > 0),
    };
  } catch {
    return null;
  }
}

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
  const [draft, setDraft] = useState<InterestDraft>(() => {
    if (typeof window === "undefined") {
      return emptyInterestDraft;
    }

    try {
      return (
        getStoredInterestDraft(
          window.localStorage.getItem(getInterestDraftStorageKey(source)),
        ) ?? emptyInterestDraft
      );
    } catch {
      return emptyInterestDraft;
    }
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const dialogDescriptionId = useId();

  useModalA11y({
    isOpen: true,
    containerRef: dialogRef,
    onClose,
    initialFocusRef: dismissButtonRef,
  });

  useEffect(() => {
    const hasDraftContent =
      draft.name.trim() ||
      draft.contact.trim() ||
      draft.note.trim() ||
      draft.showNoteField;

    try {
      if (!hasDraftContent) {
        window.localStorage.removeItem(getInterestDraftStorageKey(source));
        return;
      }

      window.localStorage.setItem(
        getInterestDraftStorageKey(source),
        JSON.stringify(draft),
      );
    } catch {}
  }, [draft, source]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    try {
      window.localStorage.removeItem(getInterestDraftStorageKey(source));
    } catch {}
  }, [source, state.status]);

  return (
    <div
      aria-describedby={dialogDescriptionId}
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
      <div className={styles.dialog} ref={dialogRef} tabIndex={-1}>
        <button
          aria-label="Kapcsolatfelvételi ablak bezárása"
          className={styles.dismissButton}
          onClick={onClose}
          ref={dismissButtonRef}
          type="button"
        >
          X
        </button>

        <div className={styles.dialogHeader}>
          <p className={styles.kicker}>Kapcsolat</p>
          <h3 id="learn-more-title">Szeretnék többet megtudni a húsvétról</h3>
          <p className={styles.dialogIntro} id={dialogDescriptionId}>
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
                <input
                  name="name"
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Hogyan szólíthatunk?"
                  value={draft.name}
                />
              </label>

              <label className={styles.field}>
                <span>E-mail vagy telefonszám</span>
                <input
                  name="contact"
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      contact: event.target.value,
                    }))
                  }
                  placeholder="pelda@email.hu vagy +36..."
                  required
                  value={draft.contact}
                />
              </label>
            </div>

            <button
              className={styles.noteToggle}
              onClick={() =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  showNoteField: !currentDraft.showNoteField,
                }))
              }
              type="button"
            >
              {draft.showNoteField
                ? "Üzenet elrejtése"
                : "Üzenet hozzáadása"}
            </button>

            {draft.showNoteField ? (
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Üzenet</span>
                <textarea
                  name="note"
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Mi érdekel jobban, vagy mikor keressünk?"
                  rows={3}
                  value={draft.note}
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
  kicker = "Továbblépés",
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
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <button className={styles.triggerButton} onClick={openDialog} type="button">
        Lépjünk kapcsolatba
      </button>

      {isOpen ? (
        <InterestDialog key={dialogKey} onClose={() => setIsOpen(false)} source={source} />
      ) : null}
    </div>
  );
}
