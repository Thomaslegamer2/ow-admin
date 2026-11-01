import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isSiteTheme, THEME_CATALOG, type SiteTheme } from "@/lib/themes";

export const SITE_IDS = ["omnaworks", "audiova", "videova"] as const;
export type SiteId = (typeof SITE_IDS)[number];

export interface SiteFlags {
  theme: SiteTheme | null;
  adsEnabled: boolean;
  analyticsEnabled: boolean;
  urlImportEnabled: boolean;
  discordEnabled: boolean;
  publicUrl: string;
}

export interface HubConfig {
  version: 1;
  updatedAt: string | null;
  theme: SiteTheme;
  discordUrl: string;
  sites: Record<SiteId, SiteFlags>;
}

export interface ResolvedSite {
  id: SiteId;
  theme: SiteTheme;
  themeSource: "global" | "site";
  adsEnabled: boolean;
  analyticsEnabled: boolean;
  urlImportEnabled: boolean;
  discordEnabled: boolean;
  discordUrl: string;
  publicUrl: string;
  updatedAt: string | null;
}

const DATA_DIR = path.join(process.cwd(), "data");
const HUB_PATH = path.join(DATA_DIR, "hub.json");
const PUBLIC_MIRROR = path.join(process.cwd(), "public", "hub-theme.json");

function defaultSite(publicUrl = ""): SiteFlags {
  return {
    theme: null,
    adsEnabled: false,
    analyticsEnabled: true,
    urlImportEnabled: true,
    discordEnabled: true,
    publicUrl,
  };
}

export const DEFAULT_HUB: HubConfig = {
  version: 1,
  updatedAt: null,
  theme: "default",
  discordUrl: "https://discord.gg/hWgakkRBcc",
  sites: {
    omnaworks: defaultSite("http://localhost:3010"),
    audiova: defaultSite("http://localhost:3001"),
    videova: defaultSite("http://localhost:3000"),
  },
};

export function isSiteId(value: unknown): value is SiteId {
  return typeof value === "string" && (SITE_IDS as readonly string[]).includes(value);
}

function parseSite(raw: unknown, fallbackUrl: string): SiteFlags {
  const base = defaultSite(fallbackUrl);
  if (!raw || typeof raw !== "object") return base;
  const record = raw as Record<string, unknown>;
  return {
    theme: record.theme === null ? null : isSiteTheme(record.theme) ? record.theme : null,
    adsEnabled: record.adsEnabled === true,
    analyticsEnabled: record.analyticsEnabled !== false,
    urlImportEnabled: record.urlImportEnabled !== false,
    discordEnabled: record.discordEnabled !== false,
    publicUrl: typeof record.publicUrl === "string" ? record.publicUrl : fallbackUrl,
  };
}

export function parseHub(raw: string | null): HubConfig {
  if (!raw) return structuredClone(DEFAULT_HUB);
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return structuredClone(DEFAULT_HUB);
    const record = parsed as Record<string, unknown>;
    const sitesRaw = record.sites && typeof record.sites === "object" ? (record.sites as Record<string, unknown>) : {};
    return {
      version: 1,
      updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null,
      theme: isSiteTheme(record.theme) ? record.theme : "default",
      discordUrl:
        typeof record.discordUrl === "string" && record.discordUrl.startsWith("http")
          ? record.discordUrl
          : DEFAULT_HUB.discordUrl,
      sites: {
        omnaworks: parseSite(sitesRaw.omnaworks, DEFAULT_HUB.sites.omnaworks.publicUrl),
        audiova: parseSite(sitesRaw.audiova, DEFAULT_HUB.sites.audiova.publicUrl),
        videova: parseSite(sitesRaw.videova, DEFAULT_HUB.sites.videova.publicUrl),
      },
    };
  } catch {
    return structuredClone(DEFAULT_HUB);
  }
}

export async function readHub(): Promise<HubConfig> {
  try {
    return parseHub(await readFile(HUB_PATH, "utf8"));
  } catch {
    return structuredClone(DEFAULT_HUB);
  }
}

async function persist(config: HubConfig): Promise<HubConfig> {
  const next: HubConfig = { ...config, version: 1, updatedAt: new Date().toISOString() };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(HUB_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await writeFile(
    PUBLIC_MIRROR,
    `${JSON.stringify({
      theme: next.theme,
      updatedAt: next.updatedAt,
      discordUrl: next.discordUrl,
      sites: Object.fromEntries(SITE_IDS.map((id) => [id, resolveSite(next, id)])),
    })}\n`,
    "utf8",
  );
  return next;
}

export function resolveSite(config: HubConfig, id: SiteId): ResolvedSite {
  const site = config.sites[id] ?? defaultSite();
  return {
    id,
    theme: site.theme ?? config.theme,
    themeSource: site.theme ? "site" : "global",
    adsEnabled: site.adsEnabled,
    analyticsEnabled: site.analyticsEnabled,
    urlImportEnabled: site.urlImportEnabled,
    discordEnabled: site.discordEnabled,
    discordUrl: config.discordUrl,
    publicUrl: site.publicUrl,
    updatedAt: config.updatedAt,
  };
}

export function hubSnapshot(config: HubConfig) {
  return {
    version: config.version,
    updatedAt: config.updatedAt,
    theme: config.theme,
    discordUrl: config.discordUrl,
    catalog: THEME_CATALOG,
    sites: {
      omnaworks: resolveSite(config, "omnaworks"),
      audiova: resolveSite(config, "audiova"),
      videova: resolveSite(config, "videova"),
    },
  };
}

export async function writeGlobalTheme(theme: SiteTheme): Promise<HubConfig> {
  const current = await readHub();
  return persist({ ...current, theme });
}

export async function writeDiscord(discordUrl: string): Promise<HubConfig> {
  const current = await readHub();
  return persist({ ...current, discordUrl });
}

export async function writeSite(id: SiteId, partial: Partial<SiteFlags>): Promise<HubConfig> {
  const current = await readHub();
  const previous = current.sites[id] ?? defaultSite();
  const nextSite: SiteFlags = {
    ...previous,
    ...partial,
    theme:
      partial.theme === null
        ? null
        : partial.theme !== undefined
          ? isSiteTheme(partial.theme)
            ? partial.theme
            : previous.theme
          : previous.theme,
  };
  return persist({ ...current, sites: { ...current.sites, [id]: nextSite } });
}
