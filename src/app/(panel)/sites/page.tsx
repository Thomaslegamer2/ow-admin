"use client";

import { useEffect, useState } from "react";

interface SiteResolved {
  id: string;
  theme: string;
  themeSource: string;
  adsEnabled: boolean;
  analyticsEnabled: boolean;
  urlImportEnabled: boolean;
  discordEnabled: boolean;
  publicUrl: string;
}

interface HubSnapshot {
  discordUrl: string;
  sites: Record<string, SiteResolved>;
}

export default function SitesPage() {
  const [data, setData] = useState<HubSnapshot | null>(null);
  const [discordUrl, setDiscordUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/sites", { cache: "no-store" });
    if (response.ok) {
      const json = (await response.json()) as HubSnapshot;
      setData(json);
      setDiscordUrl(json.discordUrl);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveDiscord = async () => {
    const response = await fetch("/api/admin/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordUrl }),
    });
    if (response.ok) {
      setData((await response.json()) as HubSnapshot);
      setMessage("Discord mis à jour.");
    }
  };

  const toggle = async (site: string, key: string, value: boolean) => {
    const response = await fetch("/api/admin/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, [key]: value }),
    });
    if (response.ok) {
      setData((await response.json()) as HubSnapshot);
    }
  };

  const saveUrl = async (site: string, publicUrl: string) => {
    const response = await fetch("/api/admin/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, publicUrl }),
    });
    if (response.ok) {
      setData((await response.json()) as HubSnapshot);
      setMessage(`URL ${site} enregistrée.`);
    }
  };

  if (!data) {
    return <p className="text-sm text-muted">Chargement des sites…</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs tracking-[0.16em] text-glow uppercase">Sites</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Options par produit</h1>
        {message ? <p className="mt-3 text-sm text-ok">{message}</p> : null}
      </header>

      <section className="rounded-2xl border border-line bg-card/60 p-5">
        <h2 className="text-lg font-semibold">Discord groupe</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            className="h-11 flex-1 rounded-xl border border-line bg-panel px-3 text-sm"
            value={discordUrl}
            onChange={(event) => setDiscordUrl(event.target.value)}
          />
          <button type="button" onClick={saveDiscord} className="btn-brand h-11 rounded-xl px-5 text-sm font-semibold">
            Enregistrer
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {Object.values(data.sites).map((site) => (
          <article key={site.id} className="rounded-2xl border border-line bg-card/50 p-5">
            <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">{site.id}</p>
            <p className="mt-3 text-sm text-muted">
              Thème {site.theme} ({site.themeSource})
            </p>
            <label className="mt-4 block text-xs text-muted">
              URL publique
              <input
                className="mt-1 h-10 w-full rounded-xl border border-line bg-panel px-3 text-sm"
                defaultValue={site.publicUrl}
                onBlur={(event) => {
                  if (event.target.value !== site.publicUrl) {
                    void saveUrl(site.id, event.target.value);
                  }
                }}
              />
            </label>
            <div className="mt-4 space-y-2 text-sm">
              {(
                [
                  ["adsEnabled", "Publicités", site.adsEnabled],
                  ["analyticsEnabled", "Analytics", site.analyticsEnabled],
                  ["urlImportEnabled", "Import URL", site.urlImportEnabled],
                  ["discordEnabled", "Discord", site.discordEnabled],
                ] as const
              ).map(([key, label, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(site.id, key, !value)}
                  className="flex w-full items-center justify-between rounded-xl border border-line bg-panel/70 px-3 py-2"
                >
                  <span>{label}</span>
                  <span className={value ? "text-ok" : "text-muted"}>{value ? "on" : "off"}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-line bg-panel/40 p-5 text-sm text-muted">
        <p className="font-semibold text-ink">API publique à brancher sur les sites</p>
        <ul className="mt-3 space-y-1 font-mono text-xs">
          <li>GET /api/public/hub</li>
          <li>GET /api/public/hub/sites/audiova</li>
          <li>GET /api/public/hub/sites/videova</li>
          <li>GET /hub-theme.json</li>
        </ul>
      </section>
    </div>
  );
}
