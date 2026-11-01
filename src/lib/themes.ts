export const SITE_THEMES = [
  "default",
  "newyear",
  "valentine",
  "carnival",
  "stpatrick",
  "easter",
  "spring",
  "summer",
  "bastille",
  "backtoschool",
  "autumn",
  "halloween",
  "christmas",
  "winter",
] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

export interface ThemeMeta {
  id: SiteTheme;
  label: string;
  description: string;
  accent: string;
  when: string;
}

export const THEME_CATALOG: readonly ThemeMeta[] = [
  { id: "default", label: "Groupe", description: "Magenta et cyan néon.", accent: "#c84bff", when: "Toute l'année" },
  { id: "newyear", label: "Nouvel An", description: "Or et confettis.", accent: "#ffd700", when: "Décembre – janvier" },
  { id: "valentine", label: "Saint-Valentin", description: "Rose et rouge.", accent: "#ff4d6d", when: "14 février" },
  { id: "carnival", label: "Carnaval", description: "Couleurs vives.", accent: "#ff6b35", when: "Février – mars" },
  { id: "stpatrick", label: "Saint-Patrick", description: "Vert émeraude.", accent: "#22c55e", when: "17 mars" },
  { id: "easter", label: "Pâques", description: "Pastel printanier.", accent: "#f9a8d4", when: "Mars – avril" },
  { id: "spring", label: "Printemps", description: "Fleurs et verdure.", accent: "#86efac", when: "Mars – mai" },
  { id: "summer", label: "Été", description: "Soleil et vagues.", accent: "#38bdf8", when: "Juin – août" },
  { id: "bastille", label: "14 Juillet", description: "Bleu-blanc-rouge.", accent: "#ef4444", when: "14 juillet" },
  { id: "backtoschool", label: "Rentrée", description: "Crayons et cahiers.", accent: "#f59e0b", when: "Septembre" },
  { id: "autumn", label: "Automne", description: "Feuilles et orange.", accent: "#ea580c", when: "Septembre – novembre" },
  { id: "halloween", label: "Halloween", description: "Citrouilles et fantômes.", accent: "#ff7a18", when: "31 octobre" },
  { id: "christmas", label: "Noël", description: "Sapin et guirlandes.", accent: "#e63946", when: "Décembre" },
  { id: "winter", label: "Hiver", description: "Neige bleutée.", accent: "#7dd3fc", when: "Décembre – février" },
];

export function isSiteTheme(value: unknown): value is SiteTheme {
  return typeof value === "string" && (SITE_THEMES as readonly string[]).includes(value);
}

export function themeLabel(id: SiteTheme): string {
  return THEME_CATALOG.find((item) => item.id === id)?.label ?? id;
}
