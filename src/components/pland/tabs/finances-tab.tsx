"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  splitExpenseEvenly,
  getTripSummary,
} from "@/actions/pland";
import type { PlandExpense, PlandMember } from "@/lib/types";

interface FinancesTabProps {
  tripId: string;
  members: PlandMember[];
  isAuthenticated: boolean;
}

const categoryConfig: Record<
  PlandExpense["category"],
  { label: string; color: string }
> = {
  accommodation: { label: "Accommodation", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  food: { label: "Food", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  activity: { label: "Activity", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  transport: { label: "Transport", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  other: { label: "Other", color: "bg-muted text-muted-foreground" },
};

interface TripSummary {
  total_expenses: number;
  member_balances: { member_id: string; name: string; paid: number; owes: number; balance: number }[];
}

export function FinancesTab({ tripId, members, isAuthenticated }: FinancesTabProps) {
  const [expenses, setExpenses] = useState<PlandExpense[]>([]);
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    Promise.all([getExpenses(tripId), getTripSummary(tripId)]).then(
      ([expRes, sumRes]) => {
        if ("data" in expRes && expRes.data) setExpenses(expRes.data);
        if ("data" in sumRes && sumRes.data) setSummary(sumRes.data);
        setLoading(false);
      }
    );
  }, [tripId]);

  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const res = await addExpense(tripId, formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Expense added");
        setDialogOpen(false);
        const [expRes, sumRes] = await Promise.all([
          getExpenses(tripId),
          getTripSummary(tripId),
        ]);
        if ("data" in expRes && expRes.data) setExpenses(expRes.data);
        if ("data" in sumRes && sumRes.data) setSummary(sumRes.data);
      }
    });
  }

  function handleDelete(expenseId: string) {
    startTransition(async () => {
      const res = await deleteExpense(expenseId);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
        toast.success("Expense removed");
        const sumRes = await getTripSummary(tripId);
        if ("data" in sumRes && sumRes.data) setSummary(sumRes.data);
      }
    });
  }

  function handleSplitEvenly(expenseId: string, amount: number) {
    if (members.length === 0) {
      toast.error("No members to split with");
      return;
    }
    startTransition(async () => {
      const memberIds = members.map((m) => m.id);
      const res = await splitExpenseEvenly(expenseId, memberIds, amount);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Split evenly among all members");
        const sumRes = await getTripSummary(tripId);
        if ("data" in sumRes && sumRes.data) setSummary(sumRes.data);
      }
    });
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading finances...</div>;
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Per Person (even split)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${members.length > 0 ? (totalExpenses / members.length).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Balances */}
      {summary?.member_balances && summary.member_balances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.member_balances.map((mb) => (
                <div
                  key={mb.member_id}
                  className="flex items-center justify-between py-1.5 border-b last:border-0"
                >
                  <span className="text-sm font-medium">{mb.name}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Paid ${mb.paid.toFixed(2)}
                    </span>
                    <span
                      className={
                        mb.balance >= 0
                          ? "font-medium text-green-600 dark:text-green-400"
                          : "font-medium text-red-600 dark:text-red-400"
                      }
                    >
                      {mb.balance >= 0 ? "+" : ""}${mb.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expenses</h3>
        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <form action={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required placeholder="e.g. Dinner at restaurant" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" required placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue="other">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid_by_member_id">Paid By</Label>
                  <Select name="paid_by_member_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <DollarSign className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No expenses yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Log expenses and split costs among group members to keep finances transparent.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const cat = categoryConfig[expense.category];
            return (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{expense.title}</span>
                          <Badge variant="secondary" className={cat.color}>
                            {cat.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {expense.paid_by_member_id && (
                            <span>
                              Paid by{" "}
                              {memberMap.get(expense.paid_by_member_id) ?? "Unknown"}
                            </span>
                          )}
                          {expense.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(expense.date + "T00:00:00").toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-lg font-semibold">
                        ${expense.amount.toFixed(2)}
                      </span>
                      {isAuthenticated && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleSplitEvenly(expense.id, expense.amount)}
                            disabled={isPending}
                          >
                            Split
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(expense.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
