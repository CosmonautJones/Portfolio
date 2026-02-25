"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createNote, updateNote, deleteNote } from "@/actions/notes";
import { NoteEditor } from "@/components/tools/notes/note-editor";
import { NoteCard } from "@/components/tools/notes/note-card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import type { Note } from "@/lib/types";
import { toast } from "sonner";

function NotesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="flex gap-1">
              <div className="h-8 w-8 rounded bg-muted" />
              <div className="h-8 w-8 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
            <div className="h-3 w-3/5 rounded bg-muted" />
          </div>
          <div className="h-3 w-1/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  async function fetchNotes() {
    setError(null);
    setLoading(true);
    const { data, error: fetchError } = await getSupabase()
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setNotes(data as Note[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(formData: FormData) {
    setSaving(true);
    const result = await createNote(formData);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Validation error");
      setSaving(false);
      return;
    }
    setCreating(false);
    toast.success("Note created");
    // Refetch
    const { data } = await getSupabase().from("notes").select("*").order("updated_at", { ascending: false });
    if (data) setNotes(data as Note[]);
    setSaving(false);
  }

  async function handleUpdate(noteId: string, formData: FormData) {
    setSaving(true);
    const result = await updateNote(noteId, formData);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Validation error");
      setSaving(false);
      return;
    }
    setEditing(null);
    toast.success("Note updated");
    const { data } = await getSupabase().from("notes").select("*").order("updated_at", { ascending: false });
    if (data) setNotes(data as Note[]);
    setSaving(false);
  }

  async function handleDelete(noteId: string) {
    setSaving(true);
    const result = await deleteNote(noteId);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Delete failed");
      setSaving(false);
      return;
    }
    toast.success("Note deleted");
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading notes..." : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
        </p>
        <Button
          onClick={() => { setCreating(true); setEditing(null); }}
          disabled={loading || saving}
        >
          <Plus className="mr-1 h-4 w-4" /> New Note
        </Button>
      </div>

      {creating && (
        <NoteEditor onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {editing && (
        <NoteEditor
          note={editing}
          onSubmit={(fd) => handleUpdate(editing.id, fd)}
          onCancel={() => setEditing(null)}
        />
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-destructive mb-2">Failed to load notes</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setError(null); fetchNotes(); }}>
            Try Again
          </Button>
        </div>
      )}

      {!error && (
        loading ? (
          <NotesSkeleton />
        ) : notes.length === 0 && !creating && !editing ? (
          <div className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="gradient-text mb-2 text-xl font-semibold">No notes yet</h2>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              Start capturing your thoughts and ideas.
            </p>
            <Button onClick={() => { setCreating(true); setEditing(null); }}>
              <Plus className="mr-1 h-4 w-4" /> New Note
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {notes.map((note, i) => (
              <div key={note.id} className="animate-scale-in" style={{ animationDelay: `${Math.min((i + 1) * 100, 700)}ms` }}>
                <NoteCard
                  note={note}
                  onEdit={() => { setEditing(note); setCreating(false); }}
                  onDelete={() => handleDelete(note.id)}
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
