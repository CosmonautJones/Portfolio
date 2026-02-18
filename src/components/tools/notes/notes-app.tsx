"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createNote, updateNote, deleteNote } from "@/actions/notes";
import { NoteEditor } from "@/components/tools/notes/note-editor";
import { NoteCard } from "@/components/tools/notes/note-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Note } from "@/lib/types";
import { toast } from "sonner";

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  useEffect(() => {
    async function fetchNotes() {
      const { data } = await getSupabase()
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) setNotes(data as Note[]);
    }
    fetchNotes();
  }, []);

  async function handleCreate(formData: FormData) {
    const result = await createNote(formData);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Validation error");
      return;
    }
    setCreating(false);
    toast.success("Note created");
    // Refetch
    const { data } = await getSupabase().from("notes").select("*").order("updated_at", { ascending: false });
    if (data) setNotes(data as Note[]);
  }

  async function handleUpdate(noteId: string, formData: FormData) {
    const result = await updateNote(noteId, formData);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Validation error");
      return;
    }
    setEditing(null);
    toast.success("Note updated");
    const { data } = await getSupabase().from("notes").select("*").order("updated_at", { ascending: false });
    if (data) setNotes(data as Note[]);
  }

  async function handleDelete(noteId: string) {
    const result = await deleteNote(noteId);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Delete failed");
      return;
    }
    toast.success("Note deleted");
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{notes.length} note{notes.length !== 1 && "s"}</p>
        <Button onClick={() => { setCreating(true); setEditing(null); }}>
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

      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={() => { setEditing(note); setCreating(false); }}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
