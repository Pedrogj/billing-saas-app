import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrg } from "../../contexts/OrgContext";
import { supabase } from "../../lib/supabase";

export const CreateOrg = () => {
  const { user } = useAuth();
  const { refresh } = useOrg();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!user) return;
    setLoading(true);

    // 1) create org
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name, slug, owner_id: user.id })
      .select()
      .single();

    if (orgErr) throw orgErr;

    // 2) add owner membership
    const { error: memErr } = await supabase
      .from("organization_members")
      .insert({ org_id: org.id, user_id: user.id, role: "owner" });

    if (memErr) throw memErr;

    // 3) default entitlements (free-mode o base)
    const { error: entErr } = await supabase
      .from("entitlements")
      .insert({ org_id: org.id });

    if (entErr) throw entErr;

    // 4) subscription placeholder (pending)
    const { error: subErr } = await supabase
      .from("subscriptions")
      .insert({ org_id: org.id, status: "pending" });

    if (subErr) throw subErr;

    await refresh();
    nav("/app/billing");
  };

  return (
    <div>
      <h2>Crear organización</h2>
      <input
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <button disabled={loading} onClick={onCreate}>
        Crear
      </button>
    </div>
  );
};
