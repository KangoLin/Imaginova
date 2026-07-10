"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

interface Transaction {
  id: number; type: string; amount: number; description: string; created_at: string;
}

interface UserData { name: string; email: string; credits: number; }

const RECHARGE_AMOUNTS = [
  { credits: 5, price: 4.99 },
  { credits: 10, price: 9.99 },
  { credits: 20, price: 18.99 },
  { credits: 50, price: 44.99 },
];

export default function CreditsPage() {
  return <Suspense fallback={<CreditsLoading />}><CreditsContent /></Suspense>;
}

function CreditsLoading() {
  return (
    <div className="container-narrow px-6 py-12">
      <div className="h-4 w-24 bg-muted rounded animate-pulse mb-6" />
      <div className="h-40 bg-muted rounded-xl animate-pulse mb-6" />
      <div className="h-32 bg-muted rounded-xl animate-pulse mb-6" />
      <div className="h-48 bg-muted rounded-xl animate-pulse" />
    </div>
  );
}

function CreditsContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLocale();
  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    const [me, txs] = await Promise.all([
      api.get<UserData>("/api/me"),
      api.get<Transaction[]>("/api/credits/transactions"),
    ]);
    setUser(me);
    setTransactions(txs);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await fetchData();
        if (searchParams.get("success") === "1") toast(t("credits.paymentSuccess"), "success");
        else if (searchParams.get("cancelled") === "1") toast(t("credits.paymentCancelled"), "info");
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 401)) throw err;
      }
      setLoading(false);
    })();
  }, [fetchData, searchParams, toast]);

  const handleRecharge = async (credits: number) => {
    setRecharging(credits);
    try {
      const { url } = await api.post<{ url: string }>("/api/credits/checkout", { credits });
      window.location.href = url;
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, "error");
      setRecharging(null);
    }
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
          <p className="text-sm text-muted-foreground font-medium mb-1">{t("credits.yourBalance")}</p>
          <p className="text-6xl font-bold tracking-tight text-primary">{user.credits}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("create.credits")}</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader><CardTitle>{t("credits.recharge")}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {RECHARGE_AMOUNTS.map((opt) => (
                  <Button key={opt.credits} variant={recharging === opt.credits ? "default" : "outline"} onClick={() => handleRecharge(opt.credits)} disabled={recharging !== null} className="flex-1 min-w-[90px] gap-1.5 flex-col py-3 h-auto leading-tight">
                    {recharging === opt.credits ? <LoadingSpinner size="sm" /> : <><span className="text-base font-bold">+{opt.credits}</span><span className="text-[10px] font-normal text-muted-foreground">${opt.price}</span></>}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">{t("credits.securedBy")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("credits.transactionHistory")}</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t("credits.noTransactions")}</p>
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
