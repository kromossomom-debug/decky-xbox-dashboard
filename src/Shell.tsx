import { Focusable, GamepadButton, GamepadEvent, Navigation } from "@decky/ui";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FaSteam } from "react-icons/fa";
import { MdChat, MdDownload, MdGroup, MdLocalOffer, MdMail, MdPhotoLibrary, MdPowerSettingsNew, MdSearch, MdSettings, MdStore, MdTune, MdFavorite, MdPublic } from "react-icons/md";

import { Card, FOCUSED_CLASS, useFocusReveal } from "./components";
import { GamesTab } from "./MyGames";
import { ROUTES, openStore, persona } from "./steam";
import { XBOX_CSS } from "./styles";
import { HomeTab } from "./XboxHome";

export type TabId = "home" | "games" | "store" | "community" | "system";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Início" },
  { id: "games", label: "Meus jogos e apps" },
  { id: "store", label: "Loja" },
  { id: "community", label: "Comunidade" },
  { id: "system", label: "Sistema" },
];

interface CardDef {
  icon: ReactNode;
  title: string;
  description: string;
  go: () => void;
}

const steamWeb = (url: string) => () => Navigation.NavigateToSteamWeb(url);

const CARD_TABS: Partial<Record<TabId, CardDef[]>> = {
  store: [
    { icon: <MdStore />, title: "Loja Steam", description: "Destaques, lançamentos e recomendações", go: () => openStore() },
    { icon: <MdLocalOffer />, title: "Ofertas", description: "Jogos em promoção agora", go: () => openStore("specials") },
    { icon: <MdFavorite />, title: "Lista de desejos", description: "O que você está de olho", go: () => openStore("wishlist") },
    { icon: <MdSearch />, title: "Pesquisar", description: "Jogos, apps e amigos", go: () => Navigation.Navigate(ROUTES.search) },
    { icon: <MdDownload />, title: "Downloads", description: "Fila e atualizações", go: () => Navigation.Navigate(ROUTES.downloads) },
  ],
  community: [
    { icon: <MdChat />, title: "Amigos e chat", description: "Conversas e quem está on-line", go: () => Navigation.NavigateToChat() },
    { icon: <MdMail />, title: "Convites", description: "Convites de amizade e de grupos", go: () => Navigation.NavigateToInvites() },
    { icon: <MdGroup />, title: "Comunidade Steam", description: "Atividade, guias e discussões", go: steamWeb("https://steamcommunity.com/") },
    { icon: <MdPublic />, title: "Meu perfil", description: "Seu perfil na Steam", go: steamWeb("https://steamcommunity.com/my/") },
  ],
  system: [
    { icon: <MdSettings />, title: "Configurações", description: "Sistema, tela, áudio e controles", go: () => Navigation.Navigate(ROUTES.settings) },
    { icon: <MdPhotoLibrary />, title: "Capturas e mídia", description: "Capturas de tela e gravações", go: () => Navigation.Navigate(ROUTES.media) },
    { icon: <FaSteam />, title: "Biblioteca Steam", description: "A biblioteca original da Steam", go: () => Navigation.Navigate(ROUTES.library) },
    { icon: <MdTune />, title: "Acesso rápido", description: "Desempenho, brilho, plugins", go: () => Navigation.OpenQuickAccessMenu() },
    { icon: <MdPowerSettingsNew />, title: "Energia", description: "Suspender, reiniciar ou desligar", go: () => Navigation.OpenPowerMenu() },
  ],
};

function CardsTab({ cards }: { cards: CardDef[] }) {
  return (
    <Focusable className="xbd-page xbd-cards" flow-children="grid">
      {cards.map((c, i) => (
        <Card key={c.title} icon={c.icon} title={c.title} description={c.description} accent={i === 0} preferredFocus={i === 0} onActivate={c.go} />
      ))}
    </Focusable>
  );
}

function ProfileBar() {
  const me = useMemo(persona, []);
  return (
    <div className="xbd-profile">
      {me.avatar ? <img className="xbd-avatar" src={me.avatar} /> : <div className="xbd-avatar" />}
      <span className="xbd-gamertag">{me.name}</span>
    </div>
  );
}

function TabBar({ tab, onSelect }: { tab: TabId; onSelect: (t: TabId) => void }) {
  return (
    <div className="xbd-tabbar">
      <span className="xbd-bumper">LB</span>
      {TABS.map((t) => (
        <div key={t.id} className={`xbd-tab ${t.id === tab ? "xbd-tab-active" : ""}`} onClick={() => onSelect(t.id)}>
          {t.label}
        </div>
      ))}
      <span className="xbd-bumper">RB</span>
    </div>
  );
}

/** The Xbox dashboard: a tab bar on top (LB/RB to switch, like the Xbox) and one page per tab. */
export function XboxShell({ initialTab = "home" }: { initialTab?: TabId }) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const root = useRef<HTMLDivElement>(null);
  const contentNav = useRef<any>(null);
  const firstRender = useRef(true);
  useFocusReveal(root);

  // Moving to another tab unmounts the focused tile, so hand focus to the new page's first item.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      try {
        contentNav.current?.TakeFocus?.();
      } catch (e) {
        console.error("[xbox-dashboard] TakeFocus failed", e);
      }
      if (!root.current?.querySelector(`.${FOCUSED_CLASS}`)) {
        (root.current?.querySelector(".xbd-page .xbd-tile, .xbd-page .xbd-card, .xbd-page .xbd-side-item") as HTMLElement | null)?.focus();
      }
    }, 30);
    return () => window.clearTimeout(t);
  }, [tab]);

  const step = (dir: 1 | -1) => {
    const i = TABS.findIndex((t) => t.id === tab);
    setTab(TABS[(i + dir + TABS.length) % TABS.length].id);
  };

  const onButtonDown = (e: GamepadEvent) => {
    const button = e.detail?.button;
    if (button === GamepadButton.BUMPER_LEFT) step(-1);
    else if (button === GamepadButton.BUMPER_RIGHT) step(1);
  };

  const cards = CARD_TABS[tab];
  return (
    <div className={`xbd-root xbd-tab-${tab}`} ref={root}>
      <style>{XBOX_CSS}</style>
      <ProfileBar />
      <TabBar tab={tab} onSelect={setTab} />
      <Focusable
        key={tab}
        className="xbd-content"
        {...({ navRef: contentNav } as any)}
        onButtonDown={onButtonDown}
        onCancelButton={tab === "home" ? undefined : () => setTab("home")}
        onCancelActionDescription={tab === "home" ? undefined : "Início"}
        actionDescriptionMap={{
          [GamepadButton.BUMPER_LEFT]: "Aba anterior",
          [GamepadButton.BUMPER_RIGHT]: "Próxima aba",
        }}
      >
        {tab === "home" && <HomeTab goTab={setTab} />}
        {tab === "games" && <GamesTab />}
        {cards && <CardsTab cards={cards} />}
      </Focusable>
    </div>
  );
}
