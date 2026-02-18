"use client";

import { useState } from "react";
import { signInWithMagicLink } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2, Sparkles } from "lucide-react";

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signInWithMagicLink(formData);
    setPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md border-border/50 shadow-xl shadow-violet-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-500/20 dark:to-indigo-500/20">
            <Mail className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent you a magic link. Click it to sign in.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/50 shadow-xl shadow-violet-500/5">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <CardTitle>Sign In</CardTitle>
        </div>
        <CardDescription>Enter your email to receive a magic link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="border-border/50 focus-visible:ring-violet-500/50"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:brightness-110 dark:from-violet-500 dark:to-indigo-500" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Magic Link"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
