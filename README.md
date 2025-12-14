# vonbusch-security-funnel
[cloudflarebutton]
A stylish 3-step Security Check funnel (in German and English) with scoring, results evaluation, and lead form to initiate consultations. This is a high-quality, multilingual sales tunnel website (single-page flow) for von Busch GmbH, aimed at generating qualified B2B leads in the DACH market. The goal is to provide an automated, point-based assessment of security maturity (VPN / Web / Awareness) within 2–3 minutes through three stages (Basic → Detail → Maturity Level). Results include per-area traffic light ratings, overall assessment, and a lead form. The interface is mobile-first, visually premium (gradient hero, subtle shadows, micro-interactions), and built using shadcn/ui components, Tailwind v3 utilities, and Cloudflare Pages Functions with KV storage.
## Features
- **Interactive 3-Step Funnel**: Basis-Check (3 mandatory questions on VPN, Web processes, and awareness), conditional Detail-Check, and Maturity/Risk assessment.
- **Client-Side Scoring**: Automatic calculation of maturity levels (0-6 points per area) with traffic light visualizations (red/yellow/green) and personalized recommendations.
- **Lead Generation**: Secure form for company details, contact info, employee count, and GDPR consent, persisted via Cloudflare KV.
- **Visual Excellence**: Modern UI with gradients, smooth animations (framer-motion), responsive design, and micro-interactions for delightful user experience.
- **German-Language Focus**: All copy in German using informal "Du" tone, targeted at IT leaders/CIOs/CISOs in mid-sized DACH companies.
- **Performance & Accessibility**: Fast-loading, mobile-optimized, with proper ARIA labels, focus states, and contrast ratios.
- **Backend Integration**: Hono-based API on Cloudflare Pages Functions for lead persistence; extensible for CRM webhooks and analytics.
- **Multilingual Support**: A toggle in the top-right corner allows users to switch between German (DE) and English (EN). The language preference is saved to local storage.
- **Privacy-Friendly Analytics**: Utilizes Plausible.io for cookie-free, GDPR-compliant analytics. Tracking is strictly opt-in, enabled only after user consent is given.
- **PWA & Offline Support**: Service worker enables offline access, allowing users to complete the funnel even with intermittent connectivity.
## Tech Stack
- **Frontend**: React 18, React Router, Tailwind CSS v3, shadcn/ui, framer-motion, lucide-react, react-hook-form + Zod, @tanstack/react-query, sonner.
- **State Management**: Zustand (for UI state and language preference; primitive selectors only to avoid re-renders).
- **Backend**: Cloudflare Pages Functions, Hono (routing), Cloudflare KV (for leads storage).
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
## Deployment to Cloudflare Pages (Production Workflow)
This project is optimized for a unified deployment on Cloudflare Pages, combining the static frontend with a serverless API backend powered by Pages Functions and KV storage.
**To deploy the entire application (Frontend + Functions API):**
1.  **Connect your Git repository** to a new Cloudflare Pages project.
2.  **Configure Build Settings**:
    -   **Build command**: `npm run build`
    -   **Build output directory**: `dist`
    -   **Root directory**: (leave blank if your `package.json` is in the root)
3.  **Create and Bind a KV Namespace:**
    -   In your Cloudflare dashboard, go to **Workers & Pages > KV**.
    -   Create a new namespace (e.g., `vonbusch-leads`).
    -   Navigate to your Pages project > **Settings** > **Functions**.
    -   Under **KV namespace bindings**, click **Add binding**.
    -   Set the **Variable name** to `KV_LEADS` and select the KV namespace you just created.
    -   Save the binding. Your functions will now have access to the KV store.
4.  **Deploy!** Cloudflare Pages will automatically build and deploy your site.
### Testing the API
Once deployed, you can test the API endpoints. Replace `your-project.pages.dev` with your actual Pages URL.
**Create a new lead:**
```bash
curl -X POST https://your-project.pages.dev/api/leads \
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
**List leads:**
```bash
curl https://your-project.pages.dev/api/leads
```
## Production Checklist
Before going live, ensure:
- [ ] The `KV_LEADS` binding is correctly configured in the Cloudflare dashboard.
- [ ] The admin login credentials (`admin` / `wmG7V6BNifmGjv7rEkh2`) are noted securely.
- [ ] The funnel has been tested end-to-end in both German and English.
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