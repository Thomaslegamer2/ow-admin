"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConnexionPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Mot de passe incorrect ou panel non configuré.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Connexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <p className="font-mono text-xs tracking-[0.18em] text-glow uppercase">Omnaworks</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        OW <span className="gradient-text">Admin</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Comptes, thèmes, statistiques et options des sites du groupe.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-line bg-card/70 p-6">
        <label className="block text-sm">
          <span className="text-muted">Mot de passe admin</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-line bg-panel px-4 text-ink outline-none focus:border-glow/50"
            autoComplete="current-password"
            required
            minLength={12}
          />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="btn-brand inline-flex h-12 w-full items-center justify-center rounded-xl font-semibold disabled:opacity-60"
        >
          {busy ? "Vérification…" : "Entrer"}
        </button>
      </form>
    </main>
  );
}
