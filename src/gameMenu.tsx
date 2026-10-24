import { toaster } from "@decky/api";
import { Menu, MenuItem, MenuSeparator, Navigation, showContextMenu } from "@decky/ui";

import { t } from "./i18n";
import {
  APP_TYPE_SHORTCUT,
  App,
  hasDeckyPlugin,
  installApp,
  isFavorite,
  launch,
  openDetails,
  openSteamPage,
  resumeRunningApp,
  runningAppId,
  setFavorite,
} from "./steam";
import { isHidden, isPinned, togglePin, toggleHidden } from "./store";

/**
 * SELECT on a game tile: Steam's own dropdown menu (so it gets the Guide styling too) with
 * everything you can do to that game from Home.
 */
export function openGameMenu(app: App, anchor?: EventTarget) {
  const shortcut = app.app_type === APP_TYPE_SHORTCUT;
  const running = runningAppId() === app.appid;
  const playable = app.installed || shortcut;
  const pinned = isPinned(app.appid);
  const hidden = isHidden(app.appid);
  const favorite = isFavorite(app.appid);

  const changeArt = () => {
    if (hasDeckyPlugin("SteamGridDB")) Navigation.Navigate(`/steamgriddb/${app.appid}`);
    else toaster.toast({ title: t.changeArt, body: t.needsSgdb });
  };

  showContextMenu(
    <Menu label={app.display_name}>
      {running ? (
        <MenuItem onSelected={resumeRunningApp}>{t.resume}</MenuItem>
      ) : playable ? (
        <MenuItem onSelected={() => launch(app)}>{t.play}</MenuItem>
      ) : (
        <MenuItem onSelected={() => installApp(app)}>{t.install}</MenuItem>
      )}
      <MenuItem onSelected={() => openDetails(app)}>{t.gameInfo}</MenuItem>
      <MenuItem onSelected={changeArt}>{t.changeArt}</MenuItem>
      <MenuSeparator />
      <MenuItem onSelected={() => togglePin(app.appid)}>{pinned ? t.unpin : t.pin}</MenuItem>
      <MenuItem onSelected={() => toggleHidden(app.appid)}>{hidden ? t.show : t.hide}</MenuItem>
      <MenuItem onSelected={() => setFavorite(app.appid, !favorite)}>{favorite ? t.removeFavorite : t.addFavorite}</MenuItem>
      <MenuSeparator />
      {!shortcut && (
        <MenuItem onSelected={() => Navigation.Navigate(`/library/app/${app.appid}/achievements/my`)}>
          {t.achievements}
        </MenuItem>
      )}
      <MenuItem onSelected={() => Navigation.Navigate(`/app/${app.appid}/properties`)}>{t.properties}</MenuItem>
      <MenuItem onSelected={() => openSteamPage(app)}>{t.steamPage}</MenuItem>
    </Menu>,
    anchor,
  );
}
