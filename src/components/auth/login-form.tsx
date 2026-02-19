"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Loader2 } from "lucide-react";

export function LoginForm({
  urlError,
  redirectTo = "/tools",
}: {
  urlError?: string;
  redirectTo?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(urlError ?? null);

  async function handleGitHubLogin() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          onClick={handleGitHubLogin}
          className="h-10 w-full rounded-lg bg-foreground text-background transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
