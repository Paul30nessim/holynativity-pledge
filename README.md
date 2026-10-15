# Holy Nativity — Building for Our Future

A construction sponsorship website for Holy Nativity Coptic Orthodox Church, 9395 Magnolia Ave, Riverside, CA 92503. The design draws on HNCOC.org’s crimson, parchment, gold, Figtree typography, and Byzantine wordmark lettering. The uploaded official logo is used without modification. All photography comes from the uploaded photograph of the actual church; project photos show details of that photograph.

The site supports six construction projects with a combined initial goal of $74,000 and 36 windows at approximately $600 each. A pledge reserves sponsorship; it does not process a payment. Online contributions go exclusively to https://www.hncoc.org/give/?fund=4. Church administrators confirm contributions after receipt.

## Technologies and local development

React, TypeScript, TanStack Start and Router, Vite, accessible Radix dialogs, Lucide icons, Netlify Functions, Netlify Identity, Netlify Image CDN, and Netlify Database with Drizzle ORM.

Install dependencies with `pnpm install`. Run `netlify dev --port 8889` for local development with Netlify services. The deployed build uses `vite build`. Database schema changes require `pnpm exec drizzle-kit generate --name descriptive_change`; Netlify applies generated migrations at deployment. No secret values belong in source files.

## Administrator setup

Identity activation is included in this project. To establish the first administrator, open the project’s Identity settings in Netlify, set registration to invite only, invite the church administrator, and assign the server-controlled `admin` role to that user. Invite links arriving at the homepage automatically route to `/admin` to set a password. The administrator can then sign in at `/admin`, which is absent from public navigation. Password recovery is available there.

Every administration API request checks a verified Identity user and the `admin` role. Open registration alone does not grant any administration privileges. This initial account and role assignment must be completed in the Netlify dashboard; no default password or public administration credential is supplied.

## Managing the campaign

The dashboard shows campaign totals, window counts, individual project progress, and private donor details. Choose a pledge’s status and edit private notes, then save. Paid / Confirmed gifts count toward received totals and make windows Sponsored. Cancelled pledges no longer count in totals and release their windows. Pending and Reserved statuses continue to reserve a window.

The campaign content editor changes project titles, descriptions, goals, image filenames, hero text, and window sponsorship amount. Its configuration uses dollars. Private pledge amounts are stored in integer cents. Initial content lives in `src/lib/campaign.ts`; saved edits live in Netlify Database. The official giving URL is centralized in that file and deliberately restricted to the church’s designated URL. Other public copy, contact details, and Scripture are maintained in `src/routes/index.tsx`.

Original logo and photography files are in `public/img/`. Add replacement assets to that directory and update image paths in the dashboard or initial configuration. Never alter the logo. The logo is served directly; photographs use the Netlify Image CDN.

Pledge names, contact information, messages, methods, and notes remain in the database and are returned only by the protected administration endpoint. Public responses contain content, aggregate amounts, and window numbers/statuses only. A database partial unique index prevents simultaneous active reservations of the same window. A cancelled pledge cannot be reactivated if that window has since been reserved by someone else.

## Validation

Source files, schema, generated migration, and authentication library APIs were reviewed. Local builds, development servers, and test commands were intentionally not run; the hosting pipeline performs build validation. Verify pledge creation, online and in-person confirmation, role-protected dashboard access, and competing window reservations on the deployed site after administrator setup.
