/**
 * The plugin's text in English and Portuguese, picked from Steam's own UI language.
 * Steam reloads its whole UI (and this plugin) when the language changes, so it's read once.
 */

const pt = {
  // Quick Access panel
  enableLabel: "Ativar visual Xbox",
  enableDesc: "Aplica o layout do dashboard do Xbox Series X|S no Modo Jogo.",
  screensSection: "Telas Xbox",
  homeLabel: "Tela inicial Xbox",
  homeDesc: "Troca a tela inicial da Steam por uma igual à do Xbox: arte do jogo, Recentes, Fixados e Instalados.",
  openMyGames: "Abrir Meus jogos e apps",
  lookSection: "Aparência",
  paletteLabel: "Cores do Xbox em tudo",
  paletteDesc: "Troca o azul da Steam pela cor de destaque e os cinzas azulados pelos cinzas neutros do Xbox, em menus, botões e páginas.",
  accentLabel: "Cor de destaque",
  backgroundLabel: "Fundo da tela inicial",
  bgArt: "Arte do jogo (Series X|S)",
  bgGradient: "Gradiente na cor de destaque",
  bgDark: "Escuro",
  focusLabel: "Foco",
  focusWhite: "Borda branca (Series X|S)",
  focusAccent: "Borda na cor de destaque",
  heroSpaceLabel: "Espaço para a arte",
  heroSpaceDesc: "Só para a tela inicial da Steam (com a Tela inicial Xbox desligada).",
  radiusLabel: "Arredondamento dos blocos",
  layoutSection: "Layout",
  guideLabel: "Menus estilo Guia Xbox",
  guideDesc: "Menu Steam e Acesso Rápido com painel escuro e destaque colorido.",
  cleanHomeLabel: "Tela inicial limpa",
  cleanHomeDesc: "Esconde Novidades, Amigos e Recomendados abaixo dos jogos recentes.",
  fontLabel: "Fonte estilo Segoe",
  resetDefaults: "Restaurar padrões",
  supportSection: "Apoie o projeto",
  supportText: "Curtiu o plugin? Pague um café para o autor e ajude a manter as atualizações.",

  // Accent colors
  accentXbox: "Verde Xbox",
  accentSeries: "Verde Series X|S",
  accentLime: "Verde-limão",
  accentBlue: "Azul",
  accentRed: "Vermelho",
  accentPurple: "Roxo",
  accentOrange: "Laranja",
  accentPink: "Rosa",
  accentWhite: "Branco",

  // Tabs and buttons
  tabHome: "Início",
  tabGames: "Meus jogos e apps",
  tabStore: "Loja",
  tabCommunity: "Comunidade",
  tabSystem: "Sistema",
  prevTab: "Aba anterior",
  nextTab: "Próxima aba",
  play: "Jogar",
  resume: "Voltar ao jogo",
  open: "Abrir",
  details: "Detalhes",
  select: "Selecionar",
  running: "Em execução",

  // Home rows and shortcuts
  rowPinned: "Fixados",
  rowInstalled: "Instalados",
  rowShortcuts: "Atalhos",
  steamLibrary: "Biblioteca Steam",
  downloads: "Downloads",
  media: "Capturas e mídia",
  search: "Pesquisar",
  settings: "Configurações",

  // My games & apps
  viewGames: "Jogos",
  viewApps: "Apps",
  viewInstalled: "Instalados",
  viewFavorites: "Favoritos",
  viewNonSteam: "Fora da Steam",
  sortRecent: "Ordenar: Recentes",
  sortName: "Ordenar: A–Z",
  empty: "Nada por aqui ainda.",

  // Store, Community and System cards
  storeTitle: "Loja Steam",
  storeDesc: "Destaques, lançamentos e recomendações",
  specialsTitle: "Ofertas",
  specialsDesc: "Jogos em promoção agora",
  wishlistTitle: "Lista de desejos",
  wishlistDesc: "O que você está de olho",
  searchDesc: "Jogos, apps e amigos",
  downloadsDesc: "Fila e atualizações",
  chatTitle: "Amigos e chat",
  chatDesc: "Conversas e quem está on-line",
  invitesTitle: "Convites",
  invitesDesc: "Convites de amizade e de grupos",
  communityTitle: "Comunidade Steam",
  communityDesc: "Atividade, guias e discussões",
  profileTitle: "Meu perfil",
  profileDesc: "Seu perfil na Steam",
  settingsDesc: "Sistema, tela, áudio e controles",
  mediaDesc: "Capturas de tela e gravações",
  libraryDesc: "A biblioteca original da Steam",
  quickAccessTitle: "Acesso rápido",
  quickAccessDesc: "Desempenho, brilho, plugins",
  powerTitle: "Energia",
  powerDesc: "Suspender, reiniciar ou desligar",

  // Game info
  installed: "Instalado",
  notInstalled: "Não instalado",
  playedToday: "Jogado hoje",
  playedYesterday: "Jogado ontem",
  playedDaysAgo: (n: number) => `Jogado há ${n} dias`,
  playedMonthsAgo: (n: number) => (n === 1 ? "Jogado há 1 mês" : `Jogado há ${n} meses`),
  playedOverAYear: "Jogado há mais de um ano",
  minutesPlayed: (n: number) => `${n} min jogados`,
  hoursPlayed: (n: number) => `${n} h jogadas`,
};

