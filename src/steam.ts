import { Navigation, Router } from "@decky/ui";

import { t } from "./i18n";

/** The subset of Steam's SteamAppOverview this plugin reads. */
export interface App {
  appid: number;
  display_name: string;
  app_type: number;
  installed: boolean;
  gameid?: string;
  rt_last_time_played?: number;
  minutes_playtime_forever?: number;
  size_on_disk?: string;
  /** 3 verified, 2 playable, 1 unsupported, 0 unknown. */
  steam_deck_compat_category?: number;
  metacritic_score?: number;
}

declare const collectionStore: any;
declare const appStore: any;
declare const appDetailsStore: any;
declare const friendStore: any;
declare const SteamClient: any;

export const APP_TYPE_GAME = 1;
export const APP_TYPE_SOFTWARE = 2;
export const APP_TYPE_SHORTCUT = 1073741824;
const LISTED_TYPES = new Set([APP_TYPE_GAME, APP_TYPE_SOFTWARE, APP_TYPE_SHORTCUT]);

const CDN = "https://shared.steamstatic.com/store_item_assets/steam/apps";
/** Steam's ELaunchSource for a launch started from the library. */
const LAUNCH_SOURCE = 100;

export const MY_GAMES_ROUTE = "/xbox-dashboard/games";
export const GAME_ROUTE = "/xbox-dashboard/game/:appid";
export const CUSTOMIZE_ROUTE = "/xbox-dashboard/customize";

/** Game Mode routes, as Steam's own menus open them ("/media" alone renders an empty page). */
export const ROUTES = {
  library: "/library",
  downloads: "/library/downloads",
  media: "/media/grid",
  search: "/search",
  settings: "/settings",
};

export const STORE_URL = "https://store.steampowered.com/";
export const DONATE_URL = "https://buymeacoffee.com/kromossomoc";

/** Opens the author's Buy Me a Coffee page in Steam's browser (closing the Quick Access menu first). */
export function openDonate() {
  Navigation.CloseSideMenus();
  Navigation.NavigateToExternalWeb(DONATE_URL);
}

/** The Store in Game Mode is a Steam web page, not a route of its own. */
export function openStore(path = "") {
  Navigation.NavigateToSteamWeb(STORE_URL + path);
}

function apps(collectionId: string): App[] {
  try {
    return [...(collectionStore.GetCollection(collectionId)?.visibleApps ?? [])];
  } catch {
    return [];
  }
}

export const byRecent = (a: App, b: App) => (b.rt_last_time_played ?? 0) - (a.rt_last_time_played ?? 0);
export const byName = (a: App, b: App) => a.display_name.localeCompare(b.display_name, undefined, { sensitivity: "base" });

export function recentApps(limit: number): App[] {
  let list: App[] = [];
  try {
    list = [...(collectionStore.recentAppsCollection?.visibleApps ?? [])].filter((a: App) => LISTED_TYPES.has(a.app_type));
  } catch {
    // fall through to the library sorted by last played
  }
  if (list.length === 0) list = gameApps().sort(byRecent).filter((a) => a.rt_last_time_played);
  return list.slice(0, limit);
}

export const gameApps = () => apps("type-games");
export const softwareApps = () => apps("type-software");
export const favoriteApps = () => apps("favorite");
export const nonSteamApps = () => gameApps().filter((a) => a.app_type === APP_TYPE_SHORTCUT);
export const installedApps = () => [...gameApps(), ...softwareApps()].filter((a) => a.installed);

/** Collections the user made themselves (system ones like Favorites are listed separately). */
export function userCollections(): { id: string; name: string; apps: () => App[] }[] {
  try {
    return [...(collectionStore.userCollections ?? [])]
      .filter((c: any) => !["favorite", "uncategorized", "hidden"].includes(c.id) && !c.id.startsWith("type-"))
      .map((c: any) => ({ id: c.id, name: c.displayName, apps: () => [...(c.visibleApps ?? [])] }));
  } catch {
    return [];
  }
}

function custom(fn: string, app: App): string[] {
  try {
    const urls = appStore[fn]?.(app);
    return Array.isArray(urls) ? urls : [];
  } catch {
    return [];
  }
}

function steamAsset(app: App, file: string): string[] {
  if (app.app_type === APP_TYPE_SHORTCUT) return [];
  return [`/assets/${app.appid}/${file}`, `${CDN}/${app.appid}/${file}`];
}

export const heroUrls = (app: App) => [...custom("GetCustomHeroImageURLs", app), ...steamAsset(app, "library_hero.jpg")];
export const logoUrls = (app: App) => [...custom("GetCustomLogoImageURLs", app), ...steamAsset(app, "logo.png")];
export const landscapeUrls = (app: App) => [
  ...custom("GetCustomLandcapeImageURLs", app),
  ...steamAsset(app, "header.jpg"),
];
export const portraitUrls = (app: App) => [
  ...custom("GetCustomVerticalCapsuleURLs", app),
  ...custom("GetCachedVerticalCapsuleURL", app),
  ...steamAsset(app, "library_600x900.jpg"),
];

export function runningAppId(): number | undefined {
  try {
    return Router.MainRunningAppID;
  } catch {
    return undefined;
  }
}

/** Steam's own game page. */
export function openSteamPage(app: App) {
  Navigation.Navigate(`/library/app/${app.appid}`);
}

