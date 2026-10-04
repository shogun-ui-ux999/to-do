import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Toaster } from "~/lib/components/ui/toast";
import { convex } from "~/lib/convex";
import { RequireAuth } from "~/components/require-auth";
import AuthPage from "~/pages/auth";
import Dashboard from "~/pages/dashboard";
import LandingPage from "~/pages/landing";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/app",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={router} />
      <Toaster />
    </ConvexAuthProvider>
  </React.StrictMode>
);
