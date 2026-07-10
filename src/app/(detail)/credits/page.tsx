"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Transaction {
  id: number; type: string; amount: number; description: string; created_at: string;
}

const RECHARGE_AMOUNTS = [5, 10, 20, 50];

export default function CreditsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; email: string; credits: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState<number | null>(null);

  useEffect(() => { (async () => {
    const meRes = await fetch("/api/me");
    if (meRes.status === 401) { router.push("/login"); return; }
    setUser(await meRes.json());
    const txRes = await fetch("/api/credits/transactions");
    setTransactions(await txRes.json());
    setLoading(false);
  })(); }, [router]);

  const handleRecharge = async (amount: number) => {
    setRecharging(amount);
    const res = await fetch("/api/credits/recharge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    setRecharging(null);
    if (data.error) { toast(data.error, "error"); return; }
    toast(`Recharged ${amount} credits successfully!`, "success");
    const meRes = await fetch("/api/me");
    setUser(await meRes.json());
    const txRes = await fetch("/api/credits/transactions");
    setTransactions(await txRes.json());
  };

  if (loading) {
    return (
      <div className="container-narrow px-6 py-12">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-6" />
        <div className="h-40 bg-muted rounded-xl animate-pulse mb-6" />
        <div className="h-32 bg-muted rounded-xl animate-pulse mb-6" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
      <main className="container-narrow px-6 pt-24 pb-12 animate-slide-up">
        <div className="max-w-lg mx-auto text-center mb-10">
          <p className="text-sm text-muted-foreground font-medium mb-1">Your Balance</p>
          <p className="text-6xl font-bold tracking-tight text-primary">{user.credits}</p>
          <p className="text-sm text-muted-foreground mt-1">credits</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader><CardTitle>Recharge</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {RECHARGE_AMOUNTS.map((amount) => (
                  <Button key={amount} variant={recharging === amount ? "default" : "outline"} onClick={() => handleRecharge(amount)} disabled={recharging !== null} className="flex-1 min-w-[70px] gap-1.5">
                    {recharging === amount && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
                    {recharging === amount ? "..." : `+${amount}`}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">Mock recharge — no payment required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No transactions yet.</p>
              ) : (
                <div className="space-y-1">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="text-sm text-foreground font-medium capitalize">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">{tx.created_at}</p>
                      </div>
                      <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-primary" : "text-destructive"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
  );
}
