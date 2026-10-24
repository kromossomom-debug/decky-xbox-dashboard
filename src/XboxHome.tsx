import { Focusable, Navigation } from "@decky/ui";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaSteam } from "react-icons/fa";
import { IoLibrary } from "react-icons/io5";
import { MdDownload, MdPhotoLibrary, MdSearch, MdSettings, MdStore } from "react-icons/md";

import { ActionTile, Art, GameTile, Row } from "./components";
import { t } from "./i18n";
import {
  App,
  appById,
  byRecent,
  favoriteApps,
  heroUrls,
  installedApps,
  lastPlayedText,
  logoUrls,
  playtimeText,
  ROUTES,
  topRowApps,
  userCollections,
} from "./steam";
import { useSettings } from "./store";
import { formatDuration, useHltb } from "./hltb";
import type { TabId } from "./Shell";

const RECENT_COUNT = 9;
const ROW_COUNT = 14;
/** Wait a moment before swapping the big background, so flicking through tiles doesn't strobe. */
const BACKDROP_DELAY_MS = 140;
/** Where a lower row sits once focused, as a share of the screen height from the top. */
const LOWER_ROW_ANCHOR = 0.3;

function Backdrop({ app, dim }: { app?: App; dim: boolean }) {
  return (
    <div className={`xbd-backdrop ${dim ? "xbd-dim" : ""}`}>
      {app && <Art key={app.appid} className="xbd-backdrop-img" sources={heroUrls(app)} />}
      <div className="xbd-backdrop-shade" />
    </div>
  );
}

/** Wait for the focus to settle on a game before asking HowLongToBeat about it. */
const HLTB_DELAY_MS = 700;

function GameInfo({ app }: { app?: App }) {
  const hltb = useHltb(app, HLTB_DELAY_MS);
  if (!app) return null;
  const toBeat = hltb?.main ? t.hltbToBeat(formatDuration(hltb.main)) : "";
  const sub = [lastPlayedText(app), playtimeText(app), toBeat].filter(Boolean).join("  ·  ");
  return (
    <div className="xbd-info" key={app.appid}>
      <Art
        className="xbd-info-logo"
        sources={logoUrls(app)}
        fallback={<div className="xbd-info-title">{app.display_name}</div>}
      />
      <div className="xbd-info-sub">{sub}</div>
    </div>
  );
}

interface GameRow {
  title: string;
  apps: App[];
}

interface RowsProps {
  recents: App[];
  rows: GameRow[];
  shortcuts: boolean;
  goTab: (tab: TabId) => void;
  onTopRow: (app?: App) => void;
  onLowerRow: (el: HTMLElement) => void;
}

/**
 * All the tiles. Memoized with stable props, so moving the focus only re-renders the background
 * and the game info, not every tile (each one is a Steam focus node, which is costly to update).
 */
const HomeRows = memo(function HomeRows({ recents, rows, shortcuts, goTab, onTopRow, onLowerRow }: RowsProps) {
  return (
    <>
      <Row>
        {recents.map((app, i) => (
          <GameTile
            key={app.appid}
            app={app}
            size={i === 0 ? "big" : "normal"}
            art={i === 0 ? "hero" : "portrait"}
            preferredFocus={i === 0}
            onFocus={onTopRow}
          />
        ))}
        <ActionTile icon={<IoLibrary />} label={t.tabGames} accent onFocus={() => onTopRow()} onActivate={() => goTab("games")} />
        <ActionTile icon={<MdStore />} label={t.tabStore} onFocus={() => onTopRow()} onActivate={() => goTab("store")} />
      </Row>

      {rows.map(
        (row) =>
          row.apps.length > 0 && (
            <Row key={row.title} title={row.title}>
              {row.apps.map((app) => (
                <GameTile key={app.appid} app={app} size="small" onFocus={(_a, el) => onLowerRow(el)} />
              ))}
            </Row>
          ),
      )}

      {shortcuts && (
        <Row title={t.rowShortcuts}>
          {[
            { icon: <IoLibrary />, label: t.tabGames, go: () => goTab("games") },
            { icon: <FaSteam />, label: t.steamLibrary, go: () => Navigation.Navigate(ROUTES.library) },
            { icon: <MdStore />, label: t.tabStore, go: () => goTab("store") },
            { icon: <MdDownload />, label: t.downloads, go: () => Navigation.Navigate(ROUTES.downloads) },
            { icon: <MdPhotoLibrary />, label: t.media, go: () => Navigation.Navigate(ROUTES.media) },
            { icon: <MdSearch />, label: t.search, go: () => Navigation.Navigate(ROUTES.search) },
            { icon: <MdSettings />, label: t.settings, go: () => Navigation.Navigate(ROUTES.settings) },
          ].map((s) => (
            <ActionTile key={s.label} icon={s.icon} label={s.label} size="small" onFocus={onLowerRow} onActivate={s.go} />
          ))}
        </Row>
      )}
    </>
  );
});

