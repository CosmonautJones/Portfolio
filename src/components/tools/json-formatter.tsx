"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  function handleFormat() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
      setOutput(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  function handleMinify() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
      setOutput(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setIsValid(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Input
            {isValid !== null && (
              <Badge variant={isValid ? "default" : "destructive"}>
                {isValid ? "Valid" : "Invalid"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your JSON here..."
            className="min-h-[400px] font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={handleFormat}>Format</Button>
            <Button variant="secondary" onClick={handleMinify}>Minify</Button>
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="mr-1 h-3 w-3" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Output
            {output && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea readOnly className="min-h-[400px] font-mono text-sm" value={output} />
        </CardContent>
      </Card>
    </div>
  );
}
