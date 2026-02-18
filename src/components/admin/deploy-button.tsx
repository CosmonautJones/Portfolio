"use client";

import { useState } from "react";
import { triggerDeploy } from "@/actions/deploy";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeployButtonProps {
  buildHookUrl: string;
}

export function DeployButton({ buildHookUrl }: DeployButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleDeploy() {
    setPending(true);
    const result = await triggerDeploy(buildHookUrl);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Deploy triggered");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDeploy} disabled={pending}>
      {pending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Rocket className="mr-1 h-3 w-3" />}
      Deploy
    </Button>
  );
}
