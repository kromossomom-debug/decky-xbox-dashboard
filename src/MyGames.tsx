import { Focusable } from "@decky/ui";
import { ReactNode, useMemo, useState } from "react";
import { MdApps, MdCheckCircle, MdComputer, MdFolder, MdSort, MdSportsEsports, MdStar } from "react-icons/md";

import { FOCUSED_CLASS, GameTile } from "./components";
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
      onOKActionDescription="Selecionar"
    >
      <span className="xbd-side-icon">{icon}</span>
      <span className="xbd-side-label">{label}</span>
    </Focusable>
  );
}

export function GamesTab() {
  const views = useMemo<View[]>(
    () => [
      { id: "games", label: "Jogos", icon: <MdSportsEsports />, apps: gameApps },
      { id: "apps", label: "Apps", icon: <MdApps />, apps: softwareApps },
      { id: "installed", label: "Instalados", icon: <MdCheckCircle />, apps: installedApps },
      { id: "favorites", label: "Favoritos", icon: <MdStar />, apps: favoriteApps },
      { id: "nonsteam", label: "Fora da Steam", icon: <MdComputer />, apps: nonSteamApps },
      ...userCollections().map((c) => ({ id: `c:${c.id}`, label: c.name, icon: <MdFolder />, apps: c.apps })),
    ],
    [],
  );
  const [viewId, setViewId] = useState("games");
  const [sort, setSort] = useState<Sort>("recent");
  const view = views.find((v) => v.id === viewId) ?? views[0];
  const list = useMemo(() => view.apps().sort(sort === "recent" ? byRecent : byName), [view, sort]);

  return (
    <Focusable className="xbd-page xbd-mg-body" flow-children="row">
      <Focusable className="xbd-mg-side" flow-children="column">
        {views.map((v) => (
          <SideItem key={v.id} icon={v.icon} label={v.label} active={v.id === view.id} onActivate={() => setViewId(v.id)} />
        ))}
        <div className="xbd-side-sep" />
        <SideItem
          icon={<MdSort />}
          label={sort === "recent" ? "Ordenar: Recentes" : "Ordenar: A–Z"}
          onActivate={() => setSort(sort === "recent" ? "name" : "recent")}
        />
      </Focusable>
      <div className="xbd-mg-main">
        <div className="xbd-mg-head">
          {view.label} <span className="xbd-mg-count">{list.length}</span>
        </div>
        {list.length === 0 ? (
          <div className="xbd-mg-empty">Nada por aqui ainda.</div>
        ) : (
          <Focusable className="xbd-grid" flow-children="grid" key={`${view.id}-${sort}`}>
            {list.map((app, i) => (
              <GameTile key={app.appid} app={app} size="small" preferredFocus={i === 0} />
            ))}
          </Focusable>
        )}
      </div>
    </Focusable>
  );
}
