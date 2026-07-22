import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { MobileMenu } from "./mobile-menu";

const links = [
  ["Témák", "/temak"], ["Tanulmányok", "/tanulmanyok"], ["Videók", "/videok"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Élő Víz – kezdőlap"><BrandMark />Élő Víz</Link>
        <nav className="site-nav" aria-label="Fő navigáció">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <MobileMenu links={links} />
      </div>
    </header>
  );
}
