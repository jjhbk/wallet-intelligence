# Marketplace launch checklist

The code now exposes:

- HTTP x402 endpoint: `/api/wallet/audit`
- MCP Streamable HTTP endpoint: `/api/mcp`
- Agent tool manifest: `/.well-known/ai-tool/audit_base_wallet.json`
- Public icon: `/icon.svg`

Before launch, configure `PUBLIC_APP_URL`, `MERCHANT_WALLET`, CDP credentials, `DATABASE_URL`, and—if compliance enrichment is required—`WALLET_INTELLIGENCE_URL`.

After deploying to public HTTPS:

1. Request the HTTP endpoint without payment and verify `402`, `PAYMENT-REQUIRED`, tags, service name, schema, and icon URL.
2. Validate the URL with the CDP facilitator and complete one fresh Base settlement.
3. Query CDP merchant discovery/Bazaar and wait for asynchronous indexing.
4. Connect an MCP client to `/api/mcp`, list tools, and invoke `audit_base_wallet`.
5. Publish the Agentic project, then submit the public product for curated marketplace review.
