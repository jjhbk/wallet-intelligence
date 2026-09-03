"use client";

import { FormEvent, useState } from "react";

export function AuditForm() {
  const [address, setAddress] = useState("");
  const [intent, setIntent] = useState("counterparty");
  const [chain, setChain] = useState("base");
  const [to, setTo] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = address.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError("Enter a valid 42-character EVM wallet address.");
      return;
    }
    setError("");
    const params = new URLSearchParams({ address: trimmed, intent, chain });
    if (intent === "pre-transaction") params.set("transaction", JSON.stringify({ to: to.trim(), data: data.trim() || "0x" }));
    window.location.assign(`/api/wallet/audit?${params}`);
  }

  return <form className="audit-form" onSubmit={submit}>
    <label htmlFor="address">Wallet address</label>
    <input id="address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="0x..." spellCheck={false} autoComplete="off" />
    <label htmlFor="chain">Chain</label>
    <select id="chain" value={chain} onChange={(event) => setChain(event.target.value)}><option value="base">Base</option><option value="ethereum">Ethereum</option><option value="arbitrum">Arbitrum One</option><option value="optimism">Optimism</option></select>
    <label htmlFor="intent">Audit intent</label>
    <select id="intent" value={intent} onChange={(event) => setIntent(event.target.value)}>
      <option value="counterparty">Counterparty</option>
      <option value="self-audit">Self audit</option>
      <option value="pre-transaction">Pre-transaction</option>
      <option value="portfolio">Portfolio</option>
    </select>
    {intent === "pre-transaction" && <><label htmlFor="to">Transaction recipient</label><input id="to" value={to} onChange={(event) => setTo(event.target.value)} placeholder="0x..." spellCheck={false} /><label htmlFor="data">Calldata (optional)</label><input id="data" value={data} onChange={(event) => setData(event.target.value)} placeholder="0x..." spellCheck={false} /></>}
    {error && <p className="form-error">{error}</p>}
    <button className="button" type="submit">Audit wallet →</button>
    <small>Price: 0.05 USDC. Payment settles on Base; audits can inspect any supported chain.</small>
  </form>;
}
