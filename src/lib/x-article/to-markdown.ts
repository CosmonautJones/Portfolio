import type {
  ArticleBlock,
  ArticleEntity,
  PublicDocument,
} from "./fxtwitter";

export type MarkdownOptions = {
  obsidian: boolean;
  includeConversation: boolean;
};

export type ConversionResult = {
  markdown: string;
  warnings: string[];
  filename: string;
};

type NormalizedRange = {
  start: number;
  end: number;
};

type InlineSegment = {
  text: string;
  styles: string[];
  link: string;
};

function normalizeRange(
  offset: number,
  length: number,
  textLength: number,
): NormalizedRange | undefined {
  if (!Number.isFinite(offset) || !Number.isFinite(length)) return undefined;
  const rawStart = Math.trunc(offset);
  const rawEnd = Math.trunc(offset + length);
  const start = Math.max(0, Math.min(textLength, rawStart));
  const end = Math.max(0, Math.min(textLength, rawEnd));
  return end > start ? { start, end } : undefined;
}

function safeHttpUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function escapeMarkdown(text: string): string {
  return text
    .replace(/([\\`*_[\]<>])/g, "\\$1")
    .replace(/(^|\n)( {0,3})(\d+)([.)])(?=\s)/g, "$1$2$3\\$4")
    .replace(
      /(^|\n)( {0,3})(#{1,6}(?=\s)|[-+](?=\s)|(?:-{3,}|=+)(?=\s*(?:\n|$)))/g,
      "$1$2\\$3",
    )
    .replace(/(^|\n) (?= {3,}\S)/g, "$1&#32;");
}

function yamlString(value: string): string {
  return JSON.stringify(value.replace(/\r?\n/g, " "));
}

function slugifyFilename(value: string): string {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return `${slug || "vellum-clip"}.md`;
}

function blockDataLinks(block: ArticleBlock): Array<{
  start: number;
  end: number;
  url: string;
}> {
  if (!Array.isArray(block.data.urls)) return [];
  return block.data.urls.flatMap((value) => {
    if (typeof value !== "object" || value === null) return [];
    const entry = value as Record<string, unknown>;
    const from = typeof entry.fromIndex === "number" ? entry.fromIndex : -1;
    const to = typeof entry.toIndex === "number" ? entry.toIndex : -1;
    const url = safeHttpUrl(entry.text ?? entry.url);
    const range = normalizeRange(from, to - from, block.text.length);
    return range && url ? [{ ...range, url }] : [];
  });
}

function entityUrl(
  entity: ArticleEntity | undefined,
  range: NormalizedRange,
  dataLinks: ReturnType<typeof blockDataLinks>,
): string {
  const direct = safeHttpUrl(entity?.data.url);
  if (direct) return direct;
  return (
    dataLinks.find(
      (link) => link.start <= range.start && link.end >= range.end,
    )?.url ?? ""
  );
}

function formatSegment(segment: InlineSegment): string {
  let value = escapeMarkdown(segment.text);
  const styles = new Set(segment.styles.map((style) => style.toLowerCase()));

  if (segment.link) value = `[${value}](${segment.link})`;

  if (styles.has("code")) {
    const fence = value.includes("`") ? "``" : "`";
    value = `${fence}${value}${fence}`;
  } else {
    if (styles.has("underline")) value = `<u>${value}</u>`;
    if (styles.has("strikethrough")) value = `~~${value}~~`;
    if (styles.has("italic")) value = `_${value}_`;
    if (styles.has("bold")) value = `**${value}**`;
  }

  return value;
}

function renderInline(
  block: ArticleBlock,
  entities: Record<string, ArticleEntity>,
): string {
  const length = block.text.length;
  if (length === 0) return "";

  const styles = block.inlineStyleRanges.flatMap((range) => {
    const normalized = normalizeRange(range.offset, range.length, length);
    return normalized ? [{ ...normalized, style: range.style }] : [];
  });
  const entityRanges = block.entityRanges.flatMap((range) => {
    const normalized = normalizeRange(range.offset, range.length, length);
    return normalized ? [{ ...normalized, key: String(range.key) }] : [];
  });
  const dataLinks = blockDataLinks(block);
  const boundaries = new Set([0, length]);
  for (const range of [...styles, ...entityRanges, ...dataLinks]) {
    boundaries.add(range.start);
    boundaries.add(range.end);
  }
  const points = [...boundaries].sort((left, right) => left - right);
  const segments: InlineSegment[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index] ?? 0;
    const end = points[index + 1] ?? start;
    if (end <= start) continue;
    const activeStyles = styles
      .filter((range) => range.start <= start && range.end >= end)
      .map((range) => range.style)
      .sort();
    const coveringEntities = entityRanges.filter(
      (range) => range.start <= start && range.end >= end,
    );
    const activeEntity =
      coveringEntities.find((range) => {
        const entity = entities[range.key];
        return entity?.type.toUpperCase() === "LINK" && safeHttpUrl(entity.data.url);
      }) ?? coveringEntities[0];
    const link = activeEntity
      ? entityUrl(
          entities[activeEntity.key],
          { start, end },
          dataLinks,
        )
      : dataLinks.find((range) => range.start <= start && range.end >= end)
          ?.url ?? "";
    const text = block.text.slice(start, end);
    const previous = segments.at(-1);
    if (
      previous &&
      previous.link === link &&
      previous.styles.join("|") === activeStyles.join("|")
    ) {
      previous.text += text;
    } else {
      segments.push({ text, styles: activeStyles, link });
    }
  }

  return segments.map(formatSegment).join("");
}

function fencedCode(value: string, language = ""): string {
  const longest = Math.max(
    2,
    ...Array.from(value.matchAll(/`+/g), (match) => match[0].length),
  );
  const fence = "`".repeat(longest + 1);
  return `${fence}${language}\n${value.replace(/\s+$/, "")}\n${fence}`;
}