/** The plugin's Xbox-style game page. */
export function openDetails(app: App) {
  Navigation.Navigate(GAME_ROUTE.replace(":appid", String(app.appid)));
}

export function appById(appid: number): App | undefined {
  try {
    return appStore.GetAppOverviewByAppID(appid) ?? undefined;
  } catch {
    return undefined;
  }
}

export function installApp(app: App) {
  try {
    SteamClient.Installs.OpenInstallWizard([app.appid]);
  } catch (e) {
    console.error("[xbox-dashboard] install wizard failed", e);
    openSteamPage(app);
  }
}

export function resumeRunningApp() {
  try {
    Router.NavigateToRunningApp(false);
  } catch (e) {
    console.error("[xbox-dashboard] resume failed", e);
  }
}

export interface GameDetails {
  developer?: string;
  description?: string;
  achieved: number;
  totalAchievements: number;
}

/** Waits for a Steam request, but never longer than `ms`. */
const settle = (p: unknown, ms: number) =>
  Promise.race([Promise.resolve(p).catch(() => undefined), new Promise<void>((r) => setTimeout(r, ms))]);

const DETAILS_TIMEOUT_MS = 4000;

/** Developer, description and achievement progress, loaded on demand from Steam's details store. */
export async function loadGameDetails(appid: number): Promise<GameDetails> {
  try {
    await Promise.all([
      settle(appDetailsStore.RequestAppDetails?.(appid), DETAILS_TIMEOUT_MS),
      settle(appDetailsStore.RequestDescriptionsData?.(appid), DETAILS_TIMEOUT_MS),
      settle(appDetailsStore.RequestAchievements?.(appid), DETAILS_TIMEOUT_MS),
    ]);
  } catch {
    // Show whatever is already there.
  }
  const details = appDetailsStore.GetAppDetails?.(appid);
  const descriptions = appDetailsStore.GetDescriptions?.(appid);
  const achievements = details?.achievements;
  // Store descriptions can carry HTML; the page shows plain text.
  const text = (descriptions?.strSnippet || descriptions?.strFullDescription || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    developer: details?.strDeveloperName || undefined,
    description: text || undefined,
    achieved: achievements?.nAchieved ?? 0,
    totalAchievements: achievements?.nTotal ?? 0,
  };
}

export function formatSize(bytes?: string | number): string | undefined {
  const n = Number(bytes ?? 0);
  if (!n) return undefined;
  const gb = n / 1024 ** 3;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.max(1, Math.round(n / 1024 ** 2))} MB`;
}

/** A on a tile: start the game like on Xbox; open its page when it can't start right away. */
export function launch(app: App) {
  const playable = app.installed || app.app_type === APP_TYPE_SHORTCUT;
  if (runningAppId() === app.appid) {
    resumeRunningApp();
    return;
  }
  if (!playable) {
    openDetails(app);
    return;
  }
  try {
    SteamClient.Apps.RunGame(app.gameid ?? String(app.appid), "", -1, LAUNCH_SOURCE);
  } catch (e) {
    console.error("[xbox-dashboard] RunGame failed", e);
    openDetails(app);
  }
}

export function persona(): { name: string; avatar?: string } {
  try {
    const p = friendStore.m_FriendsUIFriendStore.self.m_persona;
    return { name: p.m_strPlayerName ?? "", avatar: p.avatar_url_full ?? p.avatar_url_medium };
  } catch {
    return { name: "" };
  }
}

export function lastPlayedText(app: App): string {
  const last = app.rt_last_time_played ?? 0;
  if (!last) return app.installed ? t.installed : t.notInstalled;
  const days = Math.floor((Date.now() / 1000 - last) / 86400);
  if (days <= 0) return t.playedToday;
  if (days === 1) return t.playedYesterday;
  if (days < 30) return t.playedDaysAgo(days);
  const months = Math.floor(days / 30);
  if (months < 12) return t.playedMonthsAgo(months);
  return t.playedOverAYear;
}

export function playtimeText(app: App): string {
  const m = app.minutes_playtime_forever ?? 0;
  if (m < 60) return m > 0 ? t.minutesPlayed(m) : "";
  return t.hoursPlayed(Math.round(m / 60));
}

/** The games for Home's big first row, before hidden ones are taken out. */
export function topRowApps(source: string, pins: number[]): App[] {
  const recent = () => recentApps(40);
  if (source === "pinned") {
    const pinned = pins.map(appById).filter((a): a is App => !!a);
    return pinned.length ? pinned : recent();
  }
  if (source === "installed") return installedApps().sort(byRecent);
  if (source === "favorites") return favoriteApps().sort(byRecent);
  if (source.startsWith("c:")) {
    const c = userCollections().find((col) => col.id === source.slice(2));
    if (c) return c.apps().sort(byRecent);
  }
  return recent();
}

export function isFavorite(appid: number): boolean {
  try {
    return !!collectionStore.GetCollection("favorite")?.apps?.has(appid);
  } catch {
    return false;
  }
}

export function setFavorite(appid: number, favorite: boolean) {
  try {
    collectionStore.SetAppsAsFavorite([appid], favorite);
  } catch (e) {
    console.error("[xbox-dashboard] favorite failed", e);
  }
}

/** Whether another Decky plugin (by its display name) is loaded, e.g. "SteamGridDB". */
export function hasDeckyPlugin(name: string): boolean {
  try {
    return !!(window as any).DeckyPluginLoader?.plugins?.some((p: any) => p.name === name);
  } catch {
    return false;
  }
}
