"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";
import { bajaAdventistChurch } from "../_content/baja-adventist-church";
import { BajaChurchMap } from "./baja-church-map";
import styles from "./adventist-church-invite.module.css";

function AdventistInviteDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
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
      <div className={styles.dialog}>
        <button
          aria-label="Meghívó bezárása"
          className={styles.closeButton}
          onClick={onClose}
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
            <p className={styles.heroLead}>{bajaAdventistChurch.invitationCopy}</p>
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
          <a
            className={styles.secondaryAction}
            href={bajaAdventistChurch.websiteHref}
            rel="noreferrer"
            target="_blank"
          >
            Gyülekezet oldala
          </a>
        </div>
      </div>
    </div>
  );
}

export function AdventistChurchInvite() {
  const [isOpen, setIsOpen] = useState(false);
  const handleEscape = useEffectEvent(() => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen]);

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
