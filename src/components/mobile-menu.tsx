"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type MobileMenuProps = {
  links: ReadonlyArray<readonly [label: string, href: string]>;
  search: ReactNode;
};

export function MobileMenu({ links, search }: MobileMenuProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const menu = menuRef.current;
      if (
        menu?.open
        && event.target instanceof Node
        && !menu.contains(event.target)
      ) {
        menu.removeAttribute("open");
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const menu = menuRef.current;
      if (event.key !== "Escape" || !menu?.open) return;

      event.preventDefault();
      menu.removeAttribute("open");
      menu.querySelector("summary")?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
