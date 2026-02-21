import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card className="gradient-border bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <CardTitle className="text-base">{note.title}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {note.content}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {new Date(note.updated_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
