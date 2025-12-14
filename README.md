# vonbusch-security-funnel
[cloudflarebutton]
A stylish 3-step Security Check funnel (in German and English) with scoring, results evaluation, and lead form to initiate consultations. This is a high-quality, multilingual sales tunnel website (single-page flow) for von Busch GmbH, aimed at generating qualified B2B leads in the DACH market. The goal is to provide an automated, point-based assessment of security maturity (VPN / Web / Awareness) within 2–3 minutes through three stages (Basic → Detail → Maturity Level). Results include per-area traffic light ratings, overall assessment, and a lead form. The interface is mobile-first, visually premium (gradient hero, subtle shadows, micro-interactions), and built using shadcn/ui components, Tailwind v3 utilities, and Cloudflare Durable Object-backed API endpoints.
## Features
- **Interactive 3-Step Funnel**: Basis-Check (3 mandatory questions on VPN, Web processes, and awareness), conditional Detail-Check, and Maturity/Risk assessment.
- **Client-Side Scoring**: Automatic calculation of maturity levels (0-6 points per area) with traffic light visualizations (red/yellow/green) and personalized recommendations.
- **Lead Generation**: Secure form for company details, contact info, employee count, and GDPR consent, persisted via Cloudflare Durable Objects.
- **Visual Excellence**: Modern UI with gradients, smooth animations (framer-motion), responsive design, and micro-interactions for delightful user experience.
- **German-Language Focus**: All copy in German using informal "Du" tone, targeted at IT leaders/CIOs/CISOs in mid-sized DACH companies.
- **Performance & Accessibility**: Fast-loading, mobile-optimized, with proper ARIA labels, focus states, and contrast ratios.
- **Backend Integration**: Hono-based API for lead persistence; extensible for CRM webhooks and analytics (Phase 2).
- **Multilingual Support**: A toggle in the top-right corner allows users to switch between German (DE) and English (EN). The language preference is saved to local storage.
- **Privacy-Friendly Analytics**: Utilizes Plausible.io for cookie-free, GDPR-compliant analytics. Tracking is strictly opt-in, enabled only after user consent is given via a checkbox in the lead form.
## Tech Stack
- **Frontend**: React 18, React Router, Tailwind CSS v3, shadcn/ui (Button, Card, Input, RadioGroup, Form, etc.), framer-motion (animations), lucide-react (icons), react-hook-form + Zod (validation), @tanstack/react-query (API), sonner (toasts), clsx/tailwind-merge (utilities).
- **State Management**: Zustand (for UI state and language preference; primitive selectors only to avoid re-renders).
- **Backend**: Cloudflare Workers, Hono (routing), Cloudflare Durable Objects (via IndexedEntity pattern for leads storage).
- **Build Tools**: Vite (dev/build), npm (package manager), TypeScript.
- **Other**: Recharts (optional charts), Date-fns (utils), Immer (immutable updates).
## Quick Start
1. Clone the repository.
2. Install dependencies with npm: `npm install`.
3. Run in development: `npm run dev`.
4. Open http://localhost:3000 (or configured port).
5. For production deployment, see the Deployment section.
## Installation
This project uses npm as the recommended package manager for compatibility with CI/CD environments like Cloudflare Pages and development environments like GitHub Codespaces.
1. Ensure Node.js and npm are installed.
2. Clone the repo: `git clone <repository-url> && cd vonbusch-security-funnel`.
3. Install dependencies: `npm install`. This will also generate a `package-lock.json` file which you should commit to your repository.
4. Generate Cloudflare types (if needed): `npm run cf-typegen`.
No additional configuration is required for local development. The project is pre-configured with Cloudflare Workers integration and is 100% npm-compatible; no Bun required for dev/deploy/CI.
## Development
- **Run Development Server**: `npm run dev` – Starts Vite dev server with hot reload at http://localhost:3000.
- **Build for Production**: `npm run build` – Outputs to `dist/` for deployment.
- **Lint Code**: `npm run lint` – Runs ESLint on the codebase.
- **Type Check**: TypeScript is enforced; run `npx tsc --noEmit` for verification.
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
For testing: Navigate through the funnel in dev mode. Submit a lead to verify API persistence (check Worker logs via `npx wrangler tail`).
## Deployment
Deploy to Cloudflare Workers for global edge performance with Durable Objects for state.
1. Install Wrangler CLI: `npm install -g wrangler`.
2. Login: `wrangler login`.
3. Deploy: `npm run deploy` (builds frontend and deploys Worker).
4. Preview: Use `npx wrangler dev` for local Worker simulation.
The frontend assets are served via Cloudflare's SPA handling, with API routes proxied to the Worker.
[cloudflarebutton]
### Deployment to Cloudflare Pages (Production Workflow)
This project is optimized for deployment on Cloudflare Pages.
**To ensure successful deployments, follow these steps:**
1. **Use npm**: Run `npm install` locally. This will generate a `package-lock.json` file.
2. **Commit the Lockfile**: Add and commit `package-lock.json` to your repository.
Cloudflare Pages will automatically detect `package-lock.json` and use `npm` for the build, ensuring a consistent and reliable deployment process.
**GitHub Codespaces**: To run this project in a Codespace, simply run `npm install` followed by `npm run dev`.
**Custom Domain**: After deployment, add a custom domain in the Cloudflare dashboard. Ensure `wrangler.jsonc` assets config handles SPA routing.
## Production Deployment (Pages Static + Workers API)
This project deploys the static frontend to **Cloudflare Pages** (with GitHub auto‑deploy) and the API/Worker separately to fully support Durable Objects.
### Why the Functions tab shows **„Keine Funktionen“** and `/api/leads` returns 404
The project does **not** use Pages Functions (the `/functions` directory).
All API routes are handled by a full Cloudflare Worker, therefore the Functions tab remains empty and no Invoke URL is shown.
### Deployment Steps
1. **Deploy the API Worker**
   ```bash
   wrangler login
   npm run deploy
   ```
   Note the generated `*.workers.dev` URL, e.g. `vonbusch-security-fu--x9nwvibdurmhz4zbbxdh.youraccount.workers.dev`.
