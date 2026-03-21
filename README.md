# portfolio-demos

Full-stack demo projects by Injae Ju — Backend & Automation Engineer.

Each demo is an independently deployable app inside this monorepo.

## Projects

| Demo | Stack | Deploy |
|---|---|---|
| [admin-dashboard](./admin-dashboard) | React + Tailwind + Recharts | Vercel (static) |
| [pdf-generator](./pdf-generator) *(coming soon)* | Node.js + Puppeteer | — |

## Why this structure

- One GitHub repo → clean portfolio link, easy to maintain
- Each sub-project deploys independently to Vercel
- Static builds only → zero cold starts, instant load everywhere

## Deploy admin-dashboard to Vercel

```bash
# Option A: Vercel CLI
cd admin-dashboard
npm install
npm run build
vercel --prod

# Option B: Vercel dashboard
# 1. Import this repo
# 2. Set Root Directory: admin-dashboard
# 3. Deploy
```

No env vars required — fully self-contained.
