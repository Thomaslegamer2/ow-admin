# OW Admin

Panel admin central Omnaworks : comptes, thèmes, statistiques et options des sites (Audiova, Videova, Omnaworks).

## Lancer

```powershell
cd $HOME\Desktop\ow-admin
copy .env.example .env.local
# Renseigner ADMIN_PASSWORD (≥12) et ADMIN_SESSION_SECRET (≥32)
npm install
npm run dev
```

Ouvrir [http://localhost:3020](http://localhost:3020) → `/connexion`.

## Pages

- `/` vue d'ensemble
- `/themes` thèmes globaux
- `/comptes` comptes utilisateurs
- `/sites` toggles et URLs
- `/stats` événements du jour

## API publique (pour les autres sites)

Pointer `NEXT_PUBLIC_OW_HUB_URL` vers ce panel :

| Méthode | URL |
| --- | --- |
| GET | `/api/public/hub` |
| GET | `/api/public/hub/theme` |
| GET | `/api/public/hub/sites/audiova` |
| GET | `/api/public/hub/sites/videova` |
| GET | `/hub-theme.json` |
| POST | `/api/public/stats/ingest` (headers `X-OW-Site` + `X-OW-Secret`) |

Secrets d'ingest optionnels : `SITE_SECRET_AUDIOVA`, `SITE_SECRET_VIDEOVA`, `SITE_SECRET_OMNAWORKS`.

## Déploiement Hostinger

1. Pousser ce dépôt sur GitHub.
2. Créer une app Node / Docker branchée sur le repo.
3. Variables d'environnement :

| Variable | Exemple |
| --- | --- |
| `HOSTNAME` | `0.0.0.0` |
| `PORT` | laisser Hostinger (souvent `3000`) |
| `NEXT_PUBLIC_SITE_URL` | `https://admin.tondomaine.com` |
| `ADMIN_PASSWORD` | ≥ 12 caractères |
| `ADMIN_SESSION_SECRET` | ≥ 32 caractères |

4. Health check : `GET /api/health`
5. Sur Audiova / Videova / Omnaworks :

```env
NEXT_PUBLIC_OW_HUB_URL=https://admin.tondomaine.com
```
