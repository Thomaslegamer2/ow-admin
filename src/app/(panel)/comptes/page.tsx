"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  displayName: string;
  products: string[];
  disabled: boolean;
  createdAt: string;
}

export default function ComptesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await fetch("/api/admin/accounts", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { users: User[] };
      setUsers(data.users);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    const response = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", email, displayName, password }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Création impossible.");
      setBusy(false);
      return;
    }
    setEmail("");
    setDisplayName("");
    setPassword("");
    setMessage("Compte créé.");
    await load();
    setBusy(false);
  };

  const toggle = async (id: string, disabled: boolean) => {
    await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: disabled ? "enable" : "disable", id }),
    });
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Supprimer ce compte ?")) return;
    await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    await load();
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs tracking-[0.16em] text-glow uppercase">Comptes</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Utilisateurs Omnaworks</h1>
        <p className="mt-2 text-sm text-muted">{users.length} compte(s)</p>
      </header>

      <form onSubmit={create} className="grid gap-3 rounded-2xl border border-line bg-card/60 p-5 md:grid-cols-4">
        <input
          className="h-11 rounded-xl border border-line bg-panel px-3 text-sm"
          placeholder="Nom"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
        <input
          className="h-11 rounded-xl border border-line bg-panel px-3 text-sm"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="h-11 rounded-xl border border-line bg-panel px-3 text-sm"
          placeholder="Mot de passe (≥10)"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={10}
        />
        <button type="submit" disabled={busy} className="btn-brand h-11 rounded-xl text-sm font-semibold">
          Créer
        </button>
      </form>
      {message ? <p className="text-sm text-ok">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/40">
        {users.length === 0 ? (
          <li className="p-5 text-sm text-muted">Aucun compte pour l&apos;instant.</li>
        ) : (
          users.map((user) => (
            <li key={user.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {user.displayName}{" "}
                  {user.disabled ? <span className="text-xs text-warn">(désactivé)</span> : null}
                </p>
                <p className="text-sm text-muted">{user.email}</p>
                <p className="mt-1 text-xs text-muted">
                  Créé {new Date(user.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="flex gap-3 text-sm font-semibold">
                <button type="button" className="text-signal" onClick={() => toggle(user.id, user.disabled)}>
                  {user.disabled ? "Réactiver" : "Désactiver"}
                </button>
                <button type="button" className="text-danger" onClick={() => remove(user.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
