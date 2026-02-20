"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { projectSchema, taskSchema } from "@/lib/validations";

export async function createProject(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = projectSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || "",
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description || "",
    });
    if (error) return { error: error.message };

    revalidatePath("/tools/project-tracker");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = projectSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || "",
      status: formData.get("status") || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

    const update: Record<string, string> = {
      name: parsed.data.name,
      description: parsed.data.description || "",
    };
    if (parsed.data.status) {
      update.status = parsed.data.status;
    }

    const { error } = await supabase
      .from("projects")
      .update(update)
      .eq("id", projectId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/tools/project-tracker");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/tools/project-tracker");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function createTask(projectId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = taskSchema.safeParse({
      title: formData.get("title"),
      priority: formData.get("priority") || undefined,
      due_date: formData.get("due_date") || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

    const { error } = await supabase.from("tasks").insert({
      project_id: projectId,
      user_id: user.id,
      title: parsed.data.title,
      priority: parsed.data.priority || "medium",
      due_date: parsed.data.due_date || null,
    });
    if (error) return { error: error.message };

    revalidatePath("/tools/project-tracker");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateTask(taskId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = taskSchema.safeParse({
      title: formData.get("title"),
      status: formData.get("status") || undefined,
      priority: formData.get("priority") || undefined,
      due_date: formData.get("due_date") || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues.map((e) => e.message).join(", ") };
    }

    const update: Record<string, string | null> = {};
    if (parsed.data.title) update.title = parsed.data.title;
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.priority) update.priority = parsed.data.priority;
    if (parsed.data.due_date !== undefined) {
      update.due_date = parsed.data.due_date || null;
    }

    const { error } = await supabase
      .from("tasks")
      .update(update)
      .eq("id", taskId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/tools/project-tracker");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/tools/project-tracker");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
