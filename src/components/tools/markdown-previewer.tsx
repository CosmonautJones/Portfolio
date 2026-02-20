"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Trash2, FileText } from "lucide-react";

const SAMPLE_MARKDOWN = `# Hello, Markdown!

This is a **live preview** of your markdown content.

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~ support
- [Links](https://example.com)
- Inline \`code\` blocks

### Task List

- [x] Write markdown
- [x] Preview it live
- [ ] Ship it!

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Table

| Feature | Supported |
|---------|-----------|
| Tables | Yes |
| GFM | Yes |
| Task Lists | Yes |

> Blockquotes work too!
`;

export default function MarkdownPreviewer() {
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split("\n").length : 0;
    return { chars, words, lines };
  }, [input]);

  function handleCopyRaw() {
    navigator.clipboard.writeText(input);
    toast.success("Markdown copied to clipboard");
  }

  function handleCopyHtml() {
    const container = document.getElementById("markdown-preview");
    if (container) {
      navigator.clipboard.writeText(container.innerHTML);
      toast.success("HTML copied to clipboard");
    }
  }

  function handleClear() {
    setInput("");
  }

  function handleInsertSample() {
    setInput(SAMPLE_MARKDOWN);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Editor
            <Badge variant="secondary">
              {stats.words} word{stats.words !== 1 ? "s" : ""} &middot; {stats.lines} line{stats.lines !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write your markdown here..."
            className="min-h-[400px] font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleInsertSample}>
              <FileText className="mr-1 h-3 w-3" /> Sample
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyRaw} disabled={!input}>
              <Copy className="mr-1 h-3 w-3" /> Copy Raw
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!input}>
              <Trash2 className="mr-1 h-3 w-3" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Preview
            {input && (
              <Button variant="ghost" size="sm" onClick={handleCopyHtml}>
                <Copy className="mr-1 h-3 w-3" /> Copy HTML
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {input ? (
            <div
              id="markdown-preview"
              className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-muted [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_hr]:border-border [&_a]:text-primary [&_a]:underline [&_img]:rounded-md [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{input}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
              Start typing markdown to see a live preview...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
