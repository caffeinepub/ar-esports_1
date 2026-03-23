import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Navbar } from "./components/Navbar";
import { AdminPage } from "./pages/AdminPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <Outlet />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/$tournamentId",
  component: RegisterPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  registerRoute,
  adminRoute,
  historyRoute,
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
