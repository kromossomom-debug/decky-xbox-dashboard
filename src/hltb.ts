import { callable } from "@decky/api";
import { useEffect, useState } from "react";

import { App } from "./steam";
import { getSettings } from "./store";

/** HowLongToBeat times, in seconds (0 when HowLongToBeat has no data for that category). */
export interface HltbTimes {
  id: number;
  name: string;
  main: number;
  plus: number;
  full: number;
}

const fetchTimes = callable<[appid: number, name: string], HltbTimes | null>("hltb_times");
/** One lookup per game per session; the backend also keeps a week-long cache on disk. */
const cache = new Map<number, Promise<HltbTimes | null>>();

function lookup(app: App): Promise<HltbTimes | null> {
  let p = cache.get(app.appid);
  if (!p) {
    p = fetchTimes(app.appid, app.display_name).catch(() => null);
    cache.set(app.appid, p);
    // Don't hold on to a miss for the whole session: it may have been a network hiccup, and the
    // backend already caches real "not found" answers for a day.
    p.then((r) => {
      if (!r) cache.delete(app.appid);
    });
  }
  return p;
}

/**
 * Times for `app`, once it has stayed the same for `delayMs` (so flicking through tiles on the
 * home screen doesn't fire a lookup for every one of them).
 */
export function useHltb(app: App | undefined, delayMs = 0): HltbTimes | null {
  const [times, setTimes] = useState<HltbTimes | null>(null);
  useEffect(() => {
    setTimes(null);
    if (!app || !getSettings().hltb) return;
    let alive = true;
    const timer = window.setTimeout(() => {
      lookup(app).then((r) => {
        if (alive) setTimes(r);
      });
    }, delayMs);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [app?.appid, delayMs]);
  return times;
}

/** "45 min", "12 h", "12½ h". */
export function formatDuration(seconds: number): string {
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} min`;
  const halves = Math.round(seconds / 1800);
  const whole = Math.floor(halves / 2);
  return halves % 2 ? `${whole}½ h` : `${whole} h`;
}