export function HomeTab({ goTab }: { goTab: (tab: TabId) => void }) {
  const settings = useSettings();
  const hidden = useMemo(() => new Set(settings.hiddenHome), [settings.hiddenHome]);
  const recents = useMemo(
    () => topRowApps(settings.topRow, settings.pins).filter((a) => !hidden.has(a.appid)).slice(0, RECENT_COUNT),
    [settings.topRow, settings.pins, hidden],
  );
  const rows = useMemo<GameRow[]>(() => {
    const shown = (apps: App[]) => apps.filter((a) => !hidden.has(a.appid)).slice(0, ROW_COUNT);
    const list: GameRow[] = [];
    if (settings.rowPinned) {
      // Games pinned with X / "Pin to Home"; until there are any, the Steam Favorites stand in.
      // Pinning is explicit, so a pinned game shows here even if it was hidden from the other rows.
      const pinned = settings.pins.map(appById).filter((a): a is App => !!a);
      list.push({ title: t.rowPinned, apps: pinned.length ? pinned.slice(0, ROW_COUNT) : shown(favoriteApps().sort(byRecent)) });
    }
    if (settings.rowInstalled) list.push({ title: t.rowInstalled, apps: shown(installedApps().sort(byRecent)) });
    const extra = settings.rowCollection && userCollections().find((c) => c.id === settings.rowCollection);
    if (extra) list.push({ title: extra.name, apps: shown(extra.apps().sort(byRecent)) });
    return list;
  }, [settings.rowPinned, settings.rowInstalled, settings.rowCollection, settings.pins, hidden]);

  const [focused, setFocused] = useState<App | undefined>(recents[0]);
  const [backdrop, setBackdrop] = useState<App | undefined>(recents[0]);
  const [lowered, setLowered] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setBackdrop(focused), BACKDROP_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [focused]);

  const onTopRow = useCallback((app?: App) => {
    if (app) setFocused(app);
    setLowered(false);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const onLowerRow = useCallback((el: HTMLElement) => {
    setLowered(true);
    const section = el.closest<HTMLElement>(".xbd-section");
    const s = scroller.current;
    if (section && s) s.scrollTo({ top: section.offsetTop - s.clientHeight * LOWER_ROW_ANCHOR, behavior: "smooth" });
  }, []);

  return (
    <>
      <Backdrop app={backdrop} dim={lowered} />
      <Focusable className="xbd-scroller" ref={scroller} flow-children="column">
        <div className="xbd-hero-space">
          <GameInfo app={lowered ? undefined : focused} />
        </div>
        <HomeRows
          recents={recents}
          rows={rows}
          shortcuts={settings.rowShortcuts}
          goTab={goTab}
          onTopRow={onTopRow}
          onLowerRow={onLowerRow}
        />
        <div className="xbd-bottom-space" />
      </Focusable>
    </>
  );
}
