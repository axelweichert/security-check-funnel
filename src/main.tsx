import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, Suspense, lazy } from 'react'
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
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then(module => ({ default: module.AdminPage })));
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    loader: async () => null,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
    loader: async () => null,
    errorElement: <RouteErrorBoundary />,
  },
]);
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton className="h-screen w-screen rounded-none" />}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </QueryClientProvider>
  </StrictMode>
);
if (import.meta.hot) {
  // Enable HMR for this entry point
  import.meta.hot.accept();
}
// Add a dummy export to satisfy the react-refresh/only-export-components lint rule for entry points.
export {};