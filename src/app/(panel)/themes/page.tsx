"use client";

import { useEffect, useState } from "react";

interface ThemeMeta {
  id: string;
  label: string;
  description: string;
  accent: string;
  when: string;
}

interface HubSnapshot {
  theme: string;
  updatedAt: string | null;
  catalog: ThemeMeta[];
  sites: Record<string, { theme: string; themeSource: string }>;
}

export default function ThemesPage() {
  const [data, setData] = useState<HubSnapshot | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/themes", { cache: "no-store" });
    if (response.ok) {
      setData((await response.json()) as HubSnapshot);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const applyGlobal = async (theme: string) => {
    setBusy(theme);
    setMessage(null);
    const response = await fetch("/api/admin/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    });
    if (response.ok) {
      setData((await response.json()) as HubSnapshot);
      setMessage(`Thème global « ${theme} » appliqué.`);
    }
    setBusy(null);
  };

  if (!data) {
    return <p className="text-sm text-muted">Chargement des thèmes…</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs tracking-[0.16em] text-glow uppercase">Thèmes</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Apparence du groupe</h1>
        <p className="mt-2 text-sm text-muted">
          Actuel : <span className="text-ink">{data.theme}</span>
          {data.updatedAt ? ` · ${new Date(data.updatedAt).toLocaleString("fr-FR")}` : ""}
        </p>
        {message ? <p className="mt-3 text-sm text-ok">{message}</p> : null}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.catalog.map((item) => {
          const active = data.theme === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={busy !== null}
              onClick={() => applyGlobal(item.id)}
              className={
                active
                  ? "rounded-2xl border border-glow/50 bg-panel p-4 text-left"
                  : "rounded-2xl border border-line bg-card/50 p-4 text-left hover:border-glow/30"
              }
            >
              <span className="inline-block size-2.5 rounded-full" style={{ background: item.accent }} />
              <p className="mt-3 font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-muted">{item.when}</p>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
              <p className="mt-3 text-xs font-semibold text-signal">
                {busy === item.id ? "…" : active ? "Actif" : "Appliquer"}
              </p>
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-line bg-card/50 p-5">
        <h2 className="text-lg font-semibold">Par site</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(data.sites).map(([id, site]) => (
            <li key={id} className="rounded-xl border border-line bg-panel/60 p-4 text-sm">
              <p className="font-mono text-xs text-muted uppercase">{id}</p>
              <p className="mt-2 font-semibold">{site.theme}</p>
              <p className="mt-1 text-xs text-muted">
                {site.themeSource === "global" ? "Hérite du global" : "Override"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
