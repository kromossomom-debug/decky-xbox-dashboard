import { Focusable, Navigation } from "@decky/ui";
import { useMemo, useRef } from "react";
import { MdPushPin, MdVisibilityOff } from "react-icons/md";

import { Art, Tile, useFocusReveal } from "./components";
import { t } from "./i18n";
import { App, appById, byRecent, installedApps, portraitUrls, topRowApps } from "./steam";
import { togglePin, toggleHidden, useRootVars, useSettings } from "./store";
import { XBOX_CSS } from "./styles";

const MAIN_ROW_CANDIDATES = 30;
const INSTALLED_CANDIDATES = 20;

function EditTile({ app, hidden, pinned, preferredFocus }: { app: App; hidden: boolean; pinned: boolean; preferredFocus?: boolean }) {
  return (
    <Tile
      size="small"
      label={app.display_name}
      preferredFocus={preferredFocus}
      className={hidden ? "xbd-tile-hidden" : ""}
      onActivate={() => toggleHidden(app.appid)}
      okLabel={hidden ? t.show : t.hide}
      onSecondary={() => togglePin(app.appid)}
      secondaryLabel={pinned ? t.unpin : t.pin}
      badge={
        (hidden || pinned) && (
          <div className={`xbd-badge ${hidden ? "xbd-badge-muted" : ""}`}>{hidden ? t.hiddenBadge : t.pinnedBadge}</div>
        )
      }
    >
      <Art className="xbd-cover" sources={portraitUrls(app)} fallback={<div className="xbd-cover-text">{app.display_name}</div>} />
      {hidden && (
        <div className="xbd-cz-state">
          <MdVisibilityOff />
        </div>
      )}
      {pinned && !hidden && (
        <div className="xbd-cz-state xbd-cz-pin">
          <MdPushPin />
        </div>
      )}
    </Tile>
  );
}

/** Route page: every game that can show on Home, with A to hide/show and X to pin/unpin. */
export function CustomizeHome() {
  const settings = useSettings();
  const rootVars = useRootVars();
  const root = useRef<HTMLDivElement>(null);
  useFocusReveal(root);

  // Built once per visit so tiles don't jump around while you toggle them.
  const games = useMemo(() => {
    const seen = new Set<number>();
    const out: App[] = [];
    const add = (apps: (App | undefined)[]) => {
      for (const a of apps) {
        if (a && !seen.has(a.appid)) {
          seen.add(a.appid);
          out.push(a);
        }
      }
    };
    add(topRowApps(settings.topRow, settings.pins).slice(0, MAIN_ROW_CANDIDATES));
    add(settings.pins.map(appById));
    add(installedApps().sort(byRecent).slice(0, INSTALLED_CANDIDATES));
    add(settings.hiddenHome.map(appById));
    return out;
  }, []);

  const hidden = new Set(settings.hiddenHome);
  const pinned = new Set(settings.pins);

  return (
    <div className="xbd-root xbd-customize" ref={root} style={rootVars}>
      <style>{XBOX_CSS}</style>
      <div className="xbd-cz-head">
        <div className="xbd-cz-title">{t.customizeHome}</div>
        <div className="xbd-cz-hint">{t.customizeHint}</div>
      </div>
      <Focusable className="xbd-cz-body" onCancelButton={() => Navigation.NavigateBack()}>
        <Focusable className="xbd-grid" flow-children="grid">
          {games.map((app, i) => (
            <EditTile key={app.appid} app={app} hidden={hidden.has(app.appid)} pinned={pinned.has(app.appid)} preferredFocus={i === 0} />
          ))}
        </Focusable>
      </Focusable>
    </div>
  );
}
