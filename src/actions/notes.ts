"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string(),
});

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content,
  });
  if (error) return { error: error.message };

  revalidatePath("/tools/notes");
  return { success: true };
}

export async function updateNote(noteId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("notes")
    .update({ title: parsed.data.title, content: parsed.data.content })
    .eq("id", noteId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/tools/notes");
  return { success: true };
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/tools/notes");
  return { success: true };
}
