"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { noteSchema } from "@/lib/validations";

export async function createNote(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = noteSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
    });
    if (error) return { error: error.message };

    revalidatePath("/tools/notes");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateNote(noteId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = noteSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

    const { error } = await supabase
      .from("notes")
      .update({ title: parsed.data.title, content: parsed.data.content })
      .eq("id", noteId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/tools/notes");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function deleteNote(noteId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/tools/notes");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
