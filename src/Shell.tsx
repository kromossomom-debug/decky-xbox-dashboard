import { Focusable, GamepadButton, GamepadEvent, Navigation } from "@decky/ui";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FaSteam } from "react-icons/fa";
import { MdChat, MdDownload, MdGroup, MdLocalOffer, MdMail, MdPhotoLibrary, MdPowerSettingsNew, MdSearch, MdSettings, MdStore, MdTune, MdFavorite, MdPublic } from "react-icons/md";

import { Card, FOCUSED_CLASS, useFocusReveal } from "./components";
import { GamesTab } from "./MyGames";
import { t } from "./i18n";
import { ROUTES, openStore, persona } from "./steam";
import { useRootVars } from "./store";
import { XBOX_CSS } from "./styles";
import { HomeTab } from "./XboxHome";

export type TabId = "home" | "games" | "store" | "community" | "system";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: t.tabHome },
  { id: "games", label: t.tabGames },
  { id: "store", label: t.tabStore },
  { id: "community", label: t.tabCommunity },
  { id: "system", label: t.tabSystem },
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
    { icon: <MdStore />, title: t.storeTitle, description: t.storeDesc, go: () => openStore() },
    { icon: <MdLocalOffer />, title: t.specialsTitle, description: t.specialsDesc, go: () => openStore("specials") },
    { icon: <MdFavorite />, title: t.wishlistTitle, description: t.wishlistDesc, go: () => openStore("wishlist") },
    { icon: <MdSearch />, title: t.search, description: t.searchDesc, go: () => Navigation.Navigate(ROUTES.search) },
    { icon: <MdDownload />, title: t.downloads, description: t.downloadsDesc, go: () => Navigation.Navigate(ROUTES.downloads) },
  ],
  community: [
    { icon: <MdChat />, title: t.chatTitle, description: t.chatDesc, go: () => Navigation.NavigateToChat() },
    { icon: <MdMail />, title: t.invitesTitle, description: t.invitesDesc, go: () => Navigation.NavigateToInvites() },
    { icon: <MdGroup />, title: t.communityTitle, description: t.communityDesc, go: steamWeb("https://steamcommunity.com/") },
    { icon: <MdPublic />, title: t.profileTitle, description: t.profileDesc, go: steamWeb("https://steamcommunity.com/my/") },
  ],
  system: [
    { icon: <MdSettings />, title: t.settings, description: t.settingsDesc, go: () => Navigation.Navigate(ROUTES.settings) },
    { icon: <MdPhotoLibrary />, title: t.media, description: t.mediaDesc, go: () => Navigation.Navigate(ROUTES.media) },
    { icon: <FaSteam />, title: t.steamLibrary, description: t.libraryDesc, go: () => Navigation.Navigate(ROUTES.library) },
    { icon: <MdTune />, title: t.quickAccessTitle, description: t.quickAccessDesc, go: () => Navigation.OpenQuickAccessMenu() },
    { icon: <MdPowerSettingsNew />, title: t.powerTitle, description: t.powerDesc, go: () => Navigation.OpenPowerMenu() },
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
  const rootVars = useRootVars();
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
    <div className={`xbd-root xbd-tab-${tab}`} ref={root} style={rootVars}>
      <style>{XBOX_CSS}</style>
      <ProfileBar />
      <TabBar tab={tab} onSelect={setTab} />
      <Focusable
        key={tab}
        className="xbd-content"
        {...({ navRef: contentNav } as any)}
        onButtonDown={onButtonDown}
        onCancelButton={tab === "home" ? undefined : () => setTab("home")}
        onCancelActionDescription={tab === "home" ? undefined : t.tabHome}
        actionDescriptionMap={{
          [GamepadButton.BUMPER_LEFT]: t.prevTab,
          [GamepadButton.BUMPER_RIGHT]: t.nextTab,
        }}
      >
        {tab === "home" && <HomeTab goTab={setTab} />}
        {tab === "games" && <GamesTab />}
        {cards && <CardsTab cards={cards} />}
      </Focusable>
    </div>
  );
}