export type Strings = typeof pt;

const en: Strings = {
  enableLabel: "Enable Xbox look",
  enableDesc: "Applies the Xbox Series X|S dashboard layout to Game Mode.",
  screensSection: "Xbox screens",
  homeLabel: "Xbox home screen",
  homeDesc: "Replaces Steam's home with one just like the Xbox: game art, Recent, Pinned and Installed.",
  openMyGames: "Open My games & apps",
  lookSection: "Appearance",
  paletteLabel: "Xbox colors everywhere",
  paletteDesc: "Swaps Steam's blue for the accent color and its bluish greys for Xbox's neutral greys, in menus, buttons and pages.",
  accentLabel: "Accent color",
  backgroundLabel: "Home background",
  bgArt: "Game art (Series X|S)",
  bgGradient: "Accent color gradient",
  bgDark: "Dark",
  focusLabel: "Focus",
  focusWhite: "White ring (Series X|S)",
  focusAccent: "Accent color ring",
  heroSpaceLabel: "Space for the art",
  heroSpaceDesc: "Only for Steam's home screen (with Xbox home screen turned off).",
  radiusLabel: "Tile corner radius",
  layoutSection: "Layout",
  guideLabel: "Xbox Guide-style menus",
  guideDesc: "Steam menu and Quick Access with a dark panel and colored highlight.",
  cleanHomeLabel: "Clean home screen",
  cleanHomeDesc: "Hides What's New, Friends and Recommended below the recent games.",
  fontLabel: "Segoe-style font",
  resetDefaults: "Reset to defaults",
  supportSection: "Support the project",
  supportText: "Enjoying the plugin? Buy the author a coffee and help keep it updated.",

  accentXbox: "Xbox green",
  accentSeries: "Series X|S green",
  accentLime: "Lime",
  accentBlue: "Blue",
  accentRed: "Red",
  accentPurple: "Purple",
  accentOrange: "Orange",
  accentPink: "Pink",
  accentWhite: "White",

  tabHome: "Home",
  tabGames: "My games & apps",
  tabStore: "Store",
  tabCommunity: "Community",
  tabSystem: "System",
  prevTab: "Previous tab",
  nextTab: "Next tab",
  play: "Play",
  resume: "Resume",
  open: "Open",
  details: "Details",
  select: "Select",
  running: "Running",

  rowPinned: "Pinned",
  rowInstalled: "Installed",
  rowShortcuts: "Shortcuts",
  steamLibrary: "Steam Library",
  downloads: "Downloads",
  media: "Captures & media",
  search: "Search",
  settings: "Settings",

  viewGames: "Games",
  viewApps: "Apps",
  viewInstalled: "Installed",
  viewFavorites: "Favorites",
  viewNonSteam: "Non-Steam",
  sortRecent: "Sort: Recent",
  sortName: "Sort: A–Z",
  empty: "Nothing here yet.",

  storeTitle: "Steam Store",
  storeDesc: "Featured, new releases and recommendations",
  specialsTitle: "Specials",
  specialsDesc: "Games on sale right now",
  wishlistTitle: "Wishlist",
  wishlistDesc: "What you've got your eye on",
  searchDesc: "Games, apps and friends",
  downloadsDesc: "Queue and updates",
  chatTitle: "Friends & chat",
  chatDesc: "Conversations and who's online",
  invitesTitle: "Invites",
  invitesDesc: "Friend and group invites",
  communityTitle: "Steam Community",
  communityDesc: "Activity, guides and discussions",
  profileTitle: "My profile",
  profileDesc: "Your Steam profile",
  settingsDesc: "System, display, audio and controllers",
  mediaDesc: "Screenshots and recordings",
  libraryDesc: "Steam's original library",
  quickAccessTitle: "Quick Access",
  quickAccessDesc: "Performance, brightness, plugins",
  powerTitle: "Power",
  powerDesc: "Sleep, restart or shut down",

  installed: "Installed",
  notInstalled: "Not installed",
  playedToday: "Played today",
  playedYesterday: "Played yesterday",
  playedDaysAgo: (n: number) => `Played ${n} days ago`,
  playedMonthsAgo: (n: number) => (n === 1 ? "Played 1 month ago" : `Played ${n} months ago`),
  playedOverAYear: "Played over a year ago",
  minutesPlayed: (n: number) => `${n} min played`,
  hoursPlayed: (n: number) => `${n} h played`,
};

/** Steam's UI language, e.g. "pt-br" or "en"; falls back to the browser's. */
function steamLocale(): string {
  try {
    const locales: string[] | undefined = (window as any).LocalizationManager?.GetPreferredLocales?.();
    if (locales?.[0]) return locales[0].toLowerCase();
  } catch {
    // fall through
  }
  try {
    // Steam passes its language name ("brazilian", "portuguese", "english"...) to the UI page.
    const lang = new URLSearchParams(window.location.search).get("LANGUAGE");
    if (lang) return lang === "brazilian" || lang === "portuguese" ? "pt" : lang;
  } catch {
    // fall through
  }
  return (navigator.language || "en").toLowerCase();
}

/** Portuguese for Portuguese-language Steam, English for everything else. */
export const t: Strings = steamLocale().startsWith("pt") ? pt : en;
