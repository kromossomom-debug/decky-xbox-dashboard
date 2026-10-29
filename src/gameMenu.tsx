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

/** Runs a menu action once the menu has closed, so closing it can't undo the action. */
const afterClose = (fn: () => void) => () => window.setTimeout(fn, 0);

/**
 * SELECT on a game tile: Steam's own dropdown menu (so it gets the Guide styling too) with
 * everything you can do to that game from Home. On the game page itself, "Game info" is left out.
 */
export function openGameMenu(app: App, anchor?: EventTarget, onGamePage = false) {
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
        <MenuItem onSelected={afterClose(resumeRunningApp)}>{t.resume}</MenuItem>
      ) : playable ? (
        <MenuItem onSelected={afterClose(() => launch(app))}>{t.play}</MenuItem>
      ) : (
        <MenuItem onSelected={afterClose(() => installApp(app))}>{t.install}</MenuItem>
      )}
      {!onGamePage && <MenuItem onSelected={afterClose(() => openDetails(app))}>{t.gameInfo}</MenuItem>}
      <MenuItem onSelected={afterClose(changeArt)}>{t.changeArt}</MenuItem>
      <MenuSeparator />
      <MenuItem onSelected={() => togglePin(app.appid)}>{pinned ? t.unpin : t.pin}</MenuItem>
      <MenuItem onSelected={() => toggleHidden(app.appid)}>{hidden ? t.show : t.hide}</MenuItem>
      <MenuItem onSelected={() => setFavorite(app.appid, !favorite)}>{favorite ? t.removeFavorite : t.addFavorite}</MenuItem>
      <MenuSeparator />
      {!shortcut && (
        <MenuItem onSelected={afterClose(() => Navigation.Navigate(`/library/app/${app.appid}/achievements/my`))}>
          {t.achievements}
        </MenuItem>
      )}
      <MenuItem onSelected={afterClose(() => Navigation.Navigate(`/app/${app.appid}/properties`))}>{t.properties}</MenuItem>
      <MenuItem onSelected={afterClose(() => openSteamPage(app))}>{t.steamPage}</MenuItem>
    </Menu>,
    anchor,
  );
}
