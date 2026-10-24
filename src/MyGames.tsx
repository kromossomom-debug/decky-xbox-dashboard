import { Focusable } from "@decky/ui";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { MdApps, MdCheckCircle, MdComputer, MdFolder, MdSort, MdSportsEsports, MdStar } from "react-icons/md";

import { FOCUSED_CLASS, GameTile } from "./components";
import { t } from "./i18n";
import {
  App,
  byName,
  byRecent,
  favoriteApps,
  gameApps,
  installedApps,
  nonSteamApps,
  softwareApps,
  userCollections,
} from "./steam";

interface View {
  id: string;
  label: string;
  icon: ReactNode;
  apps: () => App[];
}

type Sort = "recent" | "name";

/**
 * Tiles rendered at first, and added each time the focus gets near the end. Every tile is a Steam
 * focus node, so drawing a 2,000-game library at once would make the page slow to open.
 */
const GRID_PAGE = 60;
const GRID_PRELOAD = 18;

function SideItem({
  icon,
  label,
  active,
  onActivate,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onActivate: () => void;
}) {
  return (
    <Focusable
      className={`xbd-side-item ${active ? "xbd-active" : ""}`}
      focusClassName={FOCUSED_CLASS}
      noFocusRing
      onActivate={onActivate}
      onOKActionDescription={t.select}
    >
      <span className="xbd-side-icon">{icon}</span>
      <span className="xbd-side-label">{label}</span>
    </Focusable>
  );
}

export function GamesTab() {
  const views = useMemo<View[]>(
    () => [
      { id: "games", label: t.viewGames, icon: <MdSportsEsports />, apps: gameApps },
      { id: "apps", label: t.viewApps, icon: <MdApps />, apps: softwareApps },
      { id: "installed", label: t.viewInstalled, icon: <MdCheckCircle />, apps: installedApps },
      { id: "favorites", label: t.viewFavorites, icon: <MdStar />, apps: favoriteApps },
      { id: "nonsteam", label: t.viewNonSteam, icon: <MdComputer />, apps: nonSteamApps },
      ...userCollections().map((c) => ({ id: `c:${c.id}`, label: c.name, icon: <MdFolder />, apps: c.apps })),
    ],
    [],
  );
  const [viewId, setViewId] = useState("games");
  const [sort, setSort] = useState<Sort>("recent");
  const view = views.find((v) => v.id === viewId) ?? views[0];
  const list = useMemo(() => view.apps().sort(sort === "recent" ? byRecent : byName), [view, sort]);
  const [limit, setLimit] = useState(GRID_PAGE);
  useEffect(() => setLimit(GRID_PAGE), [list]);
  const indexOf = useMemo(() => new Map(list.map((a, i) => [a.appid, i])), [list]);
  const onTileFocus = useCallback(
    (app: App) => {
      const i = indexOf.get(app.appid) ?? 0;
      setLimit((l) => (i >= l - GRID_PRELOAD ? Math.min(list.length, l + GRID_PAGE) : l));
    },
    [indexOf, list.length],
  );

  return (
    <Focusable className="xbd-page xbd-mg-body" flow-children="row">
      <Focusable className="xbd-mg-side" flow-children="column">
        {views.map((v) => (
          <SideItem key={v.id} icon={v.icon} label={v.label} active={v.id === view.id} onActivate={() => setViewId(v.id)} />
        ))}
        <div className="xbd-side-sep" />
        <SideItem
          icon={<MdSort />}
          label={sort === "recent" ? t.sortRecent : t.sortName}
          onActivate={() => setSort(sort === "recent" ? "name" : "recent")}
        />
      </Focusable>
      <div className="xbd-mg-main">
        <div className="xbd-mg-head">
          {view.label} <span className="xbd-mg-count">{list.length}</span>
        </div>
        {list.length === 0 ? (
          <div className="xbd-mg-empty">{t.empty}</div>
        ) : (
          <Focusable className="xbd-grid" flow-children="grid" key={`${view.id}-${sort}`}>
            {list.slice(0, limit).map((app, i) => (
              <GameTile key={app.appid} app={app} size="small" preferredFocus={i === 0} onFocus={onTileFocus} />
            ))}
          </Focusable>
        )}
      </div>
    </Focusable>
  );
}
