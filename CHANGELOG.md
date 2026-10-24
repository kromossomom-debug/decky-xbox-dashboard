# Changelog

All notable changes to Xbox Dashboard. Versions are alphas: install the ZIP from each release with
Decky's **Developer → Install Plugin from ZIP**.

## [0.0.6-alpha] - 2026-10-24

### Fixed
- **Tile corner radius really works now.** Steam registers its own CSS variable called `--r` as an
  angle, so the plugin's `--r: 25px` was thrown away and every corner came out at 0. The plugin's
  variables are now `--xbd-r`, `--xbd-a` and `--xbd-f`. Checked in Big Picture: 25 px in the
  settings gives 25 px tiles.
- **Power menu** (Sleep / Shut down / Restart) no longer turns red: the selected item uses the
  accent color (Xbox green), Shut down and Restart included.
- The selected power menu item no longer pokes out of the right edge of the panel.

### Changed
- **Power menu looks like the Xbox power options**: one solid dark panel with an accent stripe on
  top, a bold title above it, roomy rows instead of separate pills, and the selected row filled
  with the accent color and a white ring.

## [0.0.5-alpha] - 2026-10-24

### Added
- **Main row source**: choose what fills Home's big first row: recently played, pinned, installed,
  favorites or any of your collections (plugin panel → **Home rows → Main row**).
- **Customize Home games**: a new page with every game that can show on Home. **A** hides or shows a
  game, **X** pins or unpins it, **B** goes back. Hidden games are dimmed with a “Hidden” badge,
  pinned ones get a pin and a “Pinned” badge.
- **Unhide all**: a button in the panel brings every hidden game back at once (only shown when
  something is hidden).

### Fixed
- **Tile corner radius** now always applies on the plugin's own screens (Home, My games & apps, game
  page). The slider goes up to **32 px**, and the focus ring follows the corners.

### Changed
- **Reset to defaults** keeps your pinned and hidden games.

## [0.0.4-alpha] - 2026-10-24

### Added
- **Menu effects** (on by default, can be turned off): Steam menu items slide in one after another,
  the power menu pops in, Quick Access sections fade up. Transform and opacity only, so they stay on
  the GPU, and they respect the system's reduce-motion setting.
- **Power menu and “…” menus** in the Guide style: dark rounded panel with an accent stripe, white
  focus, and red for destructive actions such as Shut down.
- **Quick Access** polish: accent section titles, soft section cards, tabs that grow on focus.

### Fixed
- **Achievements** card on the game page opened an empty, dimmed screen. It now opens your
  achievements.
- The **Steam menu** barely changed in Game Mode: Steam has three builds of that menu and only one
  was styled. All of them are styled now (and both builds of the context menus).

### Changed
- The Steam menu panel gets a soft accent glow, the focused item slides slightly and goes bold, and
  the current page's icon is tinted with the accent color.

## [0.0.3-alpha] - 2026-10-24

### Fixed
- **HowLongToBeat** never showed on the Deck: Decky's bundled Python has no CA certificates, so every
  lookup failed with `CERTIFICATE_VERIFY_FAILED`. Lookups now use the system certificate bundle.
- A HowLongToBeat lookup that comes back empty is retried the next time you open the game, instead of
  staying empty until Steam restarts.

### Changed
- Releases are now built and published automatically by GitHub Actions when a version tag is pushed.

## [0.0.2-alpha] - 2026-10-24

### Added
- **HowLongToBeat** times on the game page (main story, main + extras, completionist, and how far your
  playtime is into the story) and “≈ 20 h to beat” on Home.
- **Pin to Home** with **X** on any tile or the pin button on the game page.
- **Home rows**: turn Pinned, Installed and Shortcuts on or off, plus one extra collection row.
- **My games & apps** draws tiles in batches, so big libraries open quickly.
- Bug report form for GitHub issues.

## [0.0.1-alpha] - 2026-10-24

First public alpha: Xbox-style Home, LB / RB tabs, My games & apps, game page, Guide-style menus,
Xbox colors across Steam, English and Portuguese, and a Buy Me a Coffee button.

[0.0.6-alpha]: https://github.com/kromossomom-debug/decky-xbox-dashboard/compare/v0.0.5-alpha...v0.0.6-alpha
[0.0.5-alpha]: https://github.com/kromossomom-debug/decky-xbox-dashboard/compare/v0.0.4-alpha...v0.0.5-alpha
[0.0.4-alpha]: https://github.com/kromossomom-debug/decky-xbox-dashboard/compare/v0.0.3-alpha...v0.0.4-alpha
[0.0.3-alpha]: https://github.com/kromossomom-debug/decky-xbox-dashboard/compare/v0.0.2-alpha...v0.0.3-alpha
[0.0.2-alpha]: https://github.com/kromossomom-debug/decky-xbox-dashboard/compare/v0.0.1-alpha...v0.0.2-alpha
[0.0.1-alpha]: https://github.com/kromossomom-debug/decky-xbox-dashboard/releases/tag/v0.0.1-alpha
