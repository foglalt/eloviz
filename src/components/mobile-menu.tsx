"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";

type MobileMenuProps = {
  links: ReadonlyArray<readonly [label: string, href: string]>;
  search: ReactNode;
};

export function MobileMenu({ links, search }: MobileMenuProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    menuRef.current?.removeAttribute("open");
  }

  return (
    <details className="mobile-menu" ref={menuRef}>
      <summary>Menü</summary>
      <nav className="mobile-menu__panel" aria-label="Mobil navigáció">
        {search}
        {links.map(([label, href]) => <Link key={href} href={href} onClick={closeMenu}>{label}</Link>)}
      </nav>
    </details>
  );
}
