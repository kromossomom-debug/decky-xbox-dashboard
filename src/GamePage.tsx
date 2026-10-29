import { Focusable, GamepadButton, GamepadEvent, Navigation, useParams } from "@decky/ui";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FaSteam } from "react-icons/fa";
import {
  MdCheckCircle,
  MdDownload,
  MdEmojiEvents,
  MdOutlinePushPin,
  MdPlayArrow,
  MdPushPin,
  MdSportsEsports,
  MdStore,
  MdTune,
} from "react-icons/md";

import { Art, FOCUSED_CLASS, pinWithToast, useFocusReveal } from "./components";
import { openGameMenu } from "./gameMenu";
import { HltbTimes, formatDuration, useHltb } from "./hltb";
import { t } from "./i18n";
import {
  APP_TYPE_SHORTCUT,
  App,
  GameDetails,
  appById,
  formatSize,
  heroUrls,
  installApp,
  lastPlayedText,
  launch,
  loadGameDetails,
  logoUrls,
  openSteamPage,
  openStore,
  playtimeText,
  resumeRunningApp,
  runningAppId,
} from "./steam";
import { useRootVars, useSettings } from "./store";
import { XBOX_CSS } from "./styles";

function deckBadge(category?: number): { label: string; kind: string } | undefined {
  if (category === 3) return { label: t.deckVerified, kind: "verified" };
  if (category === 2) return { label: t.deckPlayable, kind: "playable" };
  if (category === 1) return { label: t.deckUnsupported, kind: "unsupported" };
  return undefined;
}

