"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  plandTripSchema,
  plandMemberSchema,
  plandItineraryItemSchema,
  plandIdeaSchema,
  plandAccommodationSchema,
  plandExpenseSchema,
  plandMessageSchema,
  plandGalleryItemSchema,
} from "@/lib/validations";

const REVALIDATE_PATH = "/pland";

// --- Helpers ---

function parseError(error: unknown) {
  return { error: error instanceof Error ? error.message : "Unknown error" };
}

function validationError(parsed: { error: { issues: { message: string }[] } }) {
  return { error: parsed.error.issues.map((e) => e.message).join(", ") };
}

// --- Trips ---

export async function getTrips() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_trips")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function getTrip(tripId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_trips")
      .select("*")
      .eq("id", tripId)
      .single();
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function createTrip(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandTripSchema.safeParse({
      name: formData.get("name"),
      destination: formData.get("destination") || undefined,
      description: formData.get("description") || undefined,
      cover_image_url: formData.get("cover_image_url") || undefined,
      start_date: formData.get("start_date") || undefined,
      end_date: formData.get("end_date") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { data, error } = await supabase
      .from("pland_trips")
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        destination: parsed.data.destination || null,
        description: parsed.data.description || null,
        cover_image_url: parsed.data.cover_image_url || null,
        start_date: parsed.data.start_date || null,
        end_date: parsed.data.end_date || null,
      })
      .select()
      .single();
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true, data };
  } catch (error) {
    return parseError(error);
  }
}

