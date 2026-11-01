"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Vue d'ensemble" },
  { href: "/themes", label: "Thèmes" },
  { href: "/comptes", label: "Comptes" },
  { href: "/sites", label: "Sites" },
  { href: "/stats", label: "Statistiques" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/admin/me", { cache: "no-store" });
        const data = (await response.json()) as { configured?: boolean; authenticated?: boolean };
        if (cancelled) return;
        setConfigured(data.configured !== false);
        setAuthed(data.authenticated === true);
        if (!data.authenticated && pathname !== "/connexion") {
          router.replace("/connexion");
        }
      } catch {
        if (!cancelled) setAuthed(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/connexion");
    router.refresh();
  };

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-5">
        <p className="text-sm text-muted">Chargement…</p>
      </main>
    );
  }

  if (pathname === "/connexion") {
    return <>{children}</>;
  }

  if (!authed) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <p className="text-[15px] font-semibold tracking-tight">
          <span className="text-ink">OW</span> <span className="gradient-text">Admin</span>
        </p>
        <p className="mt-2 text-xs text-muted">Panel central Omnaworks</p>
        {!configured ? (
          <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
            Configure ADMIN_PASSWORD et ADMIN_SESSION_SECRET.
          </p>
        ) : null}
        <nav className="mt-8 flex flex-row flex-wrap gap-2 lg:flex-col">
          {links.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  current
                    ? "rounded-xl bg-card px-3 py-2 text-sm font-semibold text-ink"
                    : "rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-card/60 hover:text-ink"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-8 text-sm font-semibold text-signal hover:text-ink"
        >
          Déconnexion
        </button>
      </aside>
      <main className="min-w-0 flex-1 pb-16">{children}</main>
    </div>
  );
}
