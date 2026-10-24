import { Selectors } from "./classes";
import { Settings, accentColor } from "./settings";

/**
 * Steam's weights of "Motiva Sans", each pointed at a Segoe-like local face. Redefining the family
 * swaps the font everywhere without a selector touching every element.
 */
const FONT_FACES: [number, string[]][] = [
  [100, ["Segoe UI Light", "Selawik Light", "Noto Sans Light"]],
  [300, ["Segoe UI Light", "Selawik Light", "Noto Sans Light"]],
  [400, ["Segoe UI", "Selawik", "Noto Sans Regular", "Noto Sans"]],
  [500, ["Segoe UI Semibold", "Selawik Semibold", "Noto Sans Medium"]],
  [700, ["Segoe UI Bold", "Selawik Bold", "Noto Sans Bold"]],
  [800, ["Segoe UI Bold", "Selawik Bold", "Noto Sans Bold"]],
  [900, ["Segoe UI Black", "Noto Sans Black"]],
];

/** Builds the whole theme stylesheet. Every Steam class comes from `s`, resolved at runtime. */
export function buildCss(st: Settings, s: Selectors): string {
  const { ui, recent, carousel, portrait, asset, header, mainMenu, tabs, focusRing, qam, dialog, slider, appAction, ctx, qamControls } =
    s;
  const accent = accentColor(st.accent);
  const focus = st.focus === "white" ? "#FFFFFF" : accent;
  const parts: string[] = [];

  parts.push(`
:root {
  --xbd-accent: ${accent};
  --xbd-accent-soft: color-mix(in srgb, ${accent} 35%, transparent);
  --xbd-focus: ${focus};
  --xbd-radius: ${st.radius}px;
  --xbd-panel: rgba(24, 24, 24, 0.96);
}`);

  if (st.font) {
    for (const [weight, names] of FONT_FACES) {
      const src = names.map((n) => `local("${n}")`).join(", ");
      parts.push(`@font-face { font-family: "Motiva Sans"; font-style: normal; font-weight: ${weight}; src: ${src}; }`);
    }
  }

  // ---------- Home background: the focused game's art, full bleed, like the Series X|S hero ----------
  if (st.background === "art") {
    parts.push(`
${recent.RecentGamesBackground}, ${recent.RecentGamesBackgroundContainer},
${recent.RecentGamesBackgroundImages}, ${recent.RecentGamesBackgroundImage} {
  filter: none !important;
}
${recent.RecentGamesBackgroundContainer}::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.25) 55%, rgba(10,10,10,0.92) 85%, #0a0a0a 100%),
    linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 45%);
}`);
  } else {
    const bg =
      st.background === "gradient"
        ? `radial-gradient(ellipse at 15% -10%, color-mix(in srgb, ${accent} 55%, #000) 0%, color-mix(in srgb, ${accent} 18%, #050505) 40%, #050505 80%)`
        : `#0e0e0e`;
    parts.push(`
${recent.RecentGamesBackgroundImages}, ${recent.RecentGamesBackgroundImage} { display: none !important; }
${recent.RecentGamesBackground} { background: ${bg} !important; }
${ui.BasicHome} { background: ${bg} !important; }`);
  }

  // ---------- Layout: push the Recent row down so the art has room, Xbox style ----------
  parts.push(`
${recent.RecentGamesContainer} {
  padding-top: calc(${st.heroSpace}vh + 24px) !important;
}
${recent.RecentGamesHeader} {
  opacity: 0.85 !important;
}
${recent.RecentGamesHeaderLabel} {
  font-size: 15px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
  text-transform: none !important;
}`);

  // ---------- Tiles: rounded, flat, no Steam glow/shine ----------
  parts.push(`
${carousel.BasicGameCarouselItemMediaContainer},
${portrait.LibraryItemBox}, ${portrait.PortraitImage}, ${portrait.Capsule},
${asset.Container}, ${asset.PortraitImage}, ${asset.LandscapeImage} {
  border-radius: var(--xbd-radius) !important;
}
${carousel.BasicGameCarouselItemMediaContainer}, ${portrait.LibraryItemBox} {
  overflow: hidden;
}
${carousel.CarouselCapsuleBackgroundGlow}, ${portrait.LibraryItemBoxShine} {
  display: none !important;
}
${carousel.CarouselGameLabel} {
  font-size: 15px !important;
  font-weight: 600 !important;
  text-shadow: 0 1px 4px rgba(0,0,0,0.85);
}`);

  // ---------- Focus: the Series X|S white ring with a dark gap ----------
  const ring = `0 0 0 2px rgba(0,0,0,0.85), 0 0 0 5px var(--xbd-focus), 0 12px 32px rgba(0,0,0,0.6)`;
  parts.push(`
${carousel.BasicGameCarouselItem}${carousel.IsFocused} ${carousel.BasicGameCarouselItemMediaContainer},
${carousel.BasicGameCarouselItem}.gpfocus ${carousel.BasicGameCarouselItemMediaContainer} {
  box-shadow: ${ring} !important;
}
.gpfocus > ${portrait.LibraryItemBox}, ${portrait.LibraryItemBox}.gpfocus,
${portrait.Capsule}.gpfocus ${portrait.LibraryItemBox} {
  box-shadow: ${ring} !important;
}
${focusRing.FocusRing} {
  border-color: var(--xbd-focus) !important;
  border-radius: var(--xbd-radius) !important;
}`);

  // ---------- Top bar: transparent, larger clock, round avatar with accent ring ----------
  parts.push(`
${header.Clock} {
  font-size: 18px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
}
${header.CurrentUserAvatar}, ${header.CurrentUserAvatar} img, ${header.Avatar}, ${header.Avatar} img {
  border-radius: 50% !important;
}
${header.CurrentUserAvatar} {
  box-shadow: 0 0 0 2px var(--xbd-accent);
}
${header.HeaderOpaque} {
  background: rgba(14,14,14,0.9) !important;
}`);

  // ---------- Tabs (Library, Store...): pill highlight with accent underline ----------
  parts.push(`
${tabs.Tab} {
  border-radius: 999px !important;
  transition: background-color 120ms ease;
}
${tabs.Tab}${tabs.Selected} {
  background: rgba(255,255,255,0.14) !important;
  color: #fff !important;
  box-shadow: inset 0 -3px 0 var(--xbd-accent);
}
${tabs.Tab}.gpfocus {
  background: #fff !important;
  color: #000 !important;
}
${tabs.Tab}.gpfocus * { color: #000 !important; }`);

  // ---------- Buttons and controls in the accent color ----------
  parts.push(`
${appAction.PlayButton}${appAction.Green} {
  background: var(--xbd-accent) !important;
  border-radius: var(--xbd-radius) !important;
}
${appAction.PlayButton}${appAction.Green}.gpfocus {
  background: #fff !important;
  color: #000 !important;
}
${appAction.PlayButton}${appAction.Green}.gpfocus * { color: #000 !important; fill: #000 !important; }
${dialog.On} ${dialog.ToggleRail} {
  background: var(--xbd-accent) !important;
}
${slider.SliderHandle} {
  background: #fff !important;
}`);

  // ---------- Steam menu + Quick Access styled like the Xbox Guide ----------
  if (st.guide) {
    // Floating dark panel, white focus pill with dark text, accent bar on the current page: the Xbox Guide.
    parts.push(`
${mainMenu.Menu} {
  background:
    radial-gradient(120% 55% at 0% 0%, color-mix(in srgb, var(--xbd-accent) 22%, transparent) 0%, transparent 62%),
    linear-gradient(180deg, rgba(30,30,30,0.98), rgba(14,14,14,0.98)) !important;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0 calc(var(--xbd-radius) * 2) calc(var(--xbd-radius) * 2) 0;
  box-shadow: 12px 0 48px rgba(0,0,0,0.7);
}
${mainMenu.Menu}::before {
  content: "";
  display: block;
  height: 4px;
  margin: 0 0 6px;
  background: var(--xbd-accent);
  border-radius: 0 calc(var(--xbd-radius) * 2) 0 0;
}
${mainMenu.Item} {
  border-radius: var(--xbd-radius) !important;
  margin: 2px 8px !important;
  transition: background-color 120ms ease, transform 140ms ease;
}
${mainMenu.Item}.gpfocus, ${mainMenu.ItemOuter}.gpfocus ${mainMenu.Item} {
  background: #fff !important;
  color: #000 !important;
  transform: translateX(4px);
}
${mainMenu.Item}.gpfocus ${mainMenu.ItemLabel}, ${mainMenu.ItemOuter}.gpfocus ${mainMenu.ItemLabel} {
  font-weight: 700 !important;
}
${mainMenu.Item}${mainMenu.Active} ${mainMenu.ItemIcon} {
  color: var(--xbd-accent) !important;
}
${mainMenu.Item}.gpfocus *, ${mainMenu.ItemOuter}.gpfocus ${mainMenu.Item} * {
  color: #000 !important;
  fill: #000 !important;
}
${mainMenu.Item}${mainMenu.Active} {
  box-shadow: inset 4px 0 0 var(--xbd-accent);
}
${mainMenu.ActiveDot} {
  display: none !important;
}
${mainMenu.CurrentUserAvatar} {
  border-radius: 50% !important;
  box-shadow: 0 0 0 2px var(--xbd-accent);
}
${qam.Tabs} {
  background: #161616 !important;
}
${qam.TabGroupPanel} {
  background: var(--xbd-panel) !important;
}
${qam.Tab} {
  border-radius: var(--xbd-radius) !important;
  transition: background-color 120ms ease, transform 140ms ease;
}
${qam.Tab}.gpfocus {
  transform: scale(1.06);
}
${qamControls.PanelSectionTitle} {
  color: var(--xbd-accent) !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em;
}
${qamControls.PanelSection} {
  border-radius: calc(var(--xbd-radius) * 1.5);
  background: rgba(255,255,255,0.03);
  margin-bottom: 6px;
}
${qam.Tab}${qam.Selected} {
  background: var(--xbd-accent-soft) !important;
  box-shadow: inset 3px 0 0 var(--xbd-accent);
}
${qam.Tab}.gpfocus {
  background: #fff !important;
}
${qam.Tab}.gpfocus svg, ${qam.Tab}.gpfocus * {
  color: #000 !important;
  fill: #000 !important;
}
${dialog.Field}.gpfocus {
  box-shadow: inset 0 0 0 2px #fff;
  border-radius: var(--xbd-radius);
}

/* Power menu and every "…" menu: dark Guide panel, accent stripe, white focus, red for destructive. */
${ctx.contextMenu} {
  background: linear-gradient(180deg, rgba(30,30,30,0.98), rgba(16,16,16,0.98)) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: calc(var(--xbd-radius) * 2) !important;
  box-shadow: 0 18px 50px rgba(0,0,0,0.65) !important;
  overflow: hidden;
}
${ctx.contextMenu}::before {
  content: "";
  display: block;
  height: 3px;
  background: var(--xbd-accent);
}
${ctx.contextMenuItem} {
  border-radius: var(--xbd-radius) !important;
  margin: 2px 8px !important;
  transition: background-color 120ms ease, transform 140ms ease;
}
${ctx.contextMenuItem}:is(${ctx.Focused}, .gpfocus) {
  background: #fff !important;
  color: #000 !important;
  transform: translateX(3px);
}
${ctx.contextMenuItem}${ctx.Destructive} {
  color: #ff7a7a !important;
}
${ctx.contextMenuItem}${ctx.Destructive}:is(${ctx.Focused}, .gpfocus) {
  background: #e81123 !important;
  color: #fff !important;
}
${ctx.MenuSectionHeader} {
  color: var(--xbd-accent) !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
${ctx.ContextMenuSeparator} {
  background: rgba(255,255,255,0.1) !important;
}`);
  }

  // ---------- Menu animations: transform/opacity only, so they stay on the GPU ----------
  if (st.guide && st.effects) {
    const stagger = (sel: string, count: number, stepMs: number) =>
      Array.from({ length: count }, (_, i) => `${sel}:nth-child(${i + 1}) { animation-delay: ${i * stepMs}ms; }`).join("\n");
    parts.push(`
@keyframes xbd-menu-in { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
@keyframes xbd-pop-in { from { opacity: 0; transform: translateY(6px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes xbd-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
${mainMenu.Open} ${mainMenu.ItemOuter} {
  animation: xbd-menu-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
${stagger(`${mainMenu.Open} ${mainMenu.ItemOuter}`, 12, 18)}
${ctx.contextMenu} {
  animation: xbd-pop-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  transform-origin: top center;
}
${qam.TabGroupPanel} ${qamControls.PanelSection} {
  animation: xbd-fade-up 200ms ease-out both;
}
${stagger(`${qam.TabGroupPanel} ${qamControls.PanelSection}`, 6, 30)}
@media (prefers-reduced-motion: reduce) {
  ${mainMenu.ItemOuter}, ${ctx.contextMenu}, ${qamControls.PanelSection} { animation: none !important; }
}`);
  }

  // ---------- Cleaner home, closer to the Xbox one ----------
  if (st.hideShelves) {
    parts.push(`
${s.whatsNew.LibraryHomeWhatsNew}, ${s.friends.LibraryHomeFriends}, ${s.playNext.PlayNextCarousel} {
  display: none !important;
}`);
  }

  return parts.join("\n");
}
