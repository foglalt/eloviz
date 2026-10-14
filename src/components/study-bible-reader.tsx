"use client";

import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import type { BiblePassage } from "@/lib/bible-passage-core";
import { bibleVerseHref } from "@/lib/bible-core";

type Reference = { label: string; osisStart: string; osisEnd: string };
type Selection = Reference | { query: string };
type ReaderContext = {
  data: BiblePassage | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string;
  query: string;
  setQuery: (query: string) => void;
  load: (selection: Selection) => void;
  retry: () => void;
  readerOpen: boolean;
  openReader: (origin?: HTMLElement) => void;
  closeReader: () => void;
};
const ReaderContext = createContext<ReaderContext | null>(null);

export function StudyBibleWorkspace({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BiblePassage | null>(null);
  const [status, setStatus] = useState<ReaderContext["status"]>("idle");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [readerOpen, setReaderOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const pending = useRef<AbortController | null>(null);
  const lastSelection = useRef<Selection | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  function openReader(origin?: HTMLElement) {
    if (!readerOpen) opener.current = origin ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setReaderOpen(true);
  }

  function closeReader() {
    const scrollY = window.scrollY;
    setReaderOpen(false);
    if (!window.matchMedia("(max-width: 820px)").matches) {
      requestAnimationFrame(() => {
        const target = opener.current?.isConnected ? opener.current : document.querySelector<HTMLElement>(".study-bible-open");
        target?.focus({ preventScroll: true });
        window.scrollTo(0, scrollY);
      });
    }
  }

  async function load(selection: Selection, origin?: HTMLElement) {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    lastSelection.current = selection;
    setQuery("query" in selection ? selection.query : selection.label);
    setData(null);
    setError("");
    setStatus("loading");
    openReader(origin);
    const params = "query" in selection ? new URLSearchParams({ q: selection.query })
      : new URLSearchParams({ start: selection.osisStart, end: selection.osisEnd });
    try {
      const response = await fetch(`/api/bible/passage?${params}`, { signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "A Biblia most nem tölthető be.");
      if (controller.signal.aborted || pending.current !== controller) return;
      setData(result as BiblePassage);
      setStatus("ready");
    } catch (failure) {
      if (controller.signal.aborted || pending.current !== controller) return;
      setError(failure instanceof Error ? failure.message : "A Biblia most nem tölthető be. Próbáld újra.");
      setStatus("error");
    }
  }

  function openReference(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-bible-start]") : null;
    if (!anchor?.dataset.bibleStart || !anchor.dataset.bibleEnd) return;
    event.preventDefault();
    void load({ osisStart: anchor.dataset.bibleStart, osisEnd: anchor.dataset.bibleEnd,
      label: anchor.dataset.bibleLabel ?? anchor.textContent ?? "" }, anchor);
  }

  return <ReaderContext value={{ data, status, error, query, setQuery, load,
    retry: () => { if (lastSelection.current) void load(lastSelection.current); }, readerOpen, openReader, closeReader }}>
    <div className="study-bible-workspace" data-bible-active={readerOpen} onClick={openReference}>{children}</div>
  </ReaderContext>;
}

function useReader() {
  const value = useContext(ReaderContext);
  if (!value) throw new Error("Study Bible reader needs its workspace.");
  return value;
}

function sizeDesktopReader(reader: HTMLElement) {
  let frame = 0;
  const update = () => {
    const top = Math.max(96, reader.getBoundingClientRect().top);
    reader.style.setProperty("--study-reader-top", `${top}px`);
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  update();
  const observer = new ResizeObserver(schedule);
  observer.observe(reader);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}

function ReaderPanel({ references, onClose, modal = false }: { references: Reference[]; onClose: () => void; modal?: boolean }) {
  const { data, status, error, query, setQuery, load, retry } = useReader();
  const versesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = versesRef.current;
    const target = data && container?.querySelector<HTMLElement>(`[data-osis="${data.selectedStart}"]`);
    if (container && target) {
      container.scrollTop = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16;
    }
  }, [data]);
  const selectedKey = data ? `${data.selectedStart}-${data.selectedEnd}` : "";

  return <div className="study-bible-panel">
    <header className="study-bible-panel__header"><div><h2 id={modal ? "study-bible-modal-title" : "study-bible-title"}>Biblia</h2><p>Károli 1908</p></div>
      <button type="button" className="study-bible-close" aria-label="Biblia bezárása" onClick={onClose}>×</button>
    </header>
    <div className="study-bible-controls">
      <form onSubmit={(event) => { event.preventDefault(); load({ query }); }}>
        <label htmlFor={modal ? "bible-modal-query" : "bible-sidebar-query"}>Igeszakasz</label>
        <div><input id={modal ? "bible-modal-query" : "bible-sidebar-query"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pl. Jn 3:16 vagy Jn 3" maxLength={100} required />
          <button type="submit" disabled={status === "loading"}>Megnyitás</button></div>
      </form>
      {references.length ? <label>A tanulmány igeszakaszai<select value={references.some((reference) => `${reference.osisStart}-${reference.osisEnd}` === selectedKey) ? selectedKey : ""}
        onChange={(event) => { const reference = references.find((item) => `${item.osisStart}-${item.osisEnd}` === event.target.value); if (reference) load(reference); }}>
        <option value="">Válassz egy igeszakaszt</option>
        {references.map((reference) => <option key={`${reference.osisStart}-${reference.osisEnd}`} value={`${reference.osisStart}-${reference.osisEnd}`}>{reference.label}</option>)}
      </select></label> : null}
    </div>
    <div className="study-bible-text" ref={versesRef} role="region" aria-label="Biblia szövege" tabIndex={0} aria-busy={status === "loading"}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        const container = event.currentTarget;
        const steps: Record<string, number> = { ArrowDown: 40, ArrowUp: -40, PageDown: container.clientHeight * .85, PageUp: -container.clientHeight * .85 };
        if (event.key in steps) { event.preventDefault(); container.scrollTop += steps[event.key]; }
        else if (event.key === "Home" || event.key === "End") { event.preventDefault(); container.scrollTop = event.key === "Home" ? 0 : container.scrollHeight; }
      }}>
      {status === "idle" ? <p className="study-bible-help">Kattints a tanulmány egyik igeszakaszára, vagy keress meg egy verset a Bibliában.</p> : null}
      {status === "loading" ? <p role="status">Igeszakasz betöltése…</p> : null}
      {status === "error" ? <div><p role="alert">{error}</p><button type="button" className="text-link" onClick={retry}>Újrapróbálás</button></div> : null}
      {data ? <><p className="study-bible-selection" role="status">{data.label}</p>
        {data.chapters.map((chapter) => <section key={chapter.number}><h3>{chapter.label}</h3><ol className="study-bible-verses">
          {chapter.verses.map((verse) => <li key={verse.osis} data-osis={verse.osis} data-selected={verse.selected}>
            <span className="study-bible-verse-number">{verse.number}</span><p>{verse.text}</p>
          </li>)}
        </ol></section>)}</> : null}
    </div>
    {data ? <footer className="study-bible-footer">
      <nav aria-label="Fejezetek a tanulmány mellett">
        {data.previous ? <button type="button" onClick={() => load({ query: data.previous!.query })} aria-label={`Előző fejezet: ${data.previous.label}`}>← {data.previous.label}</button> : <span />}
        {data.next ? <button type="button" onClick={() => load({ query: data.next!.query })} aria-label={`Következő fejezet: ${data.next.label}`}>{data.next.label} →</button> : <span />}
      </nav>
      <a href={data.href} target="_blank" rel="noopener">Megnyitás a teljes Biblia-olvasóban ↗</a>
      <details><summary>Szövegforrás</summary><p>{data.attribution} <a href={data.sourceUrl} target="_blank" rel="noopener">Forrás</a></p></details>
    </footer> : null}
  </div>;
}

