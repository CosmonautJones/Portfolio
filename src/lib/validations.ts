import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().optional(),
});

export const toolSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric with hyphens"),
  name: z.string().min(1).max(200),
  type: z.enum(["internal", "external", "embedded"]),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  tags: z.string().optional(),
  icon: z.string().optional(),
  build_hook_url: z.string().url().optional().or(z.literal("")),
}).refine(
  (data) => data.type !== "external" || (data.url && data.url.length > 0),
  { message: "URL is required for external tools", path: ["url"] }
);

// --- Plan'd Schemas ---

export const plandTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(200),
  destination: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["planning", "active", "completed"]).optional(),
});

export const plandMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
  avatar_color: z.string().optional(),
});

export const plandItineraryItemSchema = z.object({
  date: z.string().min(1, "Date is required"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  link: z.string().url().optional().or(z.literal("")),
  category: z.enum(["activity", "transport", "food", "accommodation", "other"]).optional(),
  sort_order: z.number().optional(),
});

export const plandIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  link: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  estimated_cost: z.number().min(0).optional(),
  status: z.enum(["suggested", "approved", "rejected"]).optional(),
});

export const plandAccommodationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().max(500).optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  cost: z.number().min(0).optional(),
  booking_link: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export const plandExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category: z.enum(["accommodation", "food", "activity", "transport", "other"]).optional(),
  paid_by_member_id: z.string().uuid().optional(),
  date: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const plandMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
  context_type: z.enum(["general", "itinerary", "idea", "expense"]).optional(),
  context_id: z.string().uuid().optional(),
});

export const plandGalleryItemSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  caption: z.string().max(500).optional(),
  date: z.string().optional(),
});
