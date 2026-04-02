"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useModalA11y } from "@/lib/client/use-modal-a11y";
import { bajaAdventistChurch } from "../_content/baja-adventist-church";
import { BajaChurchMap } from "./baja-church-map";
import styles from "./adventist-church-invite.module.css";

type BajaChurchInviteDialogProps = {
  onClose: () => void;
};

export function BajaChurchInviteDialog({ onClose }: BajaChurchInviteDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();
  const portalRoot = typeof document === "undefined" ? null : document.body;

  useModalA11y({
    isOpen: portalRoot !== null,
    containerRef: dialogRef,
    onClose,
    initialFocusRef: closeButtonRef,
  });

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <div
      aria-describedby={descriptionId}
      aria-labelledby="adventist-invite-title"
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
          aria-label="Meghívó bezárása"
          className={styles.closeButton}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          X
        </button>

        <div className={styles.dialogHero}>
          <span className={styles.logoFrame}>
            <Image
              alt=""
              aria-hidden="true"
              className={styles.logoMark}
              height={80}
              priority
              src="/adventist-hu-centered--black.svg"
              width={80}
            />
          </span>

          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              {bajaAdventistChurch.city} • {bajaAdventistChurch.churchName}
            </p>
            <h2 id="adventist-invite-title">{bajaAdventistChurch.invitationTitle}</h2>
            <p className={styles.heroLead} id={descriptionId}>
              {bajaAdventistChurch.invitationCopy}
            </p>
          </div>
        </div>

        <div className={styles.quickFacts}>
          <section className={styles.factCard}>
            <span className={styles.infoLabel}>Cím</span>
            <strong>{bajaAdventistChurch.address}</strong>
          </section>

          <section className={styles.factCard}>
            <span className={styles.infoLabel}>Szombati alkalmak</span>
            <div className={styles.scheduleCompact}>
              {bajaAdventistChurch.serviceTimes.map((service) => (
                <p key={service.label}>
                  <span>{service.label}</span>
                  <strong>{service.value}</strong>
                </p>
              ))}
            </div>
          </section>
        </div>

        <section className={styles.mapSection}>
          <div className={styles.mapHeader}>
            <span className={styles.infoLabel}>Térkép</span>
            <p>Egyszerű útbaigazítás a bajai gyülekezethez.</p>
          </div>
          <BajaChurchMap className={styles.mapFrame} />
        </section>

        <div className={styles.actions}>
          <a
            className={styles.primaryAction}
            href={bajaAdventistChurch.directionsHref}
            rel="noreferrer"
            target="_blank"
          >
            Útvonal megnyitása
          </a>
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
