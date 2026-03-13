"use server";

import { revalidatePath } from "next/cache";
import { noteSchema } from "@/lib/validations";
import { withAuth } from "@/actions/utils";

export async function createNote(formData: FormData) {
  return withAuth(async (user, supabase) => {
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
  });
}

export async function updateNote(noteId: string, formData: FormData) {
  return withAuth(async (user, supabase) => {
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
  });
}

export async function deleteNote(noteId: string) {
  return withAuth(async (user, supabase) => {
    const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/tools/notes");
    return { success: true };
  });
}
