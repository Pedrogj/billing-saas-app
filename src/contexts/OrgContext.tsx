import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type Org = { id: string; name: string; slug: string; owner_id: string };
type Subscription = { status: "pending" | "active" | "past_due" | "canceled" };
type Entitlements = {
  max_users: number;
  max_items: number;
  storage_mb: number;
  enable_invites: boolean;
  enable_uploads: boolean;
};

type OrgCtx = {
  org: Org | null;
  subscription: Subscription | null;
  entitlements: Entitlements | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const OrgContext = createContext<OrgCtx>({
  org: null,
  subscription: null,
  entitlements: null,
  loading: true,
  refresh: async () => {},
});

export const OrgProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [org, setOrg] = useState<Org | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;

    setLoading(true);

    // 1) buscar la primera org donde el usuario sea miembro (starter simple)
    const { data: membership, error: mErr } = await supabase
      .from("organization_members")
      .select("org_id")
      .limit(1)
      .maybeSingle();

    if (mErr) throw mErr;

    if (!membership?.org_id) {
      setOrg(null);
      setSubscription(null);
      setEntitlements(null);
      setLoading(false);
      return;
    }

    // 1.1) obtener el objeto org (ahora sí es 1 solo)
    const { data: firstOrg, error: oErr } = await supabase
      .from("organizations")
      .select("id,name,slug,owner_id")
      .eq("id", membership.org_id)
      .single();

    if (oErr) throw oErr;

    setOrg(firstOrg);

    // 2) subscription
    const { data: sub, error: sErr } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("org_id", firstOrg.id)
      .maybeSingle();

    if (sErr) throw sErr;
    setSubscription(sub); // sub puede ser null si aún no existe

    // 3) entitlements
    const { data: ent, error: eErr } = await supabase
      .from("entitlements")
      .select("max_users,max_items,storage_mb,enable_invites,enable_uploads")
      .eq("org_id", firstOrg.id)
      .maybeSingle();

    if (eErr) throw eErr;
    setEntitlements(ent); // ent puede ser null si aún no existe

    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setOrg(null);
      setSubscription(null);
      setEntitlements(null);
      setLoading(false);
      return;
    }
    refresh().catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const value = useMemo(
    () => ({ org, subscription, entitlements, loading, refresh }),
    [org, subscription, entitlements, loading],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export const useOrg = () => useContext(OrgContext);
