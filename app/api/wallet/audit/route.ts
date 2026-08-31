import { NextRequest } from "next/server";
import { getPaywall } from "../../../../lib/payments";
import { inspectWallet } from "../../../../lib/audit/provider";
import { buildReport } from "../../../../lib/audit/scoring";
import { auditRequestSchema } from "../../../../lib/validation";
import { renderBrowserPaywall } from "../../../../lib/browser-paywall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleAudit(request);
}

export async function GET(request: NextRequest) {
  const input = { address: request.nextUrl.searchParams.get("address"), intent: request.nextUrl.searchParams.get("intent") };
  return handleAudit(request, input);
}

async function handleAudit(request: NextRequest, input?: unknown) {
  const paywall = await getPaywall();
  const payment = await paywall.handle({ path: "/api/wallet/audit", method: "POST", resource: request.url,
    query: request.nextUrl.searchParams,
    paymentHeader: request.headers.get("payment-signature") ?? request.headers.get("x-payment") });
  if (payment.kind !== "paid") {
    if (request.headers.get("accept")?.includes("text/html") && payment.challenge) {
      const html = await renderBrowserPaywall(payment.challenge, request.url);
      const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
      if (payment.paymentRequiredHeader) headers.set("PAYMENT-REQUIRED", payment.paymentRequiredHeader);
      return new Response(html, { status: payment.status ?? 402, headers });
    }
    const headers = new Headers();
    if (payment.paymentRequiredHeader) headers.set("PAYMENT-REQUIRED", payment.paymentRequiredHeader);
    if (payment.ap2CheckoutJwt) headers.set("AP2-CHECKOUT-JWT", payment.ap2CheckoutJwt);
    return new Response(JSON.stringify(payment.challenge ?? { error: payment.reason }), { status: payment.status ?? 402, headers });
  }
  try {
    const parsed = auditRequestSchema.safeParse(input ?? await request.json().catch(() => undefined));
    if (!parsed.success) return Response.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
    const report = buildReport(await inspectWallet(parsed.data.address));
    const headers = new Headers();
    if (payment.settlementHeader) headers.set("PAYMENT-RESPONSE", payment.settlementHeader);
    return Response.json(report, { status: 200, headers });
  } catch (error) {
    console.error("wallet audit failed", error);
    return Response.json({ error: "audit_unavailable", message: "Base chain data is temporarily unavailable.", recommendedAction: "retry_later" }, { status: 503 });
  }
}
