import { classMap } from "@decky/ui";

/**
 * Steam's CSS class names are hashed and change between client updates, so each module
 * is found at runtime by a few of its (stable) key names instead of hard-coding hashes.
 * When several modules share those keys (Steam has more than one build of some menus), a
 * selector matches all of them.
 */
const MODULE_KEYS = {
  ui: ["BasicUiRoot", "MainNavMenuAnchor"],
  home: ["RecentSection", "BackstackRootTest"],
  recent: ["RecentGamesContainer", "RecentGamesInnerContainer", "RecentGamesBackground"],
  carousel: ["BasicGameCarousel", "BasicGameCarouselItem", "CarouselGameLabel"],
  portrait: ["LibraryItemBox", "PortraitImage", "InRecentGames"],
  asset: ["LandscapeImage", "PortraitImage", "GreyBackground"],
  header: ["DashboardBar", "HeaderItem", "CurrentUserAvatar", "Clock"],
  // Steam ships several builds of its main menu (normal, game running, dashboard); all get styled.
  mainMenu: ["ItemOuter", "ActiveDot", "Item"],
  tabs: ["GamepadTabbedPage", "TabRowTabs", "TabTitle"],
  focusRing: ["FocusRing", "FocusRingOnHiddenItem", "growOutline"],
  whatsNew: ["LibraryHomeWhatsNew", "Empty"],
  friends: ["LibraryHomeFriends", "FavoritesCarousel"],
  playNext: ["PlayNextCarousel", "PlayNextCarouselTitle"],
  qam: ["QuickAccessMenu", "TabsWithFooter", "TabGroupPanel"],
  dialog: ["GamepadDialogContent", "ToggleRail", "ToggleSwitch"],
  slider: ["SliderTrack", "SliderHandle", "SliderControl"],
  appAction: ["PlayButton", "PlayButtonContainer", "ShutdownAppButton"],
  // Context menus: the power menu (Suspend / Restart / Shut down) and every "…" menu.
  ctx: ["contextMenu", "contextMenuItem", "MenuSectionHeader"],
  qamControls: ["PanelSection", "PanelSectionTitle", "PanelSectionRow"],
} as const;

export type ModuleName = keyof typeof MODULE_KEYS;

/** A selector that matches nothing, used when a class can't be resolved so the rule is inert. */
const MISSING = ".xbd-missing-class";

export type Selectors = Record<ModuleName, Record<string, string>>;

export interface ResolvedClasses {
  sel: Selectors;
  missing: ModuleName[];
}

export function resolveClasses(): ResolvedClasses {
  const sel = {} as Selectors;
  const missing: ModuleName[] = [];
  for (const [name, keys] of Object.entries(MODULE_KEYS) as [ModuleName, readonly string[]][]) {
    let mods: Record<string, string>[] = [];
    try {
      mods = classMap.filter((m: any) => keys.every((k) => typeof m?.[k] === "string")) as any;
    } catch {
      mods = [];
    }
    if (!mods.length) missing.push(name);
    // `sel.carousel.IsFocused` -> ".hash" (or ":is(.a, .b)" across builds), or an inert selector.
    sel[name] = new Proxy({} as Record<string, string>, {
      get: (_t, key: string) => {
        const hashes = [...new Set(mods.map((m) => m[key]).filter((h) => typeof h === "string"))];
        if (!hashes.length) return MISSING;
        const classes = hashes.map((h) => `.${CSS.escape(h)}`);
        return classes.length === 1 ? classes[0] : `:is(${classes.join(", ")})`;
      },
    });
  }
  return { sel, missing };
}