function renderAtomic(
  block: ArticleBlock,
  document: PublicDocument,
  warnings: Set<string>,
): string {
  const key = block.entityRanges.find((range) =>
    Object.hasOwn(document.entities, String(range.key)),
  )?.key;
  const entity = key === undefined ? undefined : document.entities[String(key)];
  if (!entity) {
    if (block.text.trim()) return escapeMarkdown(block.text.trim());
    warnings.add("An embedded article element was unavailable.");
    return "> Embedded article element unavailable";
  }

  const type = entity.type.toUpperCase();
  if (type === "DIVIDER") return "---";
  if (type === "MARKDOWN") {
    const markdown =
      typeof entity.data.markdown === "string" ? entity.data.markdown.trim() : "";
    if (markdown) return markdown;
  }
  if (type === "LINK") {
    const url = safeHttpUrl(entity.data.url);
    if (url) return `[Related link](${url})`;
  }
  if (type === "TWEET") {
    const tweetId =
      typeof entity.data.tweetId === "string" ? entity.data.tweetId : "";
    if (tweetId) return `[Referenced X post](https://x.com/i/status/${tweetId})`;
  }
  if (type === "MEDIA") {
    const mediaItems = Array.isArray(entity.data.mediaItems)
      ? entity.data.mediaItems
      : [];
    const rendered = mediaItems.flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const mediaId = String((item as Record<string, unknown>).mediaId ?? "");
      const media = document.media.find((candidate) => candidate.mediaId === mediaId);
      if (!media) return [];
      return [
        media.kind === "image"
          ? `![Article image](${media.url})`
          : `[Article ${media.kind}](${media.url})`,
      ];
    });
    if (rendered.length > 0) return rendered.join("\n\n");
    warnings.add("An article media item was unavailable.");
    return "> Article media unavailable";
  }

  warnings.add(`Preserved unsupported article element: ${type}`);
  return block.text.trim()
    ? escapeMarkdown(block.text.trim())
    : `> Unsupported article element: ${type}`;
}

function renderBlock(
  block: ArticleBlock,
  document: PublicDocument,
  warnings: Set<string>,
): string {
  if (block.type === "atomic") return renderAtomic(block, document, warnings);
  if (block.type === "code-block") return fencedCode(block.text);

  const inline = renderInline(block, document.entities).trimEnd();
  const heading = block.type.match(/^header-(one|two|three|four|five|six)$/);
  if (heading) {
    const levels = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const level = levels[heading[1] as keyof typeof levels];
    return `${"#".repeat(level)} ${inline}`;
  }
  if (block.type === "blockquote") {
    return inline
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  }
  if (block.type !== "unstyled") {
    warnings.add(`Preserved unsupported article block: ${block.type}`);
  }
  return inline;
}

function renderBlocks(document: PublicDocument, warnings: Set<string>): string {
  const rendered: string[] = [];
  let index = 0;

  while (index < document.blocks.length) {
    const block = document.blocks[index];
    if (!block) break;
    const isList =
      block.type === "unordered-list-item" || block.type === "ordered-list-item";
    if (!isList) {
      const value = renderBlock(block, document, warnings);
      if (value) rendered.push(value);
      index += 1;
      continue;
    }

    const marker = block.type === "ordered-list-item" ? "1." : "-";
    const listType = block.type;
    const items: string[] = [];
    while (document.blocks[index]?.type === listType) {
      const item = document.blocks[index];
      if (!item) break;
      items.push(`${marker} ${renderInline(item, document.entities)}`);
      index += 1;
    }
    rendered.push(items.join("\n"));
  }

  return rendered.join("\n\n");
}

function renderConversation(document: PublicDocument): string {
  return document.conversation
    .map((item) => {
      const quote = item.text
        .split("\n")
        .map((line) => `> ${escapeMarkdown(line)}`)
        .join("\n");
      return `### ${escapeMarkdown(item.author)} (@${escapeMarkdown(item.handle)})\n\n${quote}\n\n[View source](${item.url})`;
    })
    .join("\n\n");
}

export function articleToMarkdown(
  document: PublicDocument,
  options: MarkdownOptions,
): ConversionResult {
  const warnings = new Set<string>();
  let date = "";
  if (document.publishedAt) {
    const parsedDate = new Date(document.publishedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      warnings.add("The publication date was unavailable.");
    } else {
      date = parsedDate.toISOString().slice(0, 10);
    }
  }
  const frontmatter = options.obsidian
    ? [
        "---",
        `title: ${yamlString(document.title)}`,
        `author: ${yamlString(`${document.author.name} (@${document.author.handle})`)}`,
        `source: ${yamlString(document.canonicalUrl)}`,
        ...(date ? [`date: ${yamlString(date)}`] : []),
        `type: ${yamlString(document.kind === "article" ? "x-article" : "x-post")}`,
        "---",
      ].join("\n")
    : "";
  const byline = `By ${document.author.name} (@${document.author.handle})${date ? ` · ${date}` : ""}`;
  const parts = [
    frontmatter,
    `# ${document.title}`,
    byline,
    `Source: ${document.canonicalUrl}`,
    renderBlocks(document, warnings),
  ];

  if (options.includeConversation && document.conversation.length > 0) {
    parts.push("## Conversation context", renderConversation(document));
  }

  return {
    markdown: `${parts.filter(Boolean).join("\n\n").trim()}\n`,
    warnings: [...warnings],
    filename: slugifyFilename(document.title),
  };
}

