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
import { Skeleton } from '@/components/ui/skeleton';
import { HomePage } from '@/pages/HomePage';
import { AdminPage } from '@/pages/AdminPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
{
    path: "/",
    element: <HomePage />,
},
{
    path: "/admin",
    element: <AdminPage />,
},
]);
const container = document.getElementById('root')!;
let root: Root | null = null;

// Enable HMR for this entry point and ensure proper cleanup
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    // Unmount the existing React root before the module is replaced
    root?.unmount();
    root = null;
  });
}

// Create (or recreate) the React root and render the app
root = createRoot(container);
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
// Add a dummy export to satisfy the react-refresh/only-export-components lint rule for entry points.
export {};