import { bajaAdventistChurch } from "../_content/baja-adventist-church";

type BajaChurchMapProps = {
  className?: string;
};

export function BajaChurchMap({ className }: BajaChurchMapProps) {
  return (
    <div className={className}>
      <iframe
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={bajaAdventistChurch.mapEmbedSrc}
        title="Bajai adventista gyülekezet térkép"
      />
    </div>
  );
}