function ActionCard({
  icon,
  title,
  description,
  progress,
  onActivate,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  progress?: number;
  onActivate: () => void;
}) {
  return (
    <Focusable
      className="xbd-gp-card"
      focusClassName={FOCUSED_CLASS}
      noFocusRing
      onActivate={onActivate}
      onOKActionDescription={t.open}
    >
      <div className="xbd-gp-card-icon">{icon}</div>
      <div className="xbd-gp-card-title">{title}</div>
      <div className="xbd-gp-card-desc">{description}</div>
      {progress !== undefined && (
        <div className="xbd-gp-progress">
          <div style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </Focusable>
  );
}

/** HowLongToBeat's three times, plus how far the player's own playtime is into the main story. */
function HltbPanel({ times, playedMinutes }: { times: HltbTimes; playedMinutes: number }) {
  const stats = [
    { label: t.hltbMain, value: times.main },
    { label: t.hltbPlus, value: times.plus },
    { label: t.hltbFull, value: times.full },
  ].filter((s) => s.value > 0);
  if (!stats.length) return null;
  const pct = times.main ? Math.round(((playedMinutes * 60) / times.main) * 100) : 0;
  return (
    <div className="xbd-gp-hltb">
      <div className="xbd-gp-hltb-stats">
        {stats.map((s) => (
          <div key={s.label} className="xbd-gp-hltb-stat">
            <div className="xbd-gp-hltb-value">{formatDuration(s.value)}</div>
            <div className="xbd-gp-hltb-label">{s.label}</div>
          </div>
        ))}
        <div className="xbd-gp-hltb-source">{t.hltbSource}</div>
      </div>
      {pct > 0 && (
        <>
          <div className="xbd-gp-progress">
            <div style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div className="xbd-gp-hltb-note">{pct >= 100 ? t.hltbBeyond : t.hltbProgress(pct)}</div>
        </>
      )}
    </div>
  );
}

function GameHub({ app }: { app: App }) {
  const root = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState<GameDetails | undefined>();
  useFocusReveal(root);
  const hltb = useHltb(app);
  const pinned = useSettings().pins.includes(app.appid);
  const rootVars = useRootVars();

  useEffect(() => {
    let alive = true;
    loadGameDetails(app.appid).then((d) => {
      if (alive) setDetails(d);
    });
    return () => {
      alive = false;
    };
  }, [app.appid]);

  const shortcut = app.app_type === APP_TYPE_SHORTCUT;
  const running = runningAppId() === app.appid;
  const playable = app.installed || shortcut;
  const deck = deckBadge(app.steam_deck_compat_category);
  const size = app.installed ? formatSize(app.size_on_disk) : undefined;
  const sub = [lastPlayedText(app), playtimeText(app)].filter(Boolean).join("  ·  ");
  const total = details?.totalAchievements ?? 0;
  const got = details?.achieved ?? 0;

  const primary = running
    ? { label: t.resume, icon: <MdPlayArrow />, go: resumeRunningApp }
    : playable
      ? { label: t.play, icon: <MdPlayArrow />, go: () => launch(app) }
      : { label: t.install, icon: <MdDownload />, go: () => installApp(app) };

  return (
    <div className="xbd-root xbd-game" ref={root} style={rootVars}>
      <style>{XBOX_CSS}</style>
      <div className="xbd-backdrop">
        <Art className="xbd-backdrop-img" sources={heroUrls(app)} />
        <div className="xbd-gp-shade" />
      </div>

      <Focusable
        className="xbd-gp-body"
        flow-children="column"
        onCancelButton={() => Navigation.NavigateBack()}
        onButtonDown={(e: GamepadEvent) => {
          if (e.detail?.button === GamepadButton.SELECT) openGameMenu(app, e.target ?? undefined, true);
        }}
        actionDescriptionMap={{ [GamepadButton.SELECT]: t.options }}
      >
        <div className="xbd-gp-head">
          <Art className="xbd-gp-logo" sources={logoUrls(app)} fallback={<div className="xbd-gp-title">{app.display_name}</div>} />
          {sub && <div className="xbd-gp-sub">{sub}</div>}
          <div className="xbd-gp-badges">
            {running && <span className="xbd-gp-badge xbd-gp-badge-accent">{t.running}</span>}
            {deck && (
              <span className={`xbd-gp-badge xbd-gp-deck-${deck.kind}`}>
                <MdCheckCircle /> Steam Deck · {deck.label}
              </span>
            )}
            {!!app.metacritic_score && <span className="xbd-gp-badge">Metacritic {app.metacritic_score}</span>}
            {size && <span className="xbd-gp-badge">{t.onDisk(size)}</span>}
          </div>
          {hltb && <HltbPanel times={hltb} playedMinutes={app.minutes_playtime_forever ?? 0} />}
        </div>

        <Focusable className="xbd-gp-actions" flow-children="row">
          <Focusable
            className="xbd-gp-play"
            focusClassName={FOCUSED_CLASS}
            noFocusRing
            preferredFocus
            onActivate={primary.go}
            onOKActionDescription={primary.label}
          >
            {primary.icon}
            <span>{primary.label}</span>
          </Focusable>
          <Focusable
            className={`xbd-gp-more ${pinned ? "xbd-gp-pinned" : ""}`}
            focusClassName={FOCUSED_CLASS}
            noFocusRing
            onActivate={() => pinWithToast(app)}
            onOKActionDescription={pinned ? t.unpin : t.pin}
          >
            {pinned ? <MdPushPin /> : <MdOutlinePushPin />}
          </Focusable>
          <Focusable
            className="xbd-gp-more"
            focusClassName={FOCUSED_CLASS}
            noFocusRing
            onActivate={() => openSteamPage(app)}
            onOKActionDescription={t.steamPage}
          >
            <FaSteam />
          </Focusable>
        </Focusable>

        <Focusable className="xbd-row xbd-gp-cards" flow-children="row">
          {!shortcut && (
            <ActionCard
              icon={<MdEmojiEvents />}
              title={t.achievements}
              description={total ? t.achievementsCount(got, total) : t.achievementsNone}
              progress={total ? got / total : undefined}
              onActivate={() => Navigation.Navigate(`/library/app/${app.appid}/achievements/my`)}
            />
          )}
          <ActionCard
            icon={<MdTune />}
            title={t.manageGame}
            description={t.manageGameDesc}
            onActivate={() => Navigation.Navigate(`/app/${app.appid}/properties`)}
          />
          <ActionCard
            icon={<MdSportsEsports />}
            title={t.controller}
            description={t.controllerDesc}
            onActivate={() => Navigation.Navigate(`/app/${app.appid}/controllerconfigurator`)}
          />
          {!shortcut && (
            <ActionCard
              icon={<MdStore />}
              title={t.storePage}
              description={t.storePageDesc}
              onActivate={() => openStore(`app/${app.appid}`)}
            />
          )}
          <ActionCard icon={<FaSteam />} title={t.steamPage} description={t.steamPageDesc} onActivate={() => openSteamPage(app)} />
        </Focusable>
      </Focusable>

      {(details?.description || details?.developer) && (
        <aside className="xbd-gp-about">
          <div className="xbd-gp-about-title">{t.about}</div>
          {details.description && <p>{details.description}</p>}
          {details.developer && (
            <div className="xbd-gp-about-meta">
              {t.developer}: <b>{details.developer}</b>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

/** Route component for /xbox-dashboard/game/:appid. */
export function GamePage() {
  const { appid } = useParams<{ appid: string }>();
  const app = useMemo(() => appById(Number(appid)), [appid]);
  useEffect(() => {
    // Unknown id (e.g. removed from the library): Steam's own page knows how to say so.
    if (!app) Navigation.Navigate(`/library/app/${appid}`);
  }, [app, appid]);
  return app ? <GameHub key={app.appid} app={app} /> : null;
}
