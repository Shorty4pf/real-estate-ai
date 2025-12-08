// frontend/src/billing.ts

/*
 * Frontend helper to start a Stripe checkout session via the backend.
 * Matches backend endpoint POST /api/create-checkout-session with body { plan: 'premium'|'pro', billing: 'month'|'year' }
 */
export type PlanName = "premium" | "pro";
export type BillingPeriod = "month" | "year";

const getApiUrl = () => {
  // Force production URL to bypass Vercel caching issues
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) return 'http://localhost:3001';
  }
  
  // HARDCODED production backend URL (cy05 - Render Starter plan)
  return 'https://real-estate-ai-backend-cy05.onrender.com';
};

const API_URL = getApiUrl();

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

    console.log(`Starting checkout for ${plan} (${billing}) using API URL: ${API_URL}`);

    const res = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: "POST",
      headers,
      body: JSON.stringify({ plan, billing }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error (${res.status}): ${errorText}`);
      alert("Impossible de lancer le paiement pour le moment. Vérifiez votre connexion et réessayez.");
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
    alert("Erreur réseau. Vérifiez votre connexion et réessayez.");
  }
}
