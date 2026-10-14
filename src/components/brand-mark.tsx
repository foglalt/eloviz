import Image from "next/image";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Image src="/brand/living-water-128.png" alt="" width={40} height={40} unoptimized />
    </span>
  );
}
