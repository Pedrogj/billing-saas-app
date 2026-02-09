import { useOrg } from "../../contexts/OrgContext";

const NET = 17000;
const TAX = 3230;
const TOTAL = 20230;

export const Billing = () => {
  const { org, subscription, loading } = useOrg();

  if (loading) return <div>Cargando...</div>;
  if (!org) return <div>Sin organización</div>;
  return (
    <div>
      <h2>Plan y facturación</h2>
      <p>
        Plan Basic: ${NET.toLocaleString("es-CL")} + IVA (Total $
        {TOTAL.toLocaleString("es-CL")})
      </p>
      <p>
        Estado: <b>{subscription?.status ?? "pending"}</b>
      </p>

      <button>
        Suscribirme (Mercado Pago){" "}
        {/* aquí luego llamas a tu Edge Function create_subscription_link */}
      </button>

      <button>Cambiar tarjeta {/* v1: re-suscripción controlada */}</button>

      <button>Cancelar</button>
    </div>
  );
};
