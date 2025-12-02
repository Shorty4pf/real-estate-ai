// frontend/src/billing.ts

/*
 * Frontend helper to start a Stripe checkout session via the backend.
 * Matches backend endpoint POST /api/create-checkout-session with body { plan: 'premium'|'pro', billing: 'month'|'year' }
 */
export type PlanName = "premium" | "pro";
export type BillingPeriod = "month" | "year";

export async function startCheckout(plan: PlanName, billing: BillingPeriod) {
  if (!["premium", "pro"].includes(plan)) {
    console.error("Invalid plan", plan);
    return;
  }

  if (!["month", "year"].includes(billing)) {
    console.error("Invalid billing period", billing);
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const headers: Record<string,string> = { "Content-Type": "application/json" };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch("http://localhost:4242/api/create-checkout-session", {
      method: "POST",
      headers,
      body: JSON.stringify({ plan, billing }),
    });

    if (!res.ok) {
      console.error("Backend error while creating checkout session", await res.text());
      alert("Impossible de lancer le paiement pour le moment.");
      return;
    }

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Unexpected backend response:", data);
      alert("Erreur lors de la création de la session de paiement.");
    }
  } catch (err) {
    console.error("Network error while calling checkout endpoint:", err);
    alert("Erreur réseau, réessaie dans quelques secondes.");
  }
}
