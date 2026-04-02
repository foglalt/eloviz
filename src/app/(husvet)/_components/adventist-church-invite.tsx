"use client";

import Image from "next/image";
import { useState } from "react";
import { bajaAdventistChurch } from "../_content/baja-adventist-church";
import { BajaChurchInviteDialog } from "./baja-church-invite-dialog";
import styles from "./adventist-church-invite.module.css";

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
          <span className={styles.badgeLabel}>{bajaAdventistChurch.badgeLabel}</span>
        </span>
      </button>

      {isOpen ? <BajaChurchInviteDialog onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}
