import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { AdminPage } from '@/pages/AdminPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
const container = document.getElementById('root');
let root: Root | null = null;
function renderApp() {
  if (!container) {
    console.error("Root container not found. App cannot be rendered.");
    return;
  }
  // Ensure we only have one root
  if (!root) {
    root = createRoot(container);
  }
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </Layout>
      </QueryClientProvider>
    </StrictMode>
  );
}
// Initial render
renderApp();
// Enable HMR for this entry point and ensure proper cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Unmount the existing React root before the module is replaced
    root?.unmount();
    root = null;
  });
  // Re-render on accept, which will call renderApp again
  import.meta.hot.accept();
}
// Add a dummy export to satisfy the react-refresh/only-export-components lint rule for entry points.
export {};