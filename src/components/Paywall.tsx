import { Navigate } from "react-router-dom";
import { useOrg } from "../contexts/OrgContext";

export const Paywall = ({ children }: { children: React.ReactNode }) => {
  const { org, subscription, loading } = useOrg();

  if (loading) return <div>Cargando...</div>;
  if (!org) return <Navigate to="/onboarding/create-org" replace />;

  if (!subscription || subscription.status !== "active") {
    return <Navigate to="/app/billing" replace />;
  }

  return <>{children}</>;
};
