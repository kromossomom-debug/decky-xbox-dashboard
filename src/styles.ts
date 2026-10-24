/**
 * Styles for the plugin's own screens (tab bar, home, "Meus jogos e apps", card tabs). Sizes are in vh so the
 * layout holds on the Deck screen (800px tall) and when docked. Colors come from the theme's
 * --xbd-* variables, with Xbox defaults if the theme stylesheet isn't there.
 */
export const XBOX_CSS = `
.xbd-root {
  --a: var(--xbd-accent, #107C10);
  --f: var(--xbd-focus, #FFFFFF);
  --r: var(--xbd-radius, 6px);
  position: absolute; top: 0; left: 0; width: 100%; height: 100vh;
  overflow: hidden; color: #fff; background: #0b0b0b;
  font-family: "Segoe UI", "Selawik", "Noto Sans", sans-serif;
}
.xbd-root * { box-sizing: border-box; }
.xbd-root:not(.xbd-tab-home) {
  background: radial-gradient(ellipse at 10% -20%, color-mix(in srgb, var(--a) 30%, #0b0b0b) 0%, #0b0b0b 60%);
}
.xbd-content { position: absolute; inset: 0; }
.xbd-page { position: absolute; top: calc(46px + 7vh); left: 0; right: 0; bottom: 0; }

/* ---------- top tab bar (LB / RB) ---------- */
.xbd-tabbar {
  position: absolute; top: 46px; left: 4vw; z-index: 4;
  display: flex; align-items: center; gap: 3vh; font-size: 2.3vh;
}
.xbd-tab {
  padding: 0.6vh 0; font-weight: 600; color: rgba(255,255,255,0.62);
  border-bottom: 3px solid transparent; text-shadow: 0 1px 4px rgba(0,0,0,0.7);
  transition: color 150ms ease, border-color 150ms ease;
}
.xbd-tab-active { color: #fff; border-bottom-color: var(--a); }
.xbd-bumper {
  padding: 0.2vh 0.9vh; border: 1px solid rgba(255,255,255,0.55); border-radius: 999px;
  font-size: 1.4vh; font-weight: 700; opacity: 0.8;
}

/* ---------- background art ---------- */
.xbd-backdrop { position: absolute; inset: 0; }
/* Dimming with a black layer's opacity is composited; a blur filter on a full-screen image is not. */
.xbd-backdrop::after {
  content: ""; position: absolute; inset: 0; background: #080808;
  opacity: 0; transition: opacity 300ms ease;
}
.xbd-backdrop.xbd-dim::after { opacity: 0.7; }
.xbd-backdrop-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center top;
  animation: xbd-fade 500ms ease both;
}
.xbd-backdrop-shade {
  position: absolute; inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 45%, rgba(8,8,8,0.78) 70%, #080808 100%),
    linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%);
}
@keyframes xbd-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes xbd-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* ---------- profile, top left like the Xbox ---------- */
.xbd-profile {
  position: absolute; top: 6px; left: 4vw; z-index: 3; height: 32px;
  display: flex; align-items: center; gap: 10px; pointer-events: none;
}
.xbd-avatar {
  width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #333;
  box-shadow: 0 0 0 2px var(--a);
}
.xbd-gamertag { font-size: 16px; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }

/* ---------- home ---------- */
.xbd-scroller { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
.xbd-hero-space { position: relative; height: 40vh; }
.xbd-info { position: absolute; left: 4vw; bottom: 1.5vh; max-width: 48vw; animation: xbd-rise 350ms ease both; }
.xbd-info-logo {
  display: block; max-width: 34vw; max-height: 15vh;
  object-fit: contain; object-position: left bottom;
}
.xbd-info-title { font-size: 5vh; font-weight: 700; line-height: 1.1; text-shadow: 0 2px 10px rgba(0,0,0,0.75); }
.xbd-info-sub { margin-top: 1vh; font-size: 2vh; opacity: 0.85; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
.xbd-section { margin-top: 1.5vh; }
.xbd-section-title { margin: 0 0 0 4vw; font-size: 2.4vh; font-weight: 600; }
.xbd-row {
  display: flex; align-items: flex-end; gap: 1.6vh;
  overflow: hidden; padding: 1.6vh 4vw 1.8vh; scroll-padding: 0 4vw;
}
.xbd-bottom-space { height: 40vh; }

/* ---------- tiles ---------- */
.xbd-tile {
  position: relative; flex: 0 0 auto; border-radius: var(--r); background: #1e1e1e;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.xbd-tile-big { width: 30vh; height: 30vh; }
.xbd-tile-normal { width: 22vh; height: 22vh; }
.xbd-tile-small { width: 17vh; height: 17vh; }
.xbd-tile-art { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
.xbd-cover { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center 25%; }
.xbd-cover-text {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 1.4vh; text-align: center; font-size: 2.1vh; font-weight: 600;
  background: linear-gradient(135deg, #2c2c2c, #181818);
}
.xbd-tile.xbd-focused {
  z-index: 1; transform: scale(1.05);
  box-shadow: 0 0 0 2px rgba(0,0,0,0.85), 0 0 0 5px var(--f), 0 6px 16px rgba(0,0,0,0.5);
}
.xbd-tile-name {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 2.6vh 1vh 0.9vh;
  font-size: 1.8vh; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  border-radius: 0 0 var(--r) var(--r); background: linear-gradient(transparent, rgba(0,0,0,0.88));
  opacity: 0; transition: opacity 150ms ease;
}
.xbd-tile.xbd-focused .xbd-tile-name { opacity: 1; }
.xbd-tile-action .xbd-tile-name, .xbd-tile-accent .xbd-tile-name { display: none; }
.xbd-not-installed .xbd-cover { opacity: 0.6; }
.xbd-badge {
  position: absolute; top: 0.8vh; left: 0.8vh; padding: 0.3vh 0.8vh; border-radius: 3px;
  background: var(--a); font-size: 1.5vh; font-weight: 600;
}
.xbd-action {
  position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between;
  padding: 1.6vh; background: rgba(44,44,44,0.94);
}
.xbd-tile-accent .xbd-action { background: var(--a); }
.xbd-tile-action.xbd-focused .xbd-action { background: rgba(74,74,74,0.95); }
.xbd-action-icon { font-size: 5vh; line-height: 1; }
.xbd-action-icon svg { display: block; }
.xbd-action-label { font-size: 1.9vh; font-weight: 600; line-height: 1.2; }

/* ---------- Meus jogos e apps ---------- */
.xbd-mg-body { display: flex; }
.xbd-mg-side {
  flex: 0 0 auto; width: 26vw; max-width: 300px; padding: 0.6vh 1.6vw 2vh 4vw;
  display: flex; flex-direction: column; gap: 0.5vh; overflow: hidden;
}
.xbd-side-item {
  flex: 0 0 auto; display: flex; align-items: center; gap: 1.4vh; padding: 1.1vh 1.4vh;
  border-radius: var(--r); font-size: 2vh; color: rgba(255,255,255,0.8);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.xbd-side-item.xbd-active { color: #fff; background: rgba(255,255,255,0.08); box-shadow: inset 3px 0 0 var(--a); }
.xbd-side-item.xbd-focused { background: #fff; color: #000; }
.xbd-side-icon { display: flex; font-size: 2.6vh; }
.xbd-side-sep { flex: 0 0 auto; height: 1px; margin: 1vh 0; background: rgba(255,255,255,0.12); }
.xbd-mg-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.xbd-mg-head { padding: 0 0 0.6vh 1.2vh; font-size: 2.2vh; font-weight: 600; }
.xbd-mg-count { margin-left: 0.6vh; font-weight: 400; opacity: 0.6; }
.xbd-mg-empty { padding: 2vh 1.2vh; font-size: 2vh; opacity: 0.6; }
.xbd-grid {
  flex: 1; min-height: 0; overflow: hidden;
  display: grid; grid-template-columns: repeat(auto-fill, 17vh); gap: 1.8vh; align-content: start;
  padding: 1.2vh 1.2vh 30vh; scroll-padding: 2vh 0;
}

/* ---------- card tabs (Loja, Comunidade, Sistema) ---------- */
.xbd-cards {
  display: grid; grid-template-columns: repeat(auto-fill, 38vh); gap: 2vh; align-content: start;
  padding: 1.6vh 4vw 30vh; overflow: hidden;
}
.xbd-card {
  height: 19vh; padding: 2vh; border-radius: var(--r);
  display: flex; flex-direction: column; justify-content: space-between;
  background: rgba(44,44,44,0.9); transition: transform 150ms ease, box-shadow 150ms ease;
}
.xbd-card-accent { background: var(--a); }
.xbd-card.xbd-focused {
  transform: scale(1.03);
  box-shadow: 0 0 0 2px rgba(0,0,0,0.85), 0 0 0 5px var(--f), 0 6px 16px rgba(0,0,0,0.5);
}
.xbd-card-icon { font-size: 5vh; line-height: 1; }
.xbd-card-icon svg { display: block; }
.xbd-card-title { font-size: 2.4vh; font-weight: 600; }
.xbd-card-desc { margin-top: 0.4vh; font-size: 1.7vh; opacity: 0.75; }

/* ---------- game page (Xbox game hub) ---------- */
.xbd-gp-shade {
  position: absolute; inset: 0;
  background:
    linear-gradient(90deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.55) 42%, rgba(8,8,8,0.05) 72%),
    linear-gradient(to top, #080808 0%, rgba(8,8,8,0.65) 34%, rgba(8,8,8,0) 62%);
}
.xbd-gp-body {
  position: absolute; inset: 0; z-index: 2; padding: 0 5vw 9vh;
  display: flex; flex-direction: column; justify-content: flex-end;
}
.xbd-gp-head { max-width: 52vw; animation: xbd-rise 350ms ease both; }
.xbd-gp-logo { display: block; max-width: 36vw; max-height: 18vh; object-fit: contain; object-position: left bottom; }
.xbd-gp-title { font-size: 6vh; font-weight: 700; line-height: 1.05; text-shadow: 0 2px 10px rgba(0,0,0,0.7); }
.xbd-gp-sub { margin-top: 1.4vh; font-size: 2.1vh; opacity: 0.9; }
.xbd-gp-badges { display: flex; flex-wrap: wrap; gap: 1vh; margin-top: 1.4vh; }
.xbd-gp-badge {
  display: inline-flex; align-items: center; gap: 0.6vh; padding: 0.5vh 1.2vh; border-radius: 999px;
  background: rgba(255,255,255,0.12); font-size: 1.7vh; font-weight: 600;
}
.xbd-gp-badge svg { font-size: 2vh; }
.xbd-gp-badge-accent { background: var(--a); }
.xbd-gp-deck-verified svg { color: #6cd25c; }
.xbd-gp-deck-playable svg { color: #ffc82c; }
.xbd-gp-deck-unsupported svg { color: #9a9a9a; }

.xbd-gp-actions { display: flex; gap: 1.6vh; margin-top: 3vh; }
.xbd-gp-play, .xbd-gp-more {
  height: 7vh; border-radius: var(--r); display: flex; align-items: center; justify-content: center;
  transition: transform 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}
.xbd-gp-play {
  min-width: 32vh; padding: 0 3vh; gap: 1.2vh; background: var(--a);
  font-size: 2.6vh; font-weight: 700;
}
.xbd-gp-play svg { font-size: 3.6vh; }
.xbd-gp-more { width: 7vh; background: rgba(255,255,255,0.14); font-size: 3vh; }
.xbd-gp-play.xbd-focused, .xbd-gp-more.xbd-focused {
  background: #fff; color: #000; transform: scale(1.04);
  box-shadow: 0 0 0 2px rgba(0,0,0,0.85), 0 0 0 5px var(--f), 0 6px 16px rgba(0,0,0,0.5);
}

.xbd-gp-cards { margin: 1.4vh -0.8vh 0; padding: 1.6vh 0.8vh; gap: 1.6vh; align-items: stretch; }
.xbd-gp-card {
  position: relative; flex: 0 0 auto; width: 25vh; height: 15vh; padding: 1.6vh;
  display: flex; flex-direction: column; border-radius: var(--r);
  background: rgba(32,32,32,0.88); transition: transform 150ms ease, box-shadow 150ms ease;
}
.xbd-gp-card.xbd-focused {
  transform: scale(1.04);
  box-shadow: 0 0 0 2px rgba(0,0,0,0.85), 0 0 0 5px var(--f), 0 6px 16px rgba(0,0,0,0.5);
}
.xbd-gp-card-icon { font-size: 3.6vh; line-height: 1; }
.xbd-gp-card-icon svg { display: block; }
.xbd-gp-card-title { margin-top: auto; font-size: 2vh; font-weight: 600; }
.xbd-gp-card-desc { margin-top: 0.3vh; font-size: 1.6vh; opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.xbd-gp-progress { height: 0.6vh; margin-top: 0.8vh; border-radius: 999px; background: rgba(255,255,255,0.15); overflow: hidden; }
.xbd-gp-progress > div { height: 100%; background: var(--a); }

.xbd-gp-about {
  position: absolute; top: 56px; right: 5vw; z-index: 2; width: 30vw; max-height: 46vh; padding: 2.4vh;
  border-radius: calc(var(--r) * 2); background: rgba(12,12,12,0.74); overflow: hidden;
  animation: xbd-fade 400ms ease both;
}
.xbd-gp-about-title { font-size: 2.2vh; font-weight: 700; }
.xbd-gp-about p {
  margin: 1vh 0 0; font-size: 1.8vh; line-height: 1.45; opacity: 0.88;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 9; overflow: hidden;
}
.xbd-gp-about-meta { margin-top: 1.2vh; font-size: 1.7vh; opacity: 0.8; }

.xbd-gp-pinned { background: var(--a); }
.xbd-gp-hltb {
  margin-top: 1.6vh; padding: 1.4vh 1.8vh; max-width: 46vh; border-radius: var(--r);
  background: rgba(12,12,12,0.62);
}
.xbd-gp-hltb-stats { display: flex; align-items: flex-end; gap: 2.6vh; }
.xbd-gp-hltb-value { font-size: 2.6vh; font-weight: 700; line-height: 1.1; }
.xbd-gp-hltb-label { font-size: 1.5vh; opacity: 0.75; white-space: nowrap; }
.xbd-gp-hltb-source { margin-left: auto; font-size: 1.3vh; opacity: 0.5; align-self: flex-start; }
.xbd-gp-hltb .xbd-gp-progress { margin-top: 1.2vh; }
.xbd-gp-hltb-note { margin-top: 0.6vh; font-size: 1.5vh; opacity: 0.8; }
`;
