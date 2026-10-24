import { t } from "./i18n";

export type BackgroundMode = "art" | "gradient" | "dark";
export type FocusStyle = "white" | "accent";

export interface Settings {
  enabled: boolean;
  /** Replace Steam's home with the plugin's Xbox-style home screen. */
  xboxHome: boolean;
  /** Repaint Steam's own blues and blue-greys with the Xbox palette, everywhere. */
  palette: boolean;
  accent: string;
  background: BackgroundMode;
  /** Free space above the Recent row, in vh, so the game art shows like the Xbox hero area. */
  heroSpace: number;
  /** Tile corner radius, in px. */
  radius: number;
  focus: FocusStyle;
  /** Restyle the Steam menu and Quick Access menu like the Xbox Guide. */
  guide: boolean;
  /** Hide the shelves below Recent (What's New, Friends, Recommended). */
  hideShelves: boolean;
  /** Use a Segoe UI style font. */
  font: boolean;
  /** Show HowLongToBeat times on the game page and home screen. */
  hltb: boolean;
  /** Games pinned to Home, most recent first. */
  pins: number[];
  /** Which rows the Xbox home shows below Recent. */
  rowPinned: boolean;
  rowInstalled: boolean;
  rowShortcuts: boolean;
  /** Id of one of the player's collections to show as an extra row, or "" for none. */
  rowCollection: string;
}

export const ACCENTS: { id: string; label: string; color: string }[] = [
  { id: "xbox", label: t.accentXbox, color: "#107C10" },
  { id: "series", label: t.accentSeries, color: "#3DB83D" },
  { id: "lime", label: t.accentLime, color: "#9BF00B" },
  { id: "blue", label: t.accentBlue, color: "#0078D4" },
  { id: "red", label: t.accentRed, color: "#E81123" },
  { id: "purple", label: t.accentPurple, color: "#8764B8" },
  { id: "orange", label: t.accentOrange, color: "#F7630C" },
  { id: "pink", label: t.accentPink, color: "#E3008C" },
  { id: "white", label: t.accentWhite, color: "#E6E6E6" },
];

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  xboxHome: true,
  palette: true,
  accent: "xbox",
  background: "art",
  heroSpace: 18,
  radius: 6,
  focus: "white",
  guide: true,
  hideShelves: false,
  font: true,
  hltb: true,
  pins: [],
  rowPinned: true,
  rowInstalled: true,
  rowShortcuts: true,
  rowCollection: "",
};

export function accentColor(id: string): string {
  return (ACCENTS.find((a) => a.id === id) ?? ACCENTS[0]).color;
}

/** Fill in any keys missing from stored settings (e.g. after an update adds a new option). */
export function withDefaults(stored: Partial<Settings> | null | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}
