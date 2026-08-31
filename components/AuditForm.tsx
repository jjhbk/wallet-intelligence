"use client";

import { FormEvent, useState } from "react";

export function AuditForm() {
  const [address, setAddress] = useState("");
  const [intent, setIntent] = useState("counterparty");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = address.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError("Enter a valid 42-character EVM wallet address.");
      return;
    }
    setError("");
    window.location.assign(`/api/wallet/audit?address=${encodeURIComponent(trimmed)}&intent=${encodeURIComponent(intent)}`);
  }

  return <form className="audit-form" onSubmit={submit}>
    <label htmlFor="address">Wallet address</label>
    <input id="address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="0x..." spellCheck={false} autoComplete="off" />
    <label htmlFor="intent">Audit intent</label>
    <select id="intent" value={intent} onChange={(event) => setIntent(event.target.value)}>
      <option value="counterparty">Counterparty</option>
      <option value="self-audit">Self audit</option>
      <option value="pre-transaction">Pre-transaction</option>
      <option value="portfolio">Portfolio</option>
    </select>
    {error && <p className="form-error">{error}</p>}
    <button className="button" type="submit">Audit wallet →</button>
    <small>Price: 0.05 USDC on Base mainnet.</small>
  </form>;
}
