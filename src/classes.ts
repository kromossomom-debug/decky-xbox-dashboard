import { findClassModule } from "@decky/ui";

/**
 * Steam's CSS class names are hashed and change between client updates, so each module
 * is found at runtime by a few of its (stable) key names instead of hard-coding hashes.
 */
const MODULE_KEYS = {
  ui: ["BasicUiRoot", "MainNavMenuAnchor"],
  home: ["RecentSection", "BackstackRootTest"],
  recent: ["RecentGamesContainer", "RecentGamesInnerContainer", "RecentGamesBackground"],
  carousel: ["BasicGameCarousel", "BasicGameCarouselItem", "CarouselGameLabel"],
  portrait: ["LibraryItemBox", "PortraitImage", "InRecentGames"],
  asset: ["LandscapeImage", "PortraitImage", "GreyBackground"],
  header: ["DashboardBar", "HeaderItem", "CurrentUserAvatar", "Clock"],
  mainMenu: ["ItemOuter", "ActiveDot", "RunningAppIcon", "Menu"],
  tabs: ["GamepadTabbedPage", "TabRowTabs", "TabTitle"],
  focusRing: ["FocusRing", "FocusRingOnHiddenItem", "growOutline"],
  whatsNew: ["LibraryHomeWhatsNew", "Empty"],
  friends: ["LibraryHomeFriends", "FavoritesCarousel"],
  playNext: ["PlayNextCarousel", "PlayNextCarouselTitle"],
  qam: ["QuickAccessMenu", "TabsWithFooter", "TabGroupPanel"],
  dialog: ["GamepadDialogContent", "ToggleRail", "ToggleSwitch"],
  slider: ["SliderTrack", "SliderHandle", "SliderControl"],
  appAction: ["PlayButton", "PlayButtonContainer", "ShutdownAppButton"],
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
    let mod: Record<string, string> | undefined;
    try {
      mod = (findClassModule((m) => keys.every((k) => typeof m?.[k] === "string")) as any) ?? undefined;
    } catch {
      mod = undefined;
    }
    if (!mod) missing.push(name);
    // `sel.carousel.IsFocused` -> ".hash", or an inert selector if the module/key isn't there.
    sel[name] = new Proxy({} as Record<string, string>, {
      get: (_t, key: string) => (mod && typeof mod[key] === "string" ? `.${CSS.escape(mod[key])}` : MISSING),
    });
  }
  return { sel, missing };
}