export async function updateTrip(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandTripSchema.safeParse({
      name: formData.get("name"),
      destination: formData.get("destination") || undefined,
      description: formData.get("description") || undefined,
      cover_image_url: formData.get("cover_image_url") || undefined,
      start_date: formData.get("start_date") || undefined,
      end_date: formData.get("end_date") || undefined,
      status: formData.get("status") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase
      .from("pland_trips")
      .update({
        name: parsed.data.name,
        destination: parsed.data.destination || null,
        description: parsed.data.description || null,
        cover_image_url: parsed.data.cover_image_url || null,
        start_date: parsed.data.start_date || null,
        end_date: parsed.data.end_date || null,
        ...(parsed.data.status && { status: parsed.data.status }),
      })
      .eq("id", tripId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function deleteTrip(tripId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_trips")
      .delete()
      .eq("id", tripId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Members ---

export async function getMembers(tripId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_members")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function addMember(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandMemberSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      avatar_color: formData.get("avatar_color") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const colors = ["#ef7d57", "#3b5dc9", "#38b764", "#b13e53", "#257179", "#5d275d"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const { error } = await supabase.from("pland_members").insert({
      trip_id: tripId,
      user_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      avatar_color: parsed.data.avatar_color || randomColor,
    });
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function removeMember(memberId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_members")
      .delete()
      .eq("id", memberId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Itinerary ---

export async function getItineraryItems(tripId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_itinerary_items")
      .select("*")
      .eq("trip_id", tripId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function addItineraryItem(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandItineraryItemSchema.safeParse({
      date: formData.get("date"),
      start_time: formData.get("start_time") || undefined,
      end_time: formData.get("end_time") || undefined,
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      location: formData.get("location") || undefined,
      link: formData.get("link") || undefined,
      category: formData.get("category") || undefined,
      sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase.from("pland_itinerary_items").insert({
      trip_id: tripId,
      user_id: user.id,
      date: parsed.data.date,
      start_time: parsed.data.start_time || null,
      end_time: parsed.data.end_time || null,
      title: parsed.data.title,
      description: parsed.data.description || null,
      location: parsed.data.location || null,
      link: parsed.data.link || null,
      category: parsed.data.category || "activity",
      sort_order: parsed.data.sort_order ?? 0,
    });
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function updateItineraryItem(itemId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandItineraryItemSchema.safeParse({
      date: formData.get("date"),
      start_time: formData.get("start_time") || undefined,
      end_time: formData.get("end_time") || undefined,
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      location: formData.get("location") || undefined,
      link: formData.get("link") || undefined,
      category: formData.get("category") || undefined,
      sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase
      .from("pland_itinerary_items")
      .update({
        date: parsed.data.date,
        start_time: parsed.data.start_time || null,
        end_time: parsed.data.end_time || null,
        title: parsed.data.title,
        description: parsed.data.description || null,
        location: parsed.data.location || null,
        link: parsed.data.link || null,
        category: parsed.data.category || "activity",
        sort_order: parsed.data.sort_order ?? 0,
      })
      .eq("id", itemId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function deleteItineraryItem(itemId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_itinerary_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Ideas ---

export async function getIdeas(tripId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_ideas")
      .select("*")
      .eq("trip_id", tripId)
      .order("votes", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function addIdea(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandIdeaSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      link: formData.get("link") || undefined,
      location: formData.get("location") || undefined,
      estimated_cost: formData.get("estimated_cost") ? Number(formData.get("estimated_cost")) : undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase.from("pland_ideas").insert({
      trip_id: tripId,
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      link: parsed.data.link || null,
      location: parsed.data.location || null,
      estimated_cost: parsed.data.estimated_cost ?? null,
    });
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function updateIdea(ideaId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandIdeaSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      link: formData.get("link") || undefined,
      location: formData.get("location") || undefined,
      estimated_cost: formData.get("estimated_cost") ? Number(formData.get("estimated_cost")) : undefined,
      status: formData.get("status") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase
      .from("pland_ideas")
      .update({
        title: parsed.data.title,
        description: parsed.data.description || null,
        link: parsed.data.link || null,
        location: parsed.data.location || null,
        estimated_cost: parsed.data.estimated_cost ?? null,
        ...(parsed.data.status && { status: parsed.data.status }),
      })
      .eq("id", ideaId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function voteIdea(ideaId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: idea, error: fetchError } = await supabase
      .from("pland_ideas")
      .select("votes")
      .eq("id", ideaId)
      .single();
    if (fetchError) return { error: fetchError.message };

    const { error } = await supabase
      .from("pland_ideas")
      .update({ votes: (idea.votes || 0) + 1 })
      .eq("id", ideaId);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function deleteIdea(ideaId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_ideas")
      .delete()
      .eq("id", ideaId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Accommodations ---

export async function getAccommodations(tripId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_accommodations")
      .select("*")
      .eq("trip_id", tripId)
      .order("check_in", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function addAccommodation(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandAccommodationSchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      check_in: formData.get("check_in") || undefined,
      check_out: formData.get("check_out") || undefined,
      cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
      booking_link: formData.get("booking_link") || undefined,
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase.from("pland_accommodations").insert({
      trip_id: tripId,
      user_id: user.id,
      name: parsed.data.name,
      address: parsed.data.address || null,
      check_in: parsed.data.check_in || null,
      check_out: parsed.data.check_out || null,
      cost: parsed.data.cost ?? null,
      booking_link: parsed.data.booking_link || null,
      notes: parsed.data.notes || null,
    });
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function updateAccommodation(accommodationId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandAccommodationSchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      check_in: formData.get("check_in") || undefined,
      check_out: formData.get("check_out") || undefined,
      cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
      booking_link: formData.get("booking_link") || undefined,
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase
      .from("pland_accommodations")
      .update({
        name: parsed.data.name,
        address: parsed.data.address || null,
        check_in: parsed.data.check_in || null,
        check_out: parsed.data.check_out || null,
        cost: parsed.data.cost ?? null,
        booking_link: parsed.data.booking_link || null,
        notes: parsed.data.notes || null,
      })
      .eq("id", accommodationId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function deleteAccommodation(accommodationId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_accommodations")
      .delete()
      .eq("id", accommodationId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Expenses ---

export async function getExpenses(tripId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_expenses")
      .select("*")
      .eq("trip_id", tripId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function addExpense(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandExpenseSchema.safeParse({
      title: formData.get("title"),
      amount: Number(formData.get("amount")),
      category: formData.get("category") || undefined,
      paid_by_member_id: formData.get("paid_by_member_id") || undefined,
      date: formData.get("date") || undefined,
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { data, error } = await supabase
      .from("pland_expenses")
      .insert({
        trip_id: tripId,
        user_id: user.id,
        title: parsed.data.title,
        amount: parsed.data.amount,
        category: parsed.data.category || "other",
        paid_by_member_id: parsed.data.paid_by_member_id || null,
        date: parsed.data.date || null,
        notes: parsed.data.notes || null,
      })
      .select()
      .single();
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true, data };
  } catch (error) {
    return parseError(error);
  }
}

export async function updateExpense(expenseId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandExpenseSchema.safeParse({
      title: formData.get("title"),
      amount: Number(formData.get("amount")),
      category: formData.get("category") || undefined,
      paid_by_member_id: formData.get("paid_by_member_id") || undefined,
      date: formData.get("date") || undefined,
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase
      .from("pland_expenses")
      .update({
        title: parsed.data.title,
        amount: parsed.data.amount,
        category: parsed.data.category || "other",
        paid_by_member_id: parsed.data.paid_by_member_id || null,
        date: parsed.data.date || null,
        notes: parsed.data.notes || null,
      })
      .eq("id", expenseId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Expense Splits ---

export async function getExpenseSplits(expenseId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_expense_splits")
      .select("*")
      .eq("expense_id", expenseId);
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function addExpenseSplit(expenseId: string, memberId: string, amount: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("pland_expense_splits").insert({
      expense_id: expenseId,
      member_id: memberId,
      amount,
    });
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function settleExpenseSplit(splitId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_expense_splits")
      .update({ settled: true })
      .eq("id", splitId);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function splitExpenseEvenly(expenseId: string, memberIds: string[], totalAmount: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Remove existing splits for this expense
    await supabase.from("pland_expense_splits").delete().eq("expense_id", expenseId);

    const perPerson = Math.round((totalAmount / memberIds.length) * 100) / 100;
    const splits = memberIds.map((memberId) => ({
      expense_id: expenseId,
      member_id: memberId,
      amount: perPerson,
    }));

    const { error } = await supabase.from("pland_expense_splits").insert(splits);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Messages ---

export async function getMessages(tripId: string, contextType?: string, contextId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("pland_messages")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });

    if (contextType && contextId) {
      query = query.eq("context_type", contextType).eq("context_id", contextId);
    } else if (contextType === "general") {
      query = query.is("context_type", null);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function sendMessage(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandMessageSchema.safeParse({
      content: formData.get("content"),
      context_type: formData.get("context_type") || undefined,
      context_id: formData.get("context_id") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase.from("pland_messages").insert({
      trip_id: tripId,
      user_id: user.id,
      content: parsed.data.content,
      context_type: parsed.data.context_type || null,
      context_id: parsed.data.context_id || null,
    });
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Gallery ---

export async function getGalleryItems(tripId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pland_gallery")
      .select("*")
      .eq("trip_id", tripId)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    return parseError(error);
  }
}

export async function addGalleryItem(tripId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = plandGalleryItemSchema.safeParse({
      url: formData.get("url"),
      caption: formData.get("caption") || undefined,
      date: formData.get("date") || undefined,
    });
    if (!parsed.success) return validationError(parsed);

    const { error } = await supabase.from("pland_gallery").insert({
      trip_id: tripId,
      user_id: user.id,
      url: parsed.data.url,
      caption: parsed.data.caption || null,
      date: parsed.data.date || null,
    });
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

export async function deleteGalleryItem(itemId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("pland_gallery")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    return parseError(error);
  }
}

// --- Trip Summary ---

export async function getTripSummary(tripId: string) {
  try {
    const supabase = await createClient();

    const [
      { data: expenses },
      { data: splits },
      { data: members },
    ] = await Promise.all([
      supabase.from("pland_expenses").select("*").eq("trip_id", tripId),
      supabase.from("pland_expense_splits").select("*, pland_expenses!inner(trip_id)").eq("pland_expenses.trip_id", tripId),
      supabase.from("pland_members").select("*").eq("trip_id", tripId),
    ]);

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);

    // Per-member: how much they paid vs how much they owe
    const memberBalances = (members || []).map((member) => {
      const paid = (expenses || [])
        .filter((e) => e.paid_by_member_id === member.id)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const owes = (splits || [])
        .filter((s) => s.member_id === member.id && !s.settled)
        .reduce((sum, s) => sum + Number(s.amount), 0);
      return {
        member_id: member.id,
        name: member.name,
        paid,
        owes,
        balance: paid - owes,
      };
    });

    return {
      data: {
        total_expenses: totalExpenses,
        member_balances: memberBalances,
        expense_count: (expenses || []).length,
      },
    };
  } catch (error) {
    return parseError(error);
  }
}