export function StudyBibleReader({ references }: { references: Reference[] }) {
  const { readerOpen, openReader, closeReader } = useReader();
  const [mobile, setMobile] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!mobile || !readerOpen || !dialog) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    Object.assign(body.style, { position: "fixed", top: `-${scrollY}px`, width: "100%", overflow: "hidden" });
    dialog.showModal();
    return () => {
      dialog.close();
      Object.assign(body.style, previous);
      const scrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      document.documentElement.style.scrollBehavior = scrollBehavior;
    };
  }, [mobile, readerOpen]);

  return <>
    {mobile || !readerOpen ? <section className="detail-sidebar__section study-detail__references" aria-label="Bibliai hivatkozások">
      <h2>Bibliai hivatkozások</h2>
      <button className="button study-bible-open" type="button" onClick={(event) => openReader(event.currentTarget)} aria-haspopup={mobile ? "dialog" : undefined}>Biblia megnyitása</button>
      {references.length ? <ul>{references.map((reference) => <li key={`${reference.osisStart}-${reference.osisEnd}`}>
        <a className="text-link" href={bibleVerseHref(reference.osisStart) ?? "/biblia"}
          data-bible-start={reference.osisStart} data-bible-end={reference.osisEnd} data-bible-label={reference.label}>{reference.label}</a>
      </li>)}</ul> : null}
    </section> : null}
    {mobile ? <>
    <button className="study-bible-launcher" type="button" onClick={(event) => openReader(event.currentTarget)} aria-haspopup="dialog">Biblia megnyitása</button>
    <dialog className="study-bible-modal" ref={dialogRef} aria-labelledby="study-bible-modal-title"
      onCancel={(event) => { event.preventDefault(); closeReader(); }}
      onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeReader(); }}>
      <ReaderPanel references={references} onClose={closeReader} modal />
    </dialog>
  </> : readerOpen ? <section ref={sizeDesktopReader} className="detail-sidebar__section study-detail__references study-bible-reader" aria-labelledby="study-bible-title"
    onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); closeReader(); } }}>
    <ReaderPanel references={references} onClose={closeReader} />
  </section> : null}
  </>;
}
