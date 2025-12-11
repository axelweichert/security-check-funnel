# vonbusch-security-funnel

[cloudflarebutton]

A stylish 3-step Security Check funnel (in German) with scoring, results evaluation, and lead form to initiate consultations. This is a high-quality, German-language sales tunnel website (single-page flow) for von Busch GmbH, aimed at generating qualified B2B leads in the DACH market. The goal is to provide an automated, point-based assessment of security maturity (VPN / Web / Awareness) within 2–3 minutes through three stages (Basic → Detail → Maturity Level). Results include per-area traffic light ratings, overall assessment, and a lead form. The interface is mobile-first, visually premium (gradient hero, subtle shadows, micro-interactions), and built using shadcn/ui components, Tailwind v3 utilities, and Cloudflare Durable Object-backed API endpoints.

## Features

- **Interactive 3-Step Funnel**: Basis-Check (3 mandatory questions on VPN, Web processes, and awareness), conditional Detail-Check, and Maturity/Risk assessment.
- **Client-Side Scoring**: Automatic calculation of maturity levels (0-6 points per area) with traffic light visualizations (red/yellow/green) and personalized recommendations.
- **Lead Generation**: Secure form for company details, contact info, employee count, and GDPR consent, persisted via Cloudflare Durable Objects.
- **Visual Excellence**: Modern UI with gradients, smooth animations (framer-motion), responsive design, and micro-interactions for delightful user experience.
- **German-Language Focus**: All copy in German using informal "Du" tone, targeted at IT leaders/CIOs/CISOs in mid-sized DACH companies.
- **Performance & Accessibility**: Fast-loading, mobile-optimized, with proper ARIA labels, focus states, and contrast ratios.
- **Backend Integration**: Hono-based API for lead persistence; extensible for CRM webhooks and analytics (Phase 2).

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS v3, shadcn/ui (Button, Card, Input, RadioGroup, Form, etc.), framer-motion (animations), lucide-react (icons), react-hook-form + Zod (validation), @tanstack/react-query (API), sonner (toasts), clsx/tailwind-merge (utilities).
- **State Management**: Zustand (for UI state; primitive selectors only to avoid re-renders).
- **Backend**: Cloudflare Workers, Hono (routing), Cloudflare Durable Objects (via IndexedEntity pattern for leads storage).
- **Build Tools**: Vite (dev/build), Bun (package manager), TypeScript.
- **Other**: Recharts (optional charts), Date-fns (utils), Immer (immutable updates).

## Quick Start

1. Clone the repository.
2. Install dependencies with Bun: `bun install`.
3. Run in development: `bun run dev`.
4. Open http://localhost:3000 (or configured port).
5. For production deployment, see the Deployment section.

## Installation

This project uses Bun as the package manager for faster installs and runs.

1. Ensure Bun is installed: `curl -fsSL https://bun.sh/install | bash` (or via npm: `npm i -g bun`).
2. Clone the repo: `git clone <repository-url> && cd vonbusch-security-funnel`.
3. Install dependencies: `bun install`.
4. Generate Cloudflare types (if needed): `bun run cf-typegen`.

No additional configuration is required for local development. The project is pre-configured with Cloudflare Workers integration.

## Development

- **Run Development Server**: `bun run dev` – Starts Vite dev server with hot reload at http://localhost:3000.
- **Build for Production**: `bun run build` – Outputs to `dist/` for deployment.
- **Lint Code**: `bun run lint` – Runs ESLint on the codebase.
- **Type Check**: TypeScript is enforced; run `bun tsc --noEmit` for verification.
- **API Testing**: The backend runs alongside the frontend in dev mode. Test endpoints like `/api/leads` using tools like curl or the browser dev tools.
- **Environment**: No env vars needed for core functionality. For custom Worker bindings, refer to `wrangler.jsonc` (do not modify bindings).

### Project Structure

- `src/`: React frontend (pages, components, hooks, lib).
- `worker/`: Cloudflare Worker backend (routes in `user-routes.ts`, entities in `entities.ts`).
- `shared/`: Shared types between frontend/backend.
- `tailwind.config.js`: Custom theme (colors: #F38020 primary, #4F46E5 secondary, #0F172A neutral).

### Adding Features

- **Frontend**: Add routes in `src/main.tsx`. Use shadcn/ui components from `@/components/ui/*`.
- **Backend**: Extend routes in `worker/user-routes.ts` using IndexedEntity helpers (e.g., create LeadEntity). Do not modify `worker/index.ts` or `core-utils.ts`.
- **State**: Use Zustand with primitive selectors only (e.g., `useStore(s => s.value)` to avoid infinite loops).
- **API Calls**: Use `api` helper from `src/lib/api-client.ts` with React Query for caching.

Example API call (lead submission):
```tsx
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const submitLead = useMutation({
  mutationFn: (leadData) => api('/api/leads', { method: 'POST', body: JSON.stringify(leadData) }),
});
```

## Usage

The application is a single-page funnel:

1. **Landing (Hero)**: Users see the hook and start the check.
2. **Steps 1-3**: Progressive disclosure of questions with progress indicator.
3. **Results**: Dynamic scoring and recommendations (client-side).
4. **Lead Form**: Collects data and submits to `/api/leads`.
5. **Thank You**: Confirmation with follow-up CTAs.

All interactions are handled client-side until lead submission. Mock data is not used in production; leads are persisted via Durable Objects.

For testing: Navigate through the funnel in dev mode. Submit a lead to verify API persistence (check Worker logs via `wrangler tail`).

## Deployment

Deploy to Cloudflare Workers for global edge performance with Durable Objects for state.

1. Install Wrangler: `bun add -g wrangler`.
2. Login: `wrangler login`.
3. Deploy: `bun run deploy` (builds frontend and deploys Worker).
4. Preview: Use `wrangler dev` for local Worker simulation.

The frontend assets are served via Cloudflare's SPA handling, with API routes proxied to the Worker.

[cloudflarebutton]

**Custom Domain**: After deployment, add a custom domain in the Cloudflare dashboard. Ensure `wrangler.jsonc` assets config handles SPA routing.

**Phased Rollout**:
- Phase 1: Core funnel (current implementation).
- Phase 2: Add CRM integration and analytics.
- Phase 3: SEO and multi-language support.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Follow TypeScript conventions, avoid modifying forbidden files (e.g., `wrangler.jsonc`, `worker/index.ts`). Ensure no infinite loops in React (use primitive Zustand selectors).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.