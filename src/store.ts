import { callable } from "@decky/api";
import { useEffect, useState } from "react";

import { DEFAULT_SETTINGS, Settings, withDefaults } from "./settings";

const loadSettings = callable<[], Partial<Settings>>("get_settings");
const saveSettings = callable<[settings: Settings], boolean>("set_settings");

let current: Settings = DEFAULT_SETTINGS;
const listeners = new Set<(s: Settings) => void>();

function notify() {
  for (const fn of listeners) fn(current);
}

export const getSettings = () => current;

/** Loads the saved settings once at plugin start. */
export async function initSettings() {
  try {
    current = withDefaults(await loadSettings());
  } catch (e) {
    console.error("[xbox-dashboard] load failed", e);
  }
  notify();
}

export function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  notify();
  saveSettings(current).catch((e) => console.error("[xbox-dashboard] save failed", e));
}

export function subscribe(fn: (s: Settings) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The current settings, re-rendering the component when they change. */
export function useSettings(): Settings {
  const [s, setS] = useState(current);
  useEffect(() => subscribe(setS), []);
  return s;
}

export const isPinned = (appid: number) => current.pins.includes(appid);

/** Pins or unpins a game; returns whether it is pinned now. */
export function togglePin(appid: number): boolean {
  const pinned = isPinned(appid);
  updateSettings({ pins: pinned ? current.pins.filter((id) => id !== appid) : [appid, ...current.pins] });
  return !pinned;
}
