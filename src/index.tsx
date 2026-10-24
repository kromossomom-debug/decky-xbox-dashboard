import { definePlugin, routerHook } from "@decky/api";
import {
  ButtonItem,
  DropdownItem,
  Navigation,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
  staticClasses,
} from "@decky/ui";
import { FaCoffee, FaXbox } from "react-icons/fa";

import { resolveClasses, ResolvedClasses } from "./classes";
import { Fallback } from "./components";
import { t } from "./i18n";
import { applyCss, removeCss } from "./injector";
import { ACCENTS, BackgroundMode, accentColor, DEFAULT_SETTINGS, FocusStyle } from "./settings";
import { getSettings, initSettings, subscribe, updateSettings, useSettings } from "./store";
import { GamePage } from "./GamePage";
import { CUSTOMIZE_ROUTE, GAME_ROUTE, MY_GAMES_ROUTE, openDonate, userCollections } from "./steam";
import { CustomizeHome } from "./CustomizeHome";
import { buildCss } from "./theme";
import { XboxShell } from "./Shell";

/** Some Steam class modules load lazily (e.g. home shelves), so keep looking for a while after start. */
const RESOLVE_RETRY_MS = 5000;
const RESOLVE_RETRY_MAX = 24;

let classes: ResolvedClasses = resolveClasses();
let retryTimer: number | undefined;
let unloaded = false;

const HOME_ROUTE = "/library/home";
const MyGamesRoute = () => <XboxShell initialTab="games" />;
type RoutePatch = Parameters<typeof routerHook.addPatch>[1];
let homePatch: RoutePatch | undefined;

/** Swaps Steam's home for the Xbox one, or puts Steam's back, to match the settings. */
function syncHomePatch() {
  const settings = getSettings();
  const want = !unloaded && settings.enabled && settings.xboxHome;
  if (want && !homePatch) {
    homePatch = routerHook.addPatch(HOME_ROUTE, (props) => ({
      ...props,
      children: (
        <Fallback fallback={props.children}>
          <XboxShell initialTab="home" />
        </Fallback>
      ),
      component: undefined,
      render: undefined,
    }));
  } else if (!want && homePatch) {
    routerHook.removePatch(HOME_ROUTE, homePatch);
    homePatch = undefined;
  }
}

function render() {
  syncHomePatch();
  if (unloaded) return;
  const settings = getSettings();
  if (settings.enabled) applyCss(buildCss(settings, classes.sel), settings.palette ? accentColor(settings.accent) : null);
  else removeCss();
}

function startClassRetry() {
  let tries = 0;
  retryTimer = window.setInterval(() => {
    tries++;
    const next = resolveClasses();
    if (next.missing.length < classes.missing.length) {
      classes = next;
      render();
    }
    if (classes.missing.length === 0 || tries >= RESOLVE_RETRY_MAX) {
      window.clearInterval(retryTimer);
      retryTimer = undefined;
    }
  }, RESOLVE_RETRY_MS);
}

