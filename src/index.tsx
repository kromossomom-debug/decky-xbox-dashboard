import { callable, definePlugin, routerHook } from "@decky/api";
import {
  ButtonItem,
  DropdownItem,
  Navigation,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
  staticClasses,
} from "@decky/ui";
import { useState } from "react";
import { FaCoffee, FaXbox } from "react-icons/fa";

import { resolveClasses, ResolvedClasses } from "./classes";
import { Fallback } from "./components";
import { applyCss, removeCss } from "./injector";
import { ACCENTS, BackgroundMode, accentColor, DEFAULT_SETTINGS, FocusStyle, Settings, withDefaults } from "./settings";
import { MY_GAMES_ROUTE, openDonate } from "./steam";
import { buildCss } from "./theme";
import { XboxShell } from "./Shell";

const getSettings = callable<[], Partial<Settings>>("get_settings");
const setSettings = callable<[settings: Settings], boolean>("set_settings");

/** Some Steam class modules load lazily (e.g. home shelves), so keep looking for a while after start. */
const RESOLVE_RETRY_MS = 5000;
const RESOLVE_RETRY_MAX = 24;

let settings: Settings = DEFAULT_SETTINGS;
let classes: ResolvedClasses = resolveClasses();
let retryTimer: number | undefined;
let unloaded = false;

const HOME_ROUTE = "/library/home";
const MyGamesRoute = () => <XboxShell initialTab="games" />;
type RoutePatch = Parameters<typeof routerHook.addPatch>[1];
let homePatch: RoutePatch | undefined;

/** Swaps Steam's home for the Xbox one, or puts Steam's back, to match the settings. */
function syncHomePatch() {
  const want = !unloaded && settings.enabled && settings.xboxHome;
  if (want && !homePatch) {
    homePatch = routerHook.addPatch(HOME_ROUTE, (props) => ({
      ...props,
      children: (
        <Fallback fallback={props.children}>
          <XboxShell initialTab="home" />
        </Fallback>
      ),
      component: undefined,
      render: undefined,
    }));
  } else if (!want && homePatch) {
    routerHook.removePatch(HOME_ROUTE, homePatch);
    homePatch = undefined;
  }
}

function render() {
  syncHomePatch();
  if (unloaded) return;
  if (settings.enabled) applyCss(buildCss(settings, classes.sel), settings.palette ? accentColor(settings.accent) : null);
  else removeCss();
}

function startClassRetry() {
  let tries = 0;
  retryTimer = window.setInterval(() => {
    tries++;
    const next = resolveClasses();
    if (next.missing.length < classes.missing.length) {
      classes = next;
      render();
    }
    if (classes.missing.length === 0 || tries >= RESOLVE_RETRY_MAX) {
      window.clearInterval(retryTimer);
      retryTimer = undefined;
    }
  }, RESOLVE_RETRY_MS);
}

function update(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  render();
  setSettings(settings).catch((e) => console.error("[xbox-dashboard] save failed", e));
}

function Content() {
  const [st, setSt] = useState<Settings>(settings);
  const change = (patch: Partial<Settings>) => {
    update(patch);
    setSt(settings);
  };

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <ToggleField
            label="Ativar visual Xbox"
            description="Aplica o layout do dashboard do Xbox Series X|S no Modo Jogo."
            checked={st.enabled}
            onChange={(enabled) => change({ enabled })}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Telas Xbox">
        <PanelSectionRow>
          <ToggleField
            label="Tela inicial Xbox"
            description="Troca a tela inicial da Steam por uma igual à do Xbox: arte do jogo, Recentes, Fixados e Instalados."
            checked={st.xboxHome}
            onChange={(xboxHome) => change({ xboxHome })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => Navigation.Navigate(MY_GAMES_ROUTE)}>
            Abrir Meus jogos e apps
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Aparência">
        <PanelSectionRow>
          <ToggleField
            label="Cores do Xbox em tudo"
            description="Troca o azul da Steam pela cor de destaque e os cinzas azulados pelos cinzas neutros do Xbox, em menus, botões e páginas."
            checked={st.palette}
            onChange={(palette) => change({ palette })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label="Cor de destaque"
            rgOptions={ACCENTS.map((a) => ({ data: a.id, label: a.label }))}
            selectedOption={st.accent}
            onChange={(o) => change({ accent: o.data })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label="Fundo da tela inicial"
            rgOptions={[
              { data: "art", label: "Arte do jogo (Series X|S)" },
              { data: "gradient", label: "Gradiente na cor de destaque" },
              { data: "dark", label: "Escuro" },
            ]}
            selectedOption={st.background}
            onChange={(o) => change({ background: o.data as BackgroundMode })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label="Foco"
            rgOptions={[
              { data: "white", label: "Borda branca (Series X|S)" },
              { data: "accent", label: "Borda na cor de destaque" },
            ]}
            selectedOption={st.focus}
            onChange={(o) => change({ focus: o.data as FocusStyle })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label="Espaço para a arte"
            description="Só para a tela inicial da Steam (com a Tela inicial Xbox desligada)."
            value={st.heroSpace}
            min={0}
            max={40}
            step={2}
            showValue
            valueSuffix="vh"
            onChange={(heroSpace) => change({ heroSpace })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label="Arredondamento dos blocos"
            value={st.radius}
            min={0}
            max={16}
            step={1}
            showValue
            valueSuffix="px"
            onChange={(radius) => change({ radius })}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Layout">
        <PanelSectionRow>
          <ToggleField
            label="Menus estilo Guia Xbox"
            description="Menu Steam e Acesso Rápido com painel escuro e destaque colorido."
            checked={st.guide}
            onChange={(guide) => change({ guide })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label="Tela inicial limpa"
            description="Esconde Novidades, Amigos e Recomendados abaixo dos jogos recentes."
            checked={st.hideShelves}
            onChange={(hideShelves) => change({ hideShelves })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label="Fonte estilo Segoe"
            checked={st.font}
            onChange={(font) => change({ font })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => change({ ...DEFAULT_SETTINGS })}>
            Restaurar padrões
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Apoie o projeto">
        <PanelSectionRow>
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>
            Curtiu o plugin? Pague um café para o autor e ajude a manter as atualizações.
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={openDonate}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <FaCoffee /> Buy Me a Coffee
            </span>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

export default definePlugin(() => {
  unloaded = false;
  routerHook.addRoute(MY_GAMES_ROUTE, MyGamesRoute, { exact: true });
  startClassRetry();
  // Render only once stored settings are in, so a disabled theme never flashes on at boot.
  getSettings()
    .then((stored) => {
      settings = withDefaults(stored);
    })
    .catch((e) => console.error("[xbox-dashboard] load failed", e))
    .finally(render);

  return {
    name: "Xbox Dashboard",
    titleView: <div className={staticClasses.Title}>Xbox Dashboard</div>,
    content: <Content />,
    icon: <FaXbox />,
    onDismount() {
      unloaded = true;
      if (retryTimer !== undefined) window.clearInterval(retryTimer);
      syncHomePatch();
      routerHook.removeRoute(MY_GAMES_ROUTE);
      removeCss();
    },
  };
});
