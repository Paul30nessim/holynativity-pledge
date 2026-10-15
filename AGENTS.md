# Holy Nativity sponsorship project

## Architecture

This is a TanStack Start / React / TypeScript app on Netlify. `src/routes/index.tsx` renders the public church campaign, six project cards, 36 windows, pledge dialog, and confirmation. `src/routes/admin.tsx` provides the hidden administration login, invite acceptance, password recovery, pledge updates, progress, and content editor. `src/routes/__root.tsx` owns shared metadata and the HTML shell. `src/styles.css` implements the responsive crimson, parchment, and gold church design.

`src/lib/campaign.ts` contains public initial content, public types, currency formatting, and the fixed official donation destination. `public/img` contains the exact supplied official logo and church photograph plus architectural crops. Never crop, recolor, stretch, regenerate, or otherwise change the logo. Logo rendering uses object-fit contain. Church photos use Netlify Image CDN. The locally hosted Byzantine font matches HNCOC.org’s brand lettering; display copy uses Cormorant Garamond with Figtree body text.

`netlify/functions/campaign.mts` handles `/api/campaign` and `/api/admin/campaign`. GET public returns only content, aggregate project progress, and window status. POST public validates and stores a pledge. Admin GET returns private pledges; PATCH changes status/notes; PUT saves public campaign configuration. All administration access requires a verified Netlify Identity user with the server-controlled `admin` role. All mutations check same-origin requests. Never expose private pledge fields in public responses, browser bundles, or static files.

`db/schema.ts` defines pledges and campaign settings. `db/index.ts` creates the Netlify Database Drizzle adapter. `drizzle.config.ts` targets `netlify/database/migrations`. Generate a named migration for every schema change using the beta Drizzle packages. Netlify applies migrations on deployment; never migrate manually against production. A partial unique database index allows at most one active pledge per window, including concurrent inserts and cancelled-pledge reactivation. Do not replace this with frontend-only checks.

## Domain conventions

Money in pledge storage and public API aggregates uses integer cents. Campaign configuration goals and window amounts use dollars. All submitted pledges start Reserved. Paid / Confirmed counts as received. Cancelled is excluded from aggregate totals and active reservations. Pending also reserves a window. Remaining means goal minus confirmed receipts, floored at zero. Pledged totals include all active commitments, including paid ones; pending totals are pledged minus confirmed.

The church exclusively receives online payments at https://www.hncoc.org/give/?fund=4. This app collects no card details and never treats a donation link click as received payment. Window sponsor identities never appear publicly. First administrator setup and server-controlled role assignment take place through Netlify Identity’s dashboard; there is no default account.

## Coding conventions

Use typed React components, existing Radix dialog controls, visible form labels, error/loading states, and accessible focus states. Read browser APIs only inside effects or event handlers to preserve SSR hydration. Prefer concise CSS with responsive grids; retain restrained motion and reduced-motion support. Keep public branding consistent with HNCOC.org and authentic church imagery. Netlify Identity callbacks landing on the public homepage forward to `/admin` before processing.

## Operations

Use pnpm for dependencies. Local development uses `netlify dev --port 8889`. The hosting pipeline builds with Vite. During agent-runner tasks, obey the user’s prohibition on local build/start/test commands and verify changes through source review. Do not inspect `.git`, print secrets, or create commits. See README for setup and managing content.