function Content() {
  const st = useSettings();
  const change = updateSettings;

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <ToggleField
            label={t.enableLabel}
            description={t.enableDesc}
            checked={st.enabled}
            onChange={(enabled) => change({ enabled })}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t.screensSection}>
        <PanelSectionRow>
          <ToggleField
            label={t.homeLabel}
            description={t.homeDesc}
            checked={st.xboxHome}
            onChange={(xboxHome) => change({ xboxHome })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t.hltbLabel}
            description={t.hltbDesc}
            checked={st.hltb}
            onChange={(hltb) => change({ hltb })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => Navigation.Navigate(MY_GAMES_ROUTE)}>
            {t.openMyGames}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {st.xboxHome && (
        <PanelSection title={t.homeRowsSection}>
          <PanelSectionRow>
            <DropdownItem
              label={t.topRowLabel}
              rgOptions={[
                { data: "recent", label: t.topRowRecent },
                { data: "pinned", label: t.rowPinned },
                { data: "installed", label: t.rowInstalled },
                { data: "favorites", label: t.viewFavorites },
                ...userCollections().map((c) => ({ data: `c:${c.id}`, label: c.name })),
              ]}
              selectedOption={st.topRow}
              onChange={(o) => change({ topRow: o.data })}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={() => Navigation.Navigate(CUSTOMIZE_ROUTE)}>
              {t.customizeHome}
            </ButtonItem>
          </PanelSectionRow>
          {st.hiddenHome.length > 0 && (
            <PanelSectionRow>
              <ButtonItem layout="below" onClick={() => change({ hiddenHome: [] })}>
                {t.restoreHidden(st.hiddenHome.length)}
              </ButtonItem>
            </PanelSectionRow>
          )}
          <PanelSectionRow>
            <ToggleField label={t.rowPinned} checked={st.rowPinned} onChange={(rowPinned) => change({ rowPinned })} />
          </PanelSectionRow>
          <PanelSectionRow>
            <ToggleField label={t.rowInstalled} checked={st.rowInstalled} onChange={(rowInstalled) => change({ rowInstalled })} />
          </PanelSectionRow>
          <PanelSectionRow>
            <ToggleField label={t.rowShortcuts} checked={st.rowShortcuts} onChange={(rowShortcuts) => change({ rowShortcuts })} />
          </PanelSectionRow>
          <PanelSectionRow>
            <DropdownItem
              label={t.extraCollection}
              rgOptions={[{ data: "", label: t.none }, ...userCollections().map((c) => ({ data: c.id, label: c.name }))]}
              selectedOption={st.rowCollection}
              onChange={(o) => change({ rowCollection: o.data })}
            />
          </PanelSectionRow>
        </PanelSection>
      )}

      <PanelSection title={t.lookSection}>
        <PanelSectionRow>
          <ToggleField
            label={t.paletteLabel}
            description={t.paletteDesc}
            checked={st.palette}
            onChange={(palette) => change({ palette })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t.accentLabel}
            rgOptions={ACCENTS.map((a) => ({ data: a.id, label: a.label }))}
            selectedOption={st.accent}
            onChange={(o) => change({ accent: o.data })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t.backgroundLabel}
            rgOptions={[
              { data: "art", label: t.bgArt },
              { data: "gradient", label: t.bgGradient },
              { data: "dark", label: t.bgDark },
            ]}
            selectedOption={st.background}
            onChange={(o) => change({ background: o.data as BackgroundMode })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t.focusLabel}
            rgOptions={[
              { data: "white", label: t.focusWhite },
              { data: "accent", label: t.focusAccent },
            ]}
            selectedOption={st.focus}
            onChange={(o) => change({ focus: o.data as FocusStyle })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t.heroSpaceLabel}
            description={t.heroSpaceDesc}
            value={st.heroSpace}
            min={0}
            max={40}
            step={2}
            showValue
            valueSuffix="vh"
            onChange={(heroSpace) => change({ heroSpace })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t.radiusLabel}
            value={st.radius}
            min={0}
            max={32}
            step={1}
            showValue
            valueSuffix="px"
            onChange={(radius) => change({ radius })}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t.layoutSection}>
        <PanelSectionRow>
          <ToggleField
            label={t.guideLabel}
            description={t.guideDesc}
            checked={st.guide}
            onChange={(guide) => change({ guide })}
          />
        </PanelSectionRow>
        {st.guide && (
          <PanelSectionRow>
            <ToggleField
              label={t.effectsLabel}
              description={t.effectsDesc}
              checked={st.effects}
              onChange={(effects) => change({ effects })}
            />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ToggleField
            label={t.cleanHomeLabel}
            description={t.cleanHomeDesc}
            checked={st.hideShelves}
            onChange={(hideShelves) => change({ hideShelves })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t.fontLabel}
            checked={st.font}
            onChange={(font) => change({ font })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => change({ ...DEFAULT_SETTINGS, pins: st.pins, hiddenHome: st.hiddenHome })}>
            {t.resetDefaults}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t.supportSection}>
        <PanelSectionRow>
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>
            {t.supportText}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={openDonate}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <FaCoffee /> Buy Me a Coffee
            </span>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

export default definePlugin(() => {
  unloaded = false;
  routerHook.addRoute(MY_GAMES_ROUTE, MyGamesRoute, { exact: true });
  routerHook.addRoute(GAME_ROUTE, GamePage, { exact: true });
  routerHook.addRoute(CUSTOMIZE_ROUTE, CustomizeHome, { exact: true });
  startClassRetry();
  // Render only once stored settings are in, so a disabled theme never flashes on at boot.
  let unsubscribe: (() => void) | undefined;
  initSettings().finally(() => {
    render();
    unsubscribe = subscribe(render);
  });

  return {
    name: "Xbox Dashboard",
    titleView: <div className={staticClasses.Title}>Xbox Dashboard</div>,
    content: <Content />,
    icon: <FaXbox />,
    onDismount() {
      unloaded = true;
      unsubscribe?.();
      if (retryTimer !== undefined) window.clearInterval(retryTimer);
      syncHomePatch();
      routerHook.removeRoute(MY_GAMES_ROUTE);
      routerHook.removeRoute(GAME_ROUTE);
      routerHook.removeRoute(CUSTOMIZE_ROUTE);
      removeCss();
    },
  };
});
