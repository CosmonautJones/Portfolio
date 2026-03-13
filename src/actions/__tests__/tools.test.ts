import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  isAdminEmail: vi.fn((email: string) => email === "admin@test.com"),
}));

import { createTool, deleteTool, toggleToolStatus } from "../tools";

const adminUser = { id: "admin-1", email: "admin@test.com" };
const regularUser = { id: "user-1", email: "user@test.com" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: adminUser } });
});

describe("createTool", () => {
  it("rejects non-admin users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: regularUser } });
    const fd = new FormData();
    fd.set("slug", "test");
    fd.set("name", "Test");
    fd.set("type", "external");
    fd.set("description", "A test tool");
    fd.set("tags", "test");
    const result = await createTool(fd);
    expect(result).toHaveProperty("error");
  });

  it("rejects unauthenticated users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const fd = new FormData();
    const result = await createTool(fd);
    expect(result).toHaveProperty("error");
  });
});

describe("deleteTool", () => {
  it("rejects non-admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: regularUser } });
    const result = await deleteTool("tool-1");
    expect(result).toHaveProperty("error");
  });

  it("deletes tool for admin", async () => {
    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ delete: deleteMock });
    const result = await deleteTool("tool-1");
    expect(result).toEqual({ success: true });
  });
});

describe("toggleToolStatus", () => {
  it("toggles from enabled to disabled", async () => {
    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: updateMock });
    const result = await toggleToolStatus("tool-1", "enabled");
    expect(result).toEqual({ success: true });
  });
});
