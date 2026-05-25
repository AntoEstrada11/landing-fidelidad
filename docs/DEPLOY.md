# Despliegue — Landing Fidelidad

Aplicación **Nuxt 4** con servidor **Nitro** (SSR + API `/api/iglesias`).

## Requisitos

- Node **22.12.0** (ver `.nvmrc`) o Docker
- Puerto **3000** (configurable con `PORT`)

## Variables de entorno

Copia `.env.example` a `.env` en desarrollo. En staging/producción configúralas en el servidor o en secrets de Gitea.

| Variable | Descripción | Ejemplo staging |
|----------|-------------|-----------------|
| `IGLESIAS_SOURCE` | `json` o `odoo` | `json` |
| `NODE_ENV` | Entorno | `production` |
| `HOST` | Bind del servidor | `0.0.0.0` |
| `PORT` | Puerto HTTP | `3000` |
| `ODOO_URL` | Solo si `IGLESIAS_SOURCE=odoo` | — |
| `ODOO_DB` | Base Odoo | — |
| `ODOO_USERNAME` | Usuario API | — |
| `ODOO_PASSWORD` | Token / contraseña | (secret) |

## Build local (sin Docker)

```bash
npm ci
set IGLESIAS_SOURCE=json
set NODE_ENV=production
npm run build
node .output/server/index.mjs