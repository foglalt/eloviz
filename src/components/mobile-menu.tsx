"use client";

import Link from "next/link";
import { useRef } from "react";

type MobileMenuProps = {
  links: ReadonlyArray<readonly [label: string, href: string]>;
};

export function MobileMenu({ links }: MobileMenuProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    menuRef.current?.removeAttribute("open");
  }

  return (
    <details className="mobile-menu" ref={menuRef}>
      <summary>Menü</summary>
      <nav className="mobile-menu__panel" aria-label="Mobil navigáció">
        {links.map(([label, href]) => <Link key={href} href={href} onClick={closeMenu}>{label}</Link>)}
      </nav>
    </details>
  );
}
