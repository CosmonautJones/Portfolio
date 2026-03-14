"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { getMessages, sendMessage } from "@/actions/pland";
import type { PlandMessage } from "@/lib/types";

interface ChatTabProps {
  tripId: string;
  isAuthenticated: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ChatTab({ tripId, isAuthenticated }: ChatTabProps) {
  const [messages, setMessages] = useState<PlandMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages(tripId).then((res) => {
      if ("data" in res && res.data) setMessages(res.data);
      setLoading(false);
    });
  }, [tripId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const formData = new FormData();
    formData.set("content", trimmed);
    setInput("");

    startTransition(async () => {
      const res = await sendMessage(tripId, formData);
      if ("error" in res) {
        toast.error(res.error);
        setInput(trimmed);
      } else {
        const refreshed = await getMessages(tripId);
        if ("data" in refreshed && refreshed.data) setMessages(refreshed.data);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group">
              <div className="rounded-lg border bg-card px-3 py-2">
                <p className="text-sm">{msg.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {timeAgo(msg.created_at)}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isAuthenticated ? (
        <div className="border-t p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isPending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isPending || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-t p-3 text-center text-sm text-muted-foreground">
          Sign in to send messages
        </div>
      )}
    </div>
  );
}
