import { createBrowserRouter } from "react-router-dom";
import { Login, Register } from "./routes/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CreateOrg } from "./routes/Onboarding";
import { Billing, Dashboard, Team } from "./routes/App";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "onboarding/create-org", element: <CreateOrg /> },
      { path: "app/dashboard", element: <Dashboard /> },
      { path: "app/billing", element: <Billing /> },
      { path: "app/team", element: <Team /> },
    ],
  },
]);
