# vonbusch-security-funnel
[cloudflarebutton]
A stylish 3-step Security Check funnel (in German and English) with scoring, results evaluation, and lead form to initiate consultations. This is a high-quality, multilingual sales tunnel website (single-page flow) for von Busch GmbH, aimed at generating qualified B2B leads in the DACH market. The goal is to provide an automated, point-based assessment of security maturity (VPN / Web / Awareness) within 2–3 minutes through three stages (Basic → Detail → Maturity Level). Results include per-area traffic light ratings, overall assessment, and a lead form. The interface is mobile-first, visually premium (gradient hero, subtle shadows, micro-interactions), and built using shadcn/ui components, Tailwind v3 utilities, and a Cloudflare Worker backend with Durable Objects.
## Features
- **Interactive 3-Step Funnel**: Basis-Check (3 mandatory questions on VPN, Web processes, and awareness), conditional Detail-Check, and Maturity/Risk assessment.
- **Client-Side Scoring**: Automatic calculation of maturity levels (0-6 points per area) with traffic light visualizations (red/yellow/green) and personalized recommendations.
- **Lead Generation**: Secure form for company details, contact info, employee count, and GDPR consent, persisted via Cloudflare Durable Objects.
- **Visual Excellence**: Modern UI with gradients, smooth animations (framer-motion), responsive design, and micro-interactions for delightful user experience.
- **German-Language Focus**: All copy in German using informal "Du" tone, targeted at IT leaders/CIOs/CISOs in mid-sized DACH companies.
- **Performance & Accessibility**: Fast-loading, mobile-optimized, with proper ARIA labels, focus states, and contrast ratios.
- **Backend Integration**: Hono-based API on Cloudflare Workers for lead persistence; extensible for CRM webhooks and analytics.
- **Multilingual Support**: A toggle in the top-right corner allows users to switch between German (DE) and English (EN). The language preference is saved to local storage.
- **Privacy-Friendly Analytics**: Utilizes Plausible.io for cookie-free, GDPR-compliant analytics. Tracking is strictly opt-in, enabled only after user consent is given.
- **PWA & Offline Support**: Service worker enables offline access, allowing users to complete the funnel even with intermittent connectivity.
## Tech Stack
- **Frontend**: React 18, React Router, Tailwind CSS v3, shadcn/ui, framer-motion, lucide-react, react-hook-form + Zod, @tanstack/react-query, sonner.
- **State Management**: Zustand (for UI state and language preference; primitive selectors only to avoid re-renders).
- **Backend**: Cloudflare Workers, Hono (routing), Cloudflare Durable Objects (for leads storage).
- **Build Tools**: Vite, npm, TypeScript.
## Quick Start
1. Clone the repository.
2. Install dependencies with npm: `npm install`.
3. Run in development: `npm run dev`.
4. Open http://localhost:3000 (or configured port).
## Installation
This project uses npm as the recommended package manager.
1. Ensure Node.js and npm are installed.
2. Clone the repo: `git clone <repository-url> && cd vonbusch-security-funnel`.
3. Install dependencies: `npm install`. This will also generate a `package-lock.json` file which you should commit to your repository.
## Development
- **Run Development Server**: `npm run dev` – Starts Vite dev server with hot reload at http://localhost:3000.
- **Build for Production**: `npm run build` – Outputs to `dist/` for deployment.
- **Lint Code**: `npm run lint` – Runs ESLint on the codebase.
## Deployment to Cloudflare (Production Workflow)
This project is a "Workers Site," deploying a static React frontend and a Worker API backend.
1.  **Log in to Wrangler**: `npx wrangler login`.
2.  **Deploy the full application (Frontend + Worker API)**: `npm run deploy-worker`.
    -   This command builds the React app and deploys it along with the Worker (`worker/index.ts`) to your Cloudflare account.
    -   The API is powered by a Cloudflare Worker using a Durable Object (`LeadEntity`) for stateful storage.
    -   **NO Pages Functions needed** (delete `/functions/api/leads` if it exists); the Worker is the primary backend via `run_worker_first: ["/api/*"]` in `wrangler.jsonc`.
-   **Configuration Note**: The `wrangler.jsonc` file is pre-configured with the necessary `GlobalDurableObject` binding and a `v1` migration, ensuring the Durable Object is ready for production use.

### Pages Functions Backend (Fixes Prod /api/leads SPA Fallback)

To fix potential issues where Pages serves the SPA instead of the API for `/api/leads` routes in production, using Pages Functions is the recommended approach.

1.  **KV Binding Setup** (Dashboard):
    -   Go to Cloudflare Dashboard > Pages > [Your Project] > Settings > Functions.
    -   Add KV Binding: Variable=`LEADS_KV`, KV Namespace=[Create a new KV namespace or select an existing one].

2.  **Local Development**:
    ```bash
    npm run pages-dev
    ```

3.  **Deploy to Production**:
    ```bash
    npm run pages-deploy
    ```

### Testing the API
Once deployed, you can test the production API endpoints. Expect `[PAGES FUNCTIONS LEADS HIT]` logs in your Cloudflare dashboard to confirm the function is being invoked correctly.
**Manual API Tests (using `curl`):**
Replace `LEAD_ID` with an actual ID from the admin dashboard for PATCH and DELETE tests.
1.  **Health Check**
    ```bash
    curl https://securitycheck.vonbusch.app/api/health
    ```
2.  **Create a new lead**
    ```bash
    curl -X POST https://securitycheck.vonbusch.app/api/leads \
    -H "Content-Type: application/json" \
    -d '{
      "company": "Test Inc.",
      "contact": "John Doe",
      "email": "john@test.com",
      "phone": "+123456789",
      "employeesRange": "51-200",
      "consent": true,
      "scoreSummary": {"areaA": 4, "areaB": 2, "areaC": 5, "average": 3.67}
    }'
    ```
3.  **List Leads**
    ```bash
    curl https://securitycheck.vonbusch.app/api/leads?limit=5
    ```
4.  **Update a Lead (Mark as Processed)**
    ```bash
    curl -X PATCH https://securitycheck.vonbusch.app/api/leads/LEAD_ID \
    -H "Content-Type: application/json" \
    -d '{"processed": true}'
    ```
5.  **Delete a Lead**
    ```bash
    curl -X DELETE https://securitycheck.vonbusch.app/api/leads/LEAD_ID
    ```
## Production Checklist
Before going live, ensure:
- [ ] The `npm run deploy` command completes successfully.
- [ ] The admin login credentials (`admin` / `wmG7V6BNifmGjv7rEkh2`) are noted securely and changed if necessary.
- [ ] The funnel has been tested end-to-end in both German and English on the deployed URL.
- [ ] The Admin dashboard at `/admin` loads leads without any 500 errors.
- [ ] PDF report generation works as expected.
- [ ] PWA installation and offline functionality are verified.
- [ ] Plausible analytics domain (`check.vonbusch.digital`) is correctly configured if used.
## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push: `git push origin feature/amazing-feature`.
5. Open a Pull Request.
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.