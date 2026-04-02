"use client";

import { useState } from "react";
import { BajaChurchInviteDialog } from "./baja-church-invite-dialog";
import styles from "./learn-more-contact-cta.module.css";

type LearnMoreContactCtaProps = {
  source: "quiz" | "timeline";
  title: string;
  description: string;
  kicker?: string | null;
};

export function LearnMoreContactCta({
  source,
  title,
  description,
  kicker = "Továbblépés",
}: LearnMoreContactCtaProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.ctaPanel}>
      <div className={styles.copy}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <button
        className={styles.triggerButton}
        data-source={source}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Bajai gyülekezet megnyitása
      </button>

      {isOpen ? <BajaChurchInviteDialog onClose={() => setIsOpen(false)} /> : null}
    </div>
  );
}
