# Base Wallet Audit x402 Service Overview

This document outlines a paid x402 service that audits Base wallets and returns an agent-readable decision report. The goal is to create a small, useful API that agents, wallets, and crypto apps can call before sending funds, accepting a counterparty, or interacting with a contract.

The service should be listed on CDP Bazaar and Agentic Market as a paid Base mainnet x402 endpoint.

## 1. Product thesis

Agents and apps need a fast answer before moving money:

```text
Should I proceed with this wallet or transaction context?
```

Most wallet tools are built for humans. This service should be built for agents. It should return structured evidence, a recommended action, and enough raw context for the caller to make its own policy decision.

The first version should avoid broad claims like "this wallet is safe" or "this wallet is a scam." Instead, it should report observable Base-chain facts:

- wallet type;
- wallet age and activity level;
- ETH and USDC readiness;
- recent transaction behavior;
- risky token approvals;
- interactions with unverified or suspicious contracts;
- counterparty freshness;
- evidence links and contract addresses.

## 2. Target users

The highest-value initial users are systems that need to make automated or semi-automated onchain decisions.

Primary users:

- AI payment agents checking a recipient before sending USDC;
- trading agents checking a wallet or token counterparty before execution;
- DeFi agents checking approvals before routing a user into a protocol;
- wallet apps adding a transaction or counterparty preflight screen;
- marketplaces checking merchant wallets before accepting payments;
- developers building Base apps who do not want to maintain indexing and risk logic.

Human users can also use it, but the API should be designed for agent consumption first.

## 3. Marketplace positioning

Recommended listing name:

```text
Base Wallet Decision Report
```

Short description:

```text
Audit a Base wallet before an agent sends funds, accepts a counterparty, or recommends an onchain action.
```

Category:

```text
crypto
```

Suggested tags:

```text
wallet-risk, base, approvals, counterparty, onchain, agent-safety, usdc
```

The strongest marketplace framing is not generic security. It is decision support for agents:

```text
Return proceed, caution, or block with evidence-backed reasons.
```

## 4. Endpoint design

Start with one paid endpoint, then split into cheaper and richer endpoints once demand is visible.

Recommended MVP endpoint:

```text
POST /api/wallet/audit
```

Suggested price:

```text
0.05 USDC
```

Future endpoint tiers:

| Endpoint | Price | Purpose |
| --- | ---: | --- |
| `POST /api/wallet/summary` | `0.01 USDC` | Basic wallet age, balances, activity, and type |
| `POST /api/wallet/approvals` | `0.02 USDC` | Token approvals and high-risk spenders |
| `POST /api/wallet/audit` | `0.05 USDC` | Full decision report with findings |
| `POST /api/wallet/deep-audit` | `0.10-0.15 USDC` | Richer history, labels, protocol context, and simulation |

## 5. Request schema

MVP request:

```json
{
  "address": "0x0000000000000000000000000000000000000000",
  "intent": "counterparty"
}
```

Supported intents:

| Intent | Meaning |
| --- | --- |
| `counterparty` | Caller is deciding whether to trust or transact with this wallet |
| `self-audit` | Caller is auditing its own wallet state |
| `pre-transaction` | Caller is checking risk before a specific transaction |
| `portfolio` | Caller wants general wallet health and exposure context |

Future request fields:

```json
{
  "address": "0x0000000000000000000000000000000000000000",
  "intent": "pre-transaction",
  "transaction": {
    "to": "0x0000000000000000000000000000000000000000",
    "value": "0",
    "data": "0x"
  },
  "includeEvidence": true
}
```

## 6. Response schema

The response should be deterministic, compact, and easy for an agent to parse.

Example response:

```json
{
  "address": "0x0000000000000000000000000000000000000000",
  "network": "eip155:8453",
  "observedAtBlock": 12345678,
  "walletType": "eoa",
  "decision": "caution",
  "risk": {
    "score": 68,
    "level": "medium",
    "confidence": "medium"
  },
  "recommendedAction": "request_human_confirmation",
  "summary": "Wallet is active but has high-risk token approval exposure.",
  "balances": {
    "ethWei": "1200000000000000",
    "usdcBaseUnits": "25000000"
  },
  "activity": {
    "transactionCount": 42,
    "firstSeenBlock": 11111111,
    "recentTransactionCount30d": 8
  },
  "findings": [
    {
      "id": "unlimited-usdc-approval",
      "severity": "high",
      "title": "Unlimited USDC approval detected",
      "description": "Wallet has granted a very large USDC allowance to a spender contract.",
      "evidence": {
        "asset": "USDC",
        "spender": "0x0000000000000000000000000000000000000000",
        "allowance": "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      }
    }
  ],
  "limitations": [
    "Only Base mainnet was checked.",
    "Offchain identity, sanctions, and private threat-intelligence labels are not included."
  ]
}
```

Recommended `decision` values:

