"use client";

import { useEffect, useState } from "react";

interface Dashboard {
  generatedAt: string;
  accounts: number;
  theme: string;
  discordUrl: string;
  sites: Array<{
    id: string;
    theme: string;
    publicUrl: string;
    adsEnabled: boolean;
    analyticsEnabled: boolean;
  }>;
  today: {
    day: string;
    events: number;
    bySite: Record<string, number>;
    byType: Record<string, number>;
  };
  runtime: { node: string; uptimeSeconds: number; rssMb: number; heapMb: number };
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setError("Impossible de charger le tableau de bord.");
          return;
        }
        if (!cancelled) setData((await response.json()) as Dashboard);
      } catch {
        if (!cancelled) setError("Réseau indisponible.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted">Chargement du tableau de bord…</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs tracking-[0.16em] text-glow uppercase">Vue d&apos;ensemble</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Panel Omnaworks</h1>
        <p className="mt-2 text-sm text-muted">Généré {new Date(data.generatedAt).toLocaleString("fr-FR")}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Comptes", value: String(data.accounts) },
          { label: "Thème global", value: data.theme },
          { label: "Événements aujourd'hui", value: String(data.today.events) },
          { label: "Mémoire RSS", value: `${data.runtime.rssMb} Mo` },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-line bg-card/70 p-5">
            <p className="text-xs tracking-[0.14em] text-muted uppercase">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {data.sites.map((site) => (
          <article key={site.id} className="rounded-2xl border border-line bg-card/60 p-5">
            <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">{site.id}</p>
            <p className="mt-3 text-lg font-semibold">{site.theme}</p>
            <p className="mt-2 break-all text-xs text-muted">{site.publicUrl || "URL non définie"}</p>
            <p className="mt-4 text-xs text-muted">
              Ads {site.adsEnabled ? "on" : "off"} · Analytics {site.analyticsEnabled ? "on" : "off"}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-line bg-panel/50 p-5">
        <h2 className="text-lg font-semibold">Runtime</h2>
        <p className="mt-3 text-sm text-muted">
          Node {data.runtime.node} · uptime {data.runtime.uptimeSeconds}s · heap {data.runtime.heapMb} Mo
        </p>
        <p className="mt-2 text-sm text-muted">Discord : {data.discordUrl}</p>
      </section>
    </div>
  );
}
