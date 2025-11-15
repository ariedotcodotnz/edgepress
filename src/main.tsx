import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Auth
import { AuthProvider } from '@/auth/AuthProvider'; // This now correctly points to the consolidated file
import { ProtectedRoute } from '@/auth/ProtectedRoute';
// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
// Public Pages
import { HomePage } from '@/pages/HomePage';
import { PressReleasePage } from '@/pages/public/PressReleasePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { AssetsPage } from '@/pages/public/AssetsPage';
// Admin Pages
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { PressReleasesListPage } from '@/pages/admin/PressReleasesListPage';
import { PressReleaseEditPage } from '@/pages/admin/PressReleaseEditPage';
import { StaticPagesPage } from '@/pages/admin/StaticPagesPage';
import { StaticPageEditPage } from '@/pages/admin/StaticPageEditPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { UsersPage } from '@/pages/admin/UsersPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <PublicLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/press/:slug", element: <PressReleasePage /> },
          { path: "/about", element: <AboutPage /> },
          { path: "/contact", element: <ContactPage /> },
          { path: "/assets", element: <AssetsPage /> },
        ]
      },
      {
        path: "/admin",
        element: <Outlet />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: "login", element: <LoginPage /> },
          {
            path: "media",
            element: <ProtectedRoute />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: "", element: <DashboardPage /> },
                  { path: "press-releases", element: <PressReleasesListPage /> },
                  { path: "press-releases/new", element: <PressReleaseEditPage /> },
                  { path: "press-releases/:id/edit", element: <PressReleaseEditPage /> },
                  { path: "pages", element: <StaticPagesPage /> },
                  { path: "pages/:id/edit", element: <StaticPageEditPage /> },
                  { path: "analytics", element: <AnalyticsPage /> },
                  { path: "users", element: <UsersPage /> },
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)