2. **Configure Pages to call the Worker**
   In the Cloudflare Pages dashboard go to **Project Settings → Environment variables** and add
   `VITE_API_URL` with the Worker URL from step 1.
3. **Pages build settings**
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   Trigger a new deploy. The static site will be served from Pages and will call the Worker via `VITE_API_URL`.
### Verify
Open the browser console after submitting the lead form. The request URL should point to the Worker endpoint and no 404/abort errors should appear.
### Alternative full‑stack deployment
You can also deploy everything with a single `npm run deploy` to the Worker and bind a custom domain, which serves both the static assets and the API from one URL.
> **Important:** Do **not** set the Pages `build.command` to `npm run deploy`. That command requires Wrangler authentication and will fail silently during the Pages build.
## GitHub Sync & Export (Fix for Button Fails)
If you are experiencing issues with a direct "Export to GitHub" button, the most reliable method is to connect your repository directly through the Cloudflare Pages dashboard. This workflow avoids common authentication and repository naming conflicts.
**Recommended Workflow (No Terminal Required):**
1. **Connect to Git in Cloudflare Pages:**
   - Go to your Cloudflare Pages project > **Settings** > **Git Integration**.
   - Click **Connect to Git** and choose **GitHub**.
   - Authorize Cloudflare to access your GitHub account. You can then choose to create a new repository directly from the project or link to an existing one. This process handles all authentication seamlessly.
2. **Automatic Deployments:**
   - Once linked, Cloudflare Pages will automatically build and deploy your project every time you `git push` to your main branch.
   - The build process will use `npm ci` (leveraging your committed `package-lock.json`) for fast and consistent builds.
**Manual Export Alternative:**
If you prefer to manage the code locally first:
1. Run `npm install` to generate `package-lock.json`.
2. Initialize a Git repository: `git init`.
3. Add, commit, and push your code to a new repository on GitHub.com.
4. Follow the "Connect to Git" steps above, but select your newly created repository.
For more details, see the official documentation: [Cloudflare Pages Git Integration](https://developers.cloudflare.com/pages/configuration/git-integration/).
## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push: `git push origin feature/amazing-feature`.
5. Open a Pull Request.
Follow TypeScript conventions, avoid modifying forbidden files (e.g., `wrangler.jsonc`, `worker/index.ts`). Ensure no infinite loops in React (use primitive Zustand selectors).
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.