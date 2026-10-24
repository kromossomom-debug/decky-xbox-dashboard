import { Focusable, NavEntryPositionPreferences } from "@decky/ui";
import { Component, ReactNode, RefObject, useEffect, useRef, useState } from "react";

import { t } from "./i18n";
import { APP_TYPE_SHORTCUT, App, heroUrls, launch, openDetails, portraitUrls, runningAppId } from "./steam";

export const FOCUSED_CLASS = "xbd-focused";
/** Room kept between a focused tile and the edge of its row or grid, in px. */
const EDGE_PAD = 48;

/** An <img> that walks through candidate URLs until one loads, then shows `fallback`. */
export function Art({ sources, className, fallback }: { sources: string[]; className?: string; fallback?: ReactNode }) {
  const key = sources.join("|");
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [key]);
  if (index >= sources.length) return <>{fallback ?? null}</>;
  return (
    <img
      className={className}
      src={sources[index]}
      loading="lazy"
      draggable={false}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

/** Scrolls `container` along one axis just enough to show `el` with some room around it. */
function keepInView(container: HTMLElement, el: HTMLElement, axis: "x" | "y") {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const [start, end, cStart, cEnd] = axis === "x" ? [r.left, r.right, c.left, c.right] : [r.top, r.bottom, c.top, c.bottom];
  let delta = 0;
  if (start < cStart + EDGE_PAD) delta = start - cStart - EDGE_PAD;
  else if (end > cEnd - EDGE_PAD) delta = end - cEnd + EDGE_PAD;
  if (delta) container.scrollBy({ [axis === "x" ? "left" : "top"]: delta, behavior: "smooth" });
}

type FocusHook = { __xbdFocus?: () => void };

/**
 * Steam marks the focused element with `focusClassName`; watching for that class is the one signal
 * that always arrives, whatever moved the focus. Keeps the focused tile on screen inside its row or
 * grid and runs the tile's own focus callback.
 */
export function useFocusReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new MutationObserver((records) => {
      for (const rec of records) {
        const target = rec.target as HTMLElement & FocusHook;
        const was = (rec.oldValue ?? "").split(" ").includes(FOCUSED_CLASS);
        if (was || !target.classList.contains(FOCUSED_CLASS)) continue;
        const row = target.closest<HTMLElement>(".xbd-row");
        if (row) keepInView(row, target, "x");
        const column = target.closest<HTMLElement>(".xbd-grid, .xbd-mg-side, .xbd-cards");
        if (column) keepInView(column, target, "y");
        target.__xbdFocus?.();
      }
    });
    observer.observe(el, { subtree: true, attributes: true, attributeFilter: ["class"], attributeOldValue: true });
    return () => observer.disconnect();
  }, [root]);
}

interface TileProps {
  size?: "big" | "normal" | "small";
  label: string;
  preferredFocus?: boolean;
  onFocus?: (el: HTMLElement) => void;
  onActivate: () => void;
  onOptions?: () => void;
  okLabel?: string;
  children: ReactNode;
  badge?: ReactNode;
  className?: string;
}

/** A square Xbox tile: white focus ring, name strip on focus. */
export function Tile(p: TileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onFocus = useRef(p.onFocus);
  onFocus.current = p.onFocus;
  useEffect(() => {
    const el = ref.current as (HTMLDivElement & FocusHook) | null;
    if (el) el.__xbdFocus = () => onFocus.current?.(el);
  }, []);
  return (
    <Focusable
      ref={ref}
      className={`xbd-tile xbd-tile-${p.size ?? "normal"} ${p.className ?? ""}`}
      focusClassName={FOCUSED_CLASS}
      noFocusRing
      preferredFocus={p.preferredFocus}
      onActivate={p.onActivate}
      onOKActionDescription={p.okLabel}
      onOptionsButton={p.onOptions}
      onOptionsActionDescription={p.onOptions ? t.details : undefined}
    >
      <div className="xbd-tile-art">{p.children}</div>
      {p.badge}
      <div className="xbd-tile-name">{p.label}</div>
    </Focusable>
  );
}

export function GameTile({
  app,
  size,
  preferredFocus,
  onFocus,
  art = "portrait",
}: {
  app: App;
  size?: TileProps["size"];
  preferredFocus?: boolean;
  onFocus?: (app: App, el: HTMLElement) => void;
  art?: "portrait" | "hero";
}) {
  const running = runningAppId() === app.appid;
  const playable = app.installed || app.app_type === APP_TYPE_SHORTCUT;
  return (
    <Tile
      size={size}
      label={app.display_name}
      preferredFocus={preferredFocus}
      onFocus={(el) => onFocus?.(app, el)}
      onActivate={() => launch(app)}
      onOptions={() => openDetails(app)}
      okLabel={running ? t.resume : playable ? t.play : t.open}
      className={playable ? "" : "xbd-not-installed"}
      badge={running ? <div className="xbd-badge">{t.running}</div> : undefined}
    >
      <Art
        className="xbd-cover"
        sources={art === "hero" ? [...heroUrls(app), ...portraitUrls(app)] : portraitUrls(app)}
        fallback={<div className="xbd-cover-text">{app.display_name}</div>}
      />
    </Tile>
  );
}

export function ActionTile({
  icon,
  label,
  onActivate,
  onFocus,
  size,
  accent,
}: {
  icon: ReactNode;
  label: string;
  onActivate: () => void;
  onFocus?: (el: HTMLElement) => void;
  size?: TileProps["size"];
  accent?: boolean;
}) {
  return (
    <Tile
      size={size}
      label={label}
      onActivate={onActivate}
      onFocus={onFocus}
      okLabel={t.open}
      className={accent ? "xbd-tile-accent" : "xbd-tile-action"}
    >
      <div className="xbd-action">
        <div className="xbd-action-icon">{icon}</div>
        <div className="xbd-action-label">{label}</div>
      </div>
    </Tile>
  );
}

/** A wide Xbox card with an icon, title and one line of description. */
export function Card({
  icon,
  title,
  description,
  accent,
  preferredFocus,
  onActivate,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  accent?: boolean;
  preferredFocus?: boolean;
  onActivate: () => void;
}) {
  return (
    <Focusable
      className={`xbd-card ${accent ? "xbd-card-accent" : ""}`}
      focusClassName={FOCUSED_CLASS}
      noFocusRing
      preferredFocus={preferredFocus}
      onActivate={onActivate}
      onOKActionDescription={t.open}
    >
      <div className="xbd-card-icon">{icon}</div>
      <div className="xbd-card-text">
        <div className="xbd-card-title">{title}</div>
        {description && <div className="xbd-card-desc">{description}</div>}
      </div>
    </Focusable>
  );
}

/** A horizontal row of tiles; moving down into it keeps the column, like the Xbox home. */
export function Row({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="xbd-section">
      {title && <h2 className="xbd-section-title">{title}</h2>}
      <Focusable className="xbd-row" flow-children="row" navEntryPreferPosition={NavEntryPositionPreferences.MAINTAIN_X}>
        {children}
      </Focusable>
    </section>
  );
}

/** If one of the plugin's screens crashes, show `fallback` (Steam's own screen) instead of a blank page. */
export class Fallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[xbox-dashboard] screen crashed, showing Steam's", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
