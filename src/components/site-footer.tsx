import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div>
            <Link className="brand" href="/"><BrandMark />Élő Víz</Link>
            <nav className="footer-nav" aria-label="Lábléc navigáció">
              <Link href="/temak">Témák</Link><Link href="/tanulmanyok">Tanulmányok</Link><Link href="/videok">Videók</Link>
            </nav>
          </div>
          <p className="site-footer__verse">„Aki szomjúhozik, jöjjön el; és aki akarja, vegye az élet vizét ingyen.”</p>
        </div>
        <div className="site-footer__bottom"><span>Jelenések 22:17 · Károli-fordítás, mai helyesírással</span><span>Magyar nyelvű bibliai gyűjtemény</span></div>
      </div>
    </footer>
  );
}
