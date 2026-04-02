"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { useModalA11y } from "@/lib/client/use-modal-a11y";
import { bajaAdventistChurch } from "../_content/baja-adventist-church";
import { BajaChurchMap } from "./baja-church-map";
import styles from "./adventist-church-invite.module.css";

function AdventistInviteDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();

  useModalA11y({
    isOpen: true,
    containerRef: dialogRef,
    onClose,
    initialFocusRef: closeButtonRef,
  });

  return (
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
            <h2 id="adventist-invite-title">
              {bajaAdventistChurch.invitationTitle}
            </h2>
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
    </div>
  );
}

export function AdventistChurchInvite() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-label={`${bajaAdventistChurch.badgeEyebrow} ${bajaAdventistChurch.badgeLabel}`}
        aria-haspopup="dialog"
        className={styles.badgeButton}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className={styles.badgeLogo}>
          <Image
            alt=""
            aria-hidden="true"
            className={styles.badgeMark}
            height={52}
            priority
            src="/adventist-hu-centered--black.svg"
            width={52}
          />
        </span>
        <span className={styles.badgeCopy}>
          <span className={styles.badgeEyebrow}>
            {bajaAdventistChurch.badgeEyebrow}
          </span>
          <span className={styles.badgeLabel}>
            {bajaAdventistChurch.badgeLabel}
          </span>
        </span>
      </button>

      {isOpen ? <AdventistInviteDialog onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}
