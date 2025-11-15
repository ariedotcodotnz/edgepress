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
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { UsersPage } from '@/pages/admin/UsersPage';
const router = createBrowserRouter([
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
    element: <Outlet />, // A simple outlet for grouping admin routes
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "login", element: <LoginPage /> },
      {
        path: "media",
        element: <AdminLayout />,
        children: [
          { path: "", element: <DashboardPage /> },
          { path: "press-releases", element: <PressReleasesListPage /> },
          { path: "press-releases/new", element: <PressReleaseEditPage /> },
          { path: "press-releases/:id/edit", element: <PressReleaseEditPage /> },
          { path: "pages", element: <StaticPagesPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "users", element: <UsersPage /> },
        ]
      }
    ]
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)