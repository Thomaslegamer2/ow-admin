"use client";

import { useEffect, useState } from "react";

interface Dashboard {
  today: {
    day: string;
    events: number;
    bySite: Record<string, number>;
    byType: Record<string, number>;
    recent: Array<{ id: string; site: string; type: string; at: string }>;
  };
  historyDays: number;
}

export default function StatsPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (response.ok && !cancelled) {
        setData((await response.json()) as Dashboard);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return <p className="text-sm text-muted">Chargement des statistiques…</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs tracking-[0.16em] text-glow uppercase">Statistiques</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Activité du jour</h1>
        <p className="mt-2 text-sm text-muted">
          {data.today.day} · {data.today.events} événement(s) · {data.historyDays} jour(s) archivé(s)
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-card/60 p-5">
          <h2 className="font-semibold">Par site</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(data.today.bySite).length === 0 ? (
              <li className="text-muted">Aucun événement.</li>
            ) : (
              Object.entries(data.today.bySite).map(([site, count]) => (
                <li key={site} className="flex justify-between">
                  <span>{site}</span>
                  <span className="font-mono text-signal">{count}</span>
                </li>
              ))
            )}
          </ul>
        </article>
        <article className="rounded-2xl border border-line bg-card/60 p-5">
          <h2 className="font-semibold">Par type</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(data.today.byType).length === 0 ? (
              <li className="text-muted">Aucun événement.</li>
            ) : (
              Object.entries(data.today.byType).map(([type, count]) => (
                <li key={type} className="flex justify-between">
                  <span>{type}</span>
                  <span className="font-mono text-signal">{count}</span>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-line bg-card/40 p-5">
        <h2 className="font-semibold">Récents</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {data.today.recent.length === 0 ? (
            <li className="text-muted">Les sites peuvent poster sur POST /api/public/stats/ingest.</li>
          ) : (
            data.today.recent.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
                <span>
                  <span className="font-mono text-xs text-muted">{event.site}</span> · {event.type}
                </span>
                <span className="text-xs text-muted">{new Date(event.at).toLocaleTimeString("fr-FR")}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
