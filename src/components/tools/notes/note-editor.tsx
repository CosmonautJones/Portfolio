"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Note } from "@/lib/types";

interface NoteEditorProps {
  note?: Note;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

export function NoteEditor({ note, onSubmit, onCancel }: NoteEditorProps) {
  return (
    <Card className="animate-fade-up bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle>{note ? "Edit Note" : "New Note"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <Input name="title" placeholder="Title" defaultValue={note?.title} required />
          <Textarea
            name="content"
            placeholder="Write your note..."
            className="min-h-[200px]"
            defaultValue={note?.content}
          />
          <div className="flex gap-2">
            <Button type="submit">{note ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
