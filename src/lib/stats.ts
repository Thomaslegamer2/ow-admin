import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { accountCount } from "@/lib/accounts";
import { readHub, SITE_IDS } from "@/lib/hub";

export interface StatsEvent {
  id: string;
  site: string;
  type: string;
  at: string;
  meta?: Record<string, string | number | boolean | null>;
}

const DATA_DIR = path.join(process.cwd(), "data", "stats");

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function dayPath(day: string): string {
  return path.join(DATA_DIR, `${day}.json`);
}

async function readDay(day: string): Promise<StatsEvent[]> {
  try {
    const raw = await readFile(dayPath(day), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StatsEvent => Boolean(item && typeof item === "object"));
  } catch {
    return [];
  }
}

async function writeDay(day: string, events: StatsEvent[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(dayPath(day), `${JSON.stringify(events, null, 2)}\n`, "utf8");
}

export async function ingestEvent(input: {
  site: string;
  type: string;
  meta?: Record<string, string | number | boolean | null>;
}): Promise<StatsEvent> {
  const day = dayKey();
  const events = await readDay(day);
  const event: StatsEvent = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    site: input.site,
    type: input.type.slice(0, 64),
    at: new Date().toISOString(),
    meta: input.meta,
  };
  events.push(event);
  await writeDay(day, events.slice(-5000));
  return event;
}

export async function buildDashboard() {
  const hub = await readHub();
  const today = dayKey();
  const events = await readDay(today);
  const bySite: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const event of events) {
    bySite[event.site] = (bySite[event.site] ?? 0) + 1;
    byType[event.type] = (byType[event.type] ?? 0) + 1;
  }

  let daysAvailable = 0;
  try {
    daysAvailable = (await readdir(DATA_DIR)).filter((name) => name.endsWith(".json")).length;
  } catch {
    daysAvailable = 0;
  }

  const memory = process.memoryUsage();

  return {
    generatedAt: new Date().toISOString(),
    accounts: await accountCount(),
    theme: hub.theme,
    discordUrl: hub.discordUrl,
    sites: SITE_IDS.map((id) => ({
      id,
      theme: hub.sites[id].theme ?? hub.theme,
      publicUrl: hub.sites[id].publicUrl,
      adsEnabled: hub.sites[id].adsEnabled,
      analyticsEnabled: hub.sites[id].analyticsEnabled,
    })),
    today: {
      day: today,
      events: events.length,
      bySite,
      byType,
      recent: events.slice(-20).reverse(),
    },
    historyDays: daysAvailable,
    runtime: {
      node: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapMb: Math.round(memory.heapUsed / (1024 * 1024)),
    },
  };
}
