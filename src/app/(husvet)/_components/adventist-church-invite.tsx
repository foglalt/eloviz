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
          aria-label="MeghĂ­vĂł bezĂˇrĂˇsa"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          BezĂˇrĂˇs
        </button>

        <div className={styles.dialogHero}>
          <div className={styles.lockup}>
            <span className={styles.logoFrame}>
              <Image
                alt=""
                aria-hidden="true"
                height={80}
                priority
                src="/adventist-hu-centered--black.svg"
                width={80}
              />
            </span>

            <div className={styles.heroCopy}>
              <p className={styles.kicker}>
                {bajaAdventistChurch.city} â€˘ {bajaAdventistChurch.churchName}
              </p>
              <h2 id="adventist-invite-title">
                {bajaAdventistChurch.invitationTitle}
              </h2>
            </div>
          </div>

          <p className={styles.heroLead}>{bajaAdventistChurch.invitationCopy}</p>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.detailsPanel}>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>CĂ­m</span>
              <strong>{bajaAdventistChurch.address}</strong>
            </div>

            <div className={styles.schedulePanel}>
              <span className={styles.infoLabel}>Alkalmak</span>
              <ul className={styles.scheduleList}>
                {bajaAdventistChurch.serviceTimes.map((service) => (
                  <li key={service.label}>
                    <span>{service.label}</span>
                    <strong>{service.value}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <p className={styles.note}>{bajaAdventistChurch.note}</p>

            <div className={styles.actions}>
              <a
                className={styles.primaryAction}
                href={bajaAdventistChurch.directionsHref}
                rel="noreferrer"
                target="_blank"
              >
                Ăštvonal megnyitĂˇsa
              </a>
              <a
                className={styles.secondaryAction}
                href={bajaAdventistChurch.websiteHref}
                rel="noreferrer"
                target="_blank"
              >
                GyĂĽlekezet oldala
              </a>
            </div>
          </section>

          <section className={styles.mapPanel}>
            <div className={styles.mapHeader}>
              <span className={styles.infoLabel}>TĂ©rkĂ©p</span>
              <p>EgyszerĹ± ĂştbaigazĂ­tĂˇs a bajai gyĂĽlekezethez.</p>
            </div>
            <BajaChurchMap className={styles.mapFrame} />
          </section>
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
        aria-haspopup="dialog"
        className={styles.badgeButton}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className={styles.badgeLogo}>
          <Image
            alt=""
            aria-hidden="true"
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

