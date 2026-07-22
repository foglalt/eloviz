import Link from "next/link";
export default function NotFound() { return <main className="page-shell"><div className="page-intro"><p className="eyebrow">404</p><h1>Ez az oldal nem található</h1><p className="lead">Lehet, hogy a tartalom még nem jelent meg, vagy új címre költözött.</p><p><Link className="button" href="/">Vissza a kezdőlapra</Link></p></div></main>; }
