import { describe, it, expect } from "vitest";
import { loginSchema, noteSchema, toolSchema } from "./validations";

describe("loginSchema", () => {
  it("accepts a valid email", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = loginSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

describe("noteSchema", () => {
  it("accepts valid note data", () => {
    const result = noteSchema.safeParse({
      title: "My Note",
      content: "Some content here",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = noteSchema.safeParse({ title: "", content: "Content" });
    expect(result.success).toBe(false);
  });

  it("rejects a title longer than 200 characters", () => {
    const result = noteSchema.safeParse({
      title: "a".repeat(201),
      content: "Content",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty content", () => {
    const result = noteSchema.safeParse({ title: "Title", content: "" });
    expect(result.success).toBe(true);
  });
});

describe("toolSchema", () => {
  const validInternalTool = {
    slug: "my-tool",
    name: "My Tool",
    type: "internal" as const,
  };

  const validExternalTool = {
    slug: "ext-tool",
    name: "External Tool",
    type: "external" as const,
    url: "https://example.com",
  };

  it("accepts a valid internal tool", () => {
    const result = toolSchema.safeParse(validInternalTool);
    expect(result.success).toBe(true);
  });

  it("accepts a valid external tool with URL", () => {
    const result = toolSchema.safeParse(validExternalTool);
    expect(result.success).toBe(true);
  });

  it("rejects an external tool without a URL", () => {
    const result = toolSchema.safeParse({
      slug: "ext-tool",
      name: "External Tool",
      type: "external",
      url: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase letters", () => {
    const result = toolSchema.safeParse({
      ...validInternalTool,
      slug: "My-Tool",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with special characters", () => {
    const result = toolSchema.safeParse({
      ...validInternalTool,
      slug: "my_tool!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields when omitted", () => {
    const result = toolSchema.safeParse(validInternalTool);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid URL format", () => {
    const result = toolSchema.safeParse({
      ...validExternalTool,
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid type value", () => {
    const result = toolSchema.safeParse({
      ...validInternalTool,
      type: "unknown",
    });
    expect(result.success).toBe(false);
  });
});