| Decision | Meaning |
| --- | --- |
| `proceed` | No material risk signals found for the requested intent |
| `caution` | Some risk or uncertainty exists; caller should add confirmation |
| `block` | Strong risk signal found; caller should not proceed automatically |
| `unknown` | Not enough data to produce a useful decision |

Recommended actions:

```text
proceed
request_human_confirmation
reduce_limits
revoke_approval
block_transaction
retry_later
```

## 7. Scoring model

The score should be transparent and evidence-backed. Do not make it look more scientific than it is.

Suggested first scoring weights:

| Category | Weight | Examples |
| --- | ---: | --- |
| Approvals | 35 | Unlimited approvals, unknown spenders, stale approvals |
| Contract and counterparty signals | 25 | Contract wallet, unverified contracts, risky interactions |
| Transaction behavior | 20 | Very new wallet, unusual recent activity, failed transaction patterns |
| Wallet age and activity | 10 | First seen recently, very low transaction count |
| Operational readiness | 10 | Insufficient ETH for gas, insufficient USDC for payment |

Each finding should include:

- a stable finding id;
- severity;
- human-readable title;
- short description;
- machine-readable evidence;
- related addresses, transaction hashes, or block numbers when available.

## 8. Data sources

The MVP can start with deterministic Base-chain reads:

- `eth_getBalance` for ETH balance;
- `eth_getTransactionCount` for basic activity;
- `eth_getCode` to distinguish EOA from contract wallet;
- `eth_call` for ERC-20 balances and allowances when known tokens/spenders are checked;
- `eth_getLogs` for recent token transfers and approvals when a provider supports the needed range.

For production quality, use a managed RPC or indexer. Public RPC endpoints are useful for development but are rate limited and should not be the long-term dependency for a paid service.

Potential provider layers:

- Base RPC or CDP Node for live chain reads;
- an indexer for historical transfers, approvals, and first-seen data;
- optional third-party labels later for richer counterparty risk;
- optional transaction simulation later for `pre-transaction` intent.

Do not require users to share private keys, seed phrases, or wallet signatures for a basic audit.

## 9. x402 and marketplace requirements

The service should follow the same listing pattern from `CDP-BAZAAR-LISTING-RUNBOOK.md`:

- deploy at a stable HTTPS URL;
- return `402 Payment Required` to unauthenticated requests;
- include x402 v2 payment requirements;
- include Bazaar discovery metadata;
- include a stable resource URL without test input baked into the catalog path;
- advertise request input separately in Bazaar metadata;
- settle at least one fresh payment after deployment so marketplaces can index it;
- verify listing on both CDP Bazaar and Agentic Market.

Suggested Bazaar input metadata:

```json
{
  "type": "http",
  "method": "POST",
  "body": {
    "address": "0x0000000000000000000000000000000000000000",
    "intent": "counterparty"
  }
}
```

Suggested Bazaar output metadata:

```json
{
  "type": "json",
  "example": {
    "decision": "caution",
    "risk": {
      "score": 68,
      "level": "medium",
      "confidence": "medium"
    },
    "recommendedAction": "request_human_confirmation"
  }
}
```

## 10. MVP implementation plan

Build the first version in small slices.

1. Create `POST /api/wallet/audit` with x402 paywall and marketplace metadata.
2. Validate and normalize the submitted Base address.
3. Add wallet type, ETH balance, USDC balance, and transaction count.
4. Add basic age/activity fields from an indexer or provider-supported history endpoint.
5. Add known-token approval checks for USDC first. If no approval indexer is available, start with configured high-value spenders and clearly mark the report as partial.
6. Return `decision`, `risk`, `recommendedAction`, `findings`, and `limitations`.
7. Add listing checks for CDP Bazaar and Agentic Market.
8. Deploy, make a fresh payment, and confirm indexing.

The first useful version does not need perfect labels or deep analytics. It needs reliable structured output and honest limitations.

## 11. Risks and guardrails

Avoid these mistakes:

- Do not claim that a wallet is definitively safe.
- Do not claim sanctions, criminal activity, or fraud unless backed by a licensed authoritative source.
- Do not expose CDP credentials or provider keys to client code.
- Do not make marketplace metadata depend on a sample address.
- Do not return `400` to unauthenticated requests before the x402 challenge.
- Do not charge for an endpoint that cannot produce useful evidence.

Recommended wording:

```text
This report is based on observable Base mainnet data and configured risk rules. It is not legal, financial, sanctions, or fraud-detection advice.
```

## 12. Future expansion

Once the MVP has marketplace usage, expand toward higher-priced reports:

- approval revocation recommendations;
- transaction simulation for proposed calls;
- token risk and liquidity checks;
- protocol-specific risk modules;
- historical counterparty graph;
- known exploit interaction detection;
- address labels from trusted providers;
- webhook monitoring for watched wallets;
- multi-chain support beyond Base.

The best long-term version is not just a report. It is a transaction preflight layer for agents.
