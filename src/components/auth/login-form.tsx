"use client";

import { useState } from "react";
import { signInWithMagicLink } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";

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
      <Card className="w-full max-w-sm border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Mail className="h-6 w-6 text-foreground" />
          </div>
          <CardTitle className="text-lg font-semibold">Check your email</CardTitle>
          <CardDescription className="text-sm">
            We sent you a magic link. Click it to sign in.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sign In</CardTitle>
        <CardDescription className="text-sm">
          Enter your email to receive a magic link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-10 border-border/50 bg-secondary/50 transition-colors focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="h-10 w-full rounded-lg bg-foreground text-background transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
            disabled={pending}
          >
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
