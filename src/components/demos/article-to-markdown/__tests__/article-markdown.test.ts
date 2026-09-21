import { describe, expect, it } from "vitest";
import { prepareArticle } from "../article-markdown";

describe("article export", () => {
  it("preserves article paragraphs, lists and code without fetching or inventing content", () => {
    const body = "A paragraph.\r\n\r\n- One\r\n\r\n```ts\r\nconst x = 1;\r\n```";
    const result = prepareArticle({ title: "A [test]", author: "Trav *Jones*", source: "https://x.com/test/status/123", body, frontmatter: false });
    expect(result.error).toBeUndefined();
    expect(result.markdown).toContain("# A \\[test\\]");
    expect(result.markdown).toContain("Author: Trav \\*Jones\\*");
    expect(result.markdown).toContain("Source: <https://x.com/test/status/123>");
    expect(result.markdown?.endsWith(body.replace(/\r\n/g, "\n") + "\n")).toBe(true);
  });
  it.each(["javascript:alert(1)", "data:text/html,test", "https://user:pass@x.com/a", "not a URL"])("rejects unsafe or invalid source %s", (source) => {
    expect(prepareArticle({ title: "", author: "", source, body: "Text", frontmatter: false }).error).toMatch(/source/i);
  });
  it("requires content and permits absent metadata", () => {
    expect(prepareArticle({ title: "", author: "", source: "", body: " ", frontmatter: false }).markdown).toBe("");
    expect(prepareArticle({ title: "", author: "", source: "", body: "Only text", frontmatter: false }).markdown).toBe("Only text\n");
  });
  it("quotes YAML values so metadata cannot introduce new properties", () => {
    const result = prepareArticle({ title: 'A: "title"\nadmin: true', author: "yes", source: "", body: "Text", frontmatter: true });
    expect(result.markdown).toContain('title: "A: \\"title\\" admin: true"');
    expect(result.markdown).toContain('author: "yes"');
    expect(result.markdown).not.toContain("\nadmin:");
    expect(result.filename).not.toMatch(/[\\/:*?"<>|]/);
  });
});
