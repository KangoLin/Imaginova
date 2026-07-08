"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

const RECHARGE_AMOUNTS = [5, 10, 20, 50];

export default function CreditsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; credits: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const meRes = await fetch("/api/me");
    if (meRes.status === 401) { router.push("/login"); return; }
    setUser(await meRes.json());

    const txRes = await fetch("/api/credits/transactions");
    setTransactions(await txRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleRecharge = async (amount: number) => {
    setRecharging(amount);
    setMessage("");
    const res = await fetch("/api/credits/recharge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    setRecharging(null);
    if (data.error) { setMessage(data.error); return; }
    setUser((prev) => prev ? { ...prev, credits: data.credits } : prev);
    setMessage(`Recharged ${amount} credits successfully!`);
    fetchData();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
        <div className="mt-6 h-32 bg-[var(--muted)] rounded-xl animate-pulse" />
        <div className="mt-6 h-48 bg-[var(--muted)] rounded-xl animate-pulse" />
        <div className="mt-6 h-64 bg-[var(--muted)] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <Link href="/dashboard" className="text-[var(--primary)] underline text-sm">&larr; Back to Dashboard</Link>

      <div className="mt-6 bg-[var(--bg)] rounded-xl shadow-sm border border-[var(--border)] p-6 text-center">
        <p className="text-sm text-[var(--muted-fg)]">Current Balance</p>
        <p className="text-4xl font-bold text-[var(--primary)] mt-1">{user.credits}</p>
        <p className="text-sm text-[var(--muted-fg)] mt-1">credits</p>
      </div>

      {message && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm text-center animate-fade-in">{message}</div>
      )}

      <div className="mt-6 bg-[var(--bg)] rounded-xl shadow-sm border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold mb-4">Recharge</h2>
        <div className="flex flex-wrap gap-3">
          {RECHARGE_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handleRecharge(amount)}
              disabled={recharging === amount}
              className="flex-1 min-w-[80px] border border-[var(--border)] text-[var(--primary)] rounded-lg py-3 text-center hover:bg-[var(--muted)] disabled:opacity-50 transition"
            >
              {recharging === amount ? "..." : `+${amount}`}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-fg)] mt-3">Mock recharge — no payment required</p>
      </div>

      <div className="mt-6 bg-[var(--bg)] rounded-xl shadow-sm border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)] text-center py-4">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm text-[var(--fg)] capitalize">{tx.description || tx.type}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{tx.created_at}</p>
                </div>
                <span className={`text-sm font-medium ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
