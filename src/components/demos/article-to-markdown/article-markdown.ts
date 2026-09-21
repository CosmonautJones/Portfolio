export type ArticleInput = { title: string; author: string; source: string; body: string; frontmatter: boolean };
export function prepareArticle(input: ArticleInput): { markdown: string; filename: string; error?: string } {
  const title = input.title.replace(/\s+/g, " ").trim();
  const author = input.author.replace(/\s+/g, " ").trim();
  const filename = `${title.replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, "-").slice(0, 80) || "article"}.md`;
  const body = input.body.replace(/\r\n?/g, "\n").trim();
  let source = "";
  if (input.source.trim()) {
    try {
      const url = new URL(input.source.trim());
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || /[\r\n\t]/.test(input.source)) throw new Error("Invalid source");
      source = url.href.replace(/</g, "%3C").replace(/>/g, "%3E");
    } catch {
      return { markdown: "", filename, error: "Use a complete http:// or https:// source URL without login details, or leave it blank." };
    }
  }
  if (!body) return { markdown: "", filename };
  const escape = (value: string) => value.replace(/[\\`*_{}\[\]()#+.!<>|~-]/g, "\\$&");
  const blocks: string[] = [];
  if (input.frontmatter) {
    const values = Object.entries({ title, author, source }).filter(([, value]) => value);
    if (values.length) blocks.push(`---\n${values.map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n")}\n---`);
  }
  if (title) blocks.push(`# ${escape(title)}`);
  if (author) blocks.push(`Author: ${escape(author)}`);
  if (source) blocks.push(`Source: <${source}>`);
  blocks.push(body);
  return { markdown: blocks.join("\n\n") + "\n", filename };
}
