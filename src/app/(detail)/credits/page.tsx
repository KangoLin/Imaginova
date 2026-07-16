"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

interface Transaction { id: number; type: string; amount: number; description: string; created_at: string; }
interface UserData { name: string; email: string; credits: number; }
interface TaskItem { key: string; reward: number; completed: boolean; conditionMet: boolean; progress: { current: number; total: number }; }

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
    <div className="max-w-lg mx-auto px-6 pt-24 pb-12">
      <div className="h-5 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="h-32 bg-muted rounded-xl animate-pulse mb-6" />
      <div className="h-40 bg-muted rounded-xl animate-pulse mb-6" />
    </div>
  );
}

function CreditsContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLocale();
  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [me, txs, taskData] = await Promise.all([
      api.get<UserData>("/api/me"),
      api.get<Transaction[]>("/api/credits/transactions"),
      api.get<TaskItem[]>("/api/tasks"),
    ]);
    setUser(me); setTransactions(txs); setTasks(taskData);
  }, []);

  useEffect(() => {
    (async () => {
      try { await fetchData(); } catch (err) { if (!(err instanceof ApiError && err.status === 401)) throw err; }
      setLoading(false);
    })();
  }, [fetchData]);

  async function handleClaimTask(taskKey: string) {
    setClaimingTask(taskKey);
    try {
      const data = await api.post<{ credits: number; reward: number }>("/api/tasks", { taskKey });
      await fetchData();
      toast(t("toast.taskCompleted", { reward: data.reward }), "success");
    } catch (err) { if (err instanceof ApiError) toast(err.message, "error"); }
    setClaimingTask(null);
  }

  if (loading) return <CreditsLoading />;
  if (!user) return null;

  return (
    <main className="max-w-lg mx-auto px-6 pt-24 pb-12 animate-fade-in">
      <div className="text-center mb-8">
        <p className="text-xs text-muted-foreground font-medium mb-1">{t("credits.yourBalance")}</p>
        <p className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">{user.credits}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("create.credits")}</p>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">{t("credits.recharge")}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {RECHARGE_AMOUNTS.map((opt) => (
                <Button key={opt.credits} variant="outline" disabled className="flex-col py-3 h-auto leading-tight opacity-50 cursor-not-allowed">
                  <span className="text-base font-bold">+{opt.credits}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">${opt.price}</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">{t("credits.comingSoon")}</p>
          </CardContent>
        </Card>

        {tasks.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{t("tasks.title")}</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {tasks.map((task) => {
                const label = t(`tasks.${task.key}` as any);
                const desc = t(`tasks.${task.key}_desc` as any);
                return (
                  <div key={task.key} className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${task.completed ? 'bg-muted/20 opacity-60' : 'hover:bg-muted/30'}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{task.completed ? <span className="line-through text-muted-foreground">{label}</span> : label}</p>
                        <span className="text-xs font-semibold text-primary">+{task.reward}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.completed ? t("tasks.completed") : `${desc} (${task.progress.current}/${task.progress.total})`}</p>
                    </div>
                    {!task.completed && task.conditionMet && (
                      <Button size="sm" variant="default" onClick={() => handleClaimTask(task.key)} disabled={claimingTask === task.key} className="ml-3 shrink-0">
                        {claimingTask === task.key ? <LoadingSpinner size="sm" /> : t("tasks.claim")}
                      </Button>
                    )}
                    {!task.completed && !task.conditionMet && <span className="text-xs text-muted-foreground ml-3 shrink-0">{t("tasks.locked")}</span>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">{t("credits.transactionHistory")}</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t("credits.noTransactions")}</p>
            ) : (
              <div className="space-y-0.5">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
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
