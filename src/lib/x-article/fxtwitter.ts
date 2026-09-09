import type { ParsedXUrl } from "./x-url";
import { BodyLimitError, readBounded } from "./read-bounded";

type UnknownRecord = Record<string, unknown>;

export type ArticleRange = {
  offset: number;
  length: number;
};

export type ArticleEntityRange = ArticleRange & { key: number };
export type ArticleStyleRange = ArticleRange & { style: string };

export type ArticleBlock = {
  key: string;
  type: string;
  text: string;
  data: UnknownRecord;
  entityRanges: ArticleEntityRange[];
  inlineStyleRanges: ArticleStyleRange[];
};

export type ArticleEntity = {
  type: string;
  mutability?: string;
  data: UnknownRecord;
};

export type ArticleMedia = {
  kind: "image" | "video" | "gif" | "unknown";
  mediaId: string;
  url: string;
  width?: number;
  height?: number;
};

export type ConversationItem = {
  author: string;
  handle: string;
  text: string;
  url: string;
};

export type PublicDocument = {
  kind: "article" | "post";
  id: string;
  title: string;
  previewText: string;
  canonicalUrl: string;
  publishedAt: string;
  author: { name: string; handle: string; avatarUrl?: string };
  blocks: ArticleBlock[];
  entities: Record<string, ArticleEntity>;
  media: ArticleMedia[];
  conversation: ConversationItem[];
};

export type PublicError = {
  status: number;
  code: string;
  message: string;
};

export class ArticleFetchError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ArticleFetchError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeHttpUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function mapProviderStatus(status: number): ArticleFetchError {
  if (status === 404) {
    return new ArticleFetchError(
      404,
      "not_found",
      "This post is unavailable, private, or has been deleted.",
    );
  }
  if (status === 429) {
    return new ArticleFetchError(
      429,
      "rate_limited",
      "The public reader is busy. Try this article again in a moment.",
    );
  }
  if (status === 401 || status === 403) {
    return new ArticleFetchError(
      404,
      "not_public",
      "Only public X posts can be converted.",
    );
  }
  return new ArticleFetchError(
    502,
    "upstream_unavailable",
    "The public reader is temporarily unavailable. Your current article has not been changed.",
  );
}

function normalizeRange(value: unknown): ArticleRange | undefined {
  if (!isRecord(value)) return undefined;
  const offset = asFiniteNumber(value.offset);
  const length = asFiniteNumber(value.length);
  if (offset === undefined || length === undefined || offset < 0 || length < 0) {
    return undefined;
  }
  return { offset, length };
}

function normalizeBlock(value: unknown, index: number): ArticleBlock | undefined {
  if (!isRecord(value)) return undefined;
  const text = asString(value.text);
  const type = asString(value.type) || "unstyled";

  const entityRanges = Array.isArray(value.entityRanges)
    ? value.entityRanges.flatMap((range) => {
        const normalized = normalizeRange(range);
        const key = isRecord(range) ? asFiniteNumber(range.key) : undefined;
        return normalized && key !== undefined ? [{ ...normalized, key }] : [];
      })
    : [];

  const inlineStyleRanges = Array.isArray(value.inlineStyleRanges)
    ? value.inlineStyleRanges.flatMap((range) => {
        const normalized = normalizeRange(range);
        const style = isRecord(range) ? asString(range.style) : "";
        return normalized && style ? [{ ...normalized, style }] : [];
      })
    : [];

  return {
    key: asString(value.key) || `block-${index}`,
    type,
    text,
    data: asRecord(value.data),
    entityRanges,
    inlineStyleRanges,
  };
}

function normalizeEntities(value: unknown): Record<string, ArticleEntity> {
  if (!Array.isArray(value)) return {};
  const entities: Record<string, ArticleEntity> = {};

  for (const entry of value) {
    if (!isRecord(entry) || !isRecord(entry.value)) continue;
    const key = String(entry.key ?? "");
    const type = asString(entry.value.type);
    if (!key || !type || Object.hasOwn(entities, key)) continue;
    entities[key] = {
      type,
      mutability: asString(entry.value.mutability) || undefined,
      data: asRecord(entry.value.data),
    };
  }

  return entities;
}

function normalizeMedia(value: unknown): ArticleMedia[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const media: ArticleMedia[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;
    const mediaId = asString(item.media_id);
    const info = asRecord(item.media_info);
    const typename = asString(info.__typename).toLowerCase();
    const kind = typename.includes("image")
      ? "image"
      : typename.includes("gif")
        ? "gif"
        : typename.includes("video")
          ? "video"
          : "unknown";
    const videoInfo = asRecord(info.video_info);
    const variants = Array.isArray(info.variants)
      ? info.variants
      : Array.isArray(videoInfo.variants)
        ? videoInfo.variants
        : [];
    const playableVariant = variants
      .flatMap((variant) => {
        if (!isRecord(variant)) return [];
        const url = safeHttpUrl(variant.url);
        const contentType = asString(variant.content_type).toLowerCase();
        if (!url || (contentType && contentType !== "video/mp4")) return [];
        return [
          {
            url,
            bitRate: asFiniteNumber(variant.bit_rate) ?? 0,
          },
        ];
      })
      .sort((left, right) => right.bitRate - left.bitRate)[0];
    const previewUrl = safeHttpUrl(
      info.original_img_url ?? info.thumbnail_url ?? info.original_url,
    );
    const url =
      kind === "video" || kind === "gif"
        ? playableVariant?.url || previewUrl
        : previewUrl || playableVariant?.url || "";
    if (!mediaId || !url || seen.has(mediaId)) continue;
    const width = asFiniteNumber(info.original_img_width);
    const height = asFiniteNumber(info.original_img_height);
    media.push({
      kind,
      mediaId,
      url,
      ...(width === undefined ? {} : { width }),
      ...(height === undefined ? {} : { height }),
    });
    seen.add(mediaId);
  }

  return media;
}

function normalizeAuthor(status: UnknownRecord, root: UnknownRecord) {
  const author = isRecord(status.author)
    ? status.author
    : isRecord(root.author)
      ? root.author
      : {};
  const handle = asString(author.screen_name) || "unknown";
  return {
    name: asString(author.name) || handle,
    handle,
    avatarUrl: safeHttpUrl(author.avatar_url) || undefined,
  };
}

function normalizeConversation(
  value: unknown,
  focalId: string,
): ConversationItem[] {
  if (!Array.isArray(value)) return [];
  const items: ConversationItem[] = [];

  for (const raw of value) {
    const wrapper = asRecord(raw);
    const status = isRecord(wrapper.status) ? wrapper.status : wrapper;
    if (asString(status.id) === focalId) continue;
    const text = asString(status.text).trim();
    if (!text) continue;
    const author = asRecord(status.author);
    const handle = asString(author.screen_name) || "unknown";
    items.push({
      author: asString(author.name) || handle,
      handle,
      text,
      url:
        safeHttpUrl(status.url) ||
        `https://x.com/${handle}/status/${asString(status.id)}`,
    });
  }

  return items;
}

export function normalizeFxTwitterResponse(
  value: unknown,
  parsed: ParsedXUrl,
): PublicDocument {
  if (!isRecord(value)) {
    throw new ArticleFetchError(
      502,
      "invalid_upstream_response",
      "The public reader returned an unreadable response.",
    );
  }

  const providerCode = asFiniteNumber(value.code);
  if (providerCode !== undefined && providerCode !== 200) {
    throw mapProviderStatus(providerCode);
  }

  if (!isRecord(value.status)) {
    throw mapProviderStatus(404);
  }

  const status = value.status;
  const author = normalizeAuthor(status, value);
  const article = isRecord(status.article) ? status.article : undefined;
  const common = {
    id: asString(status.id) || parsed.id,
    canonicalUrl: parsed.canonicalUrl,
    publishedAt: asString(article?.created_at) || asString(status.created_at),
    author,
    conversation: normalizeConversation(value.thread, parsed.id),
  };

  if (!article) {
    const text = asString(status.text).trim();
    if (!text) {
      throw new ArticleFetchError(
        404,
        "no_readable_content",
        "This post does not contain readable public text.",
      );
    }
    return {
      ...common,
      kind: "post",
      title: `Post by ${author.name}`,
      previewText: text.slice(0, 240),
      blocks: [
        {
          key: "post-text",
          type: "unstyled",
          text,
          data: {},
          entityRanges: [],
          inlineStyleRanges: [],
        },
      ],
      entities: {},
      media: normalizeMedia(asRecord(status.media).all),
    };
  }

  const content = asRecord(article.content);
  const blocks = Array.isArray(content.blocks)
    ? content.blocks.flatMap((block, index) => {
        const normalized = normalizeBlock(block, index);
        return normalized ? [normalized] : [];
      })
    : [];
  const title = asString(article.title).trim();
  if (!title || blocks.length === 0) {
    throw new ArticleFetchError(
      502,
      "invalid_upstream_response",
      "The public reader returned an incomplete article.",
    );
  }

  return {
    ...common,
    kind: "article",
    title,
    previewText: asString(article.preview_text),
    blocks,
    entities: normalizeEntities(content.entityMap),
    media: normalizeMedia(article.media_entities),
  };
}

export async function fetchPublicArticle(
  parsed: ParsedXUrl,
  fetcher: typeof fetch = fetch,
  timeoutMs = 8_000,
): Promise<PublicDocument> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(
      `https://api.fxtwitter.com/2/status/${parsed.id}`,
      {
        headers: {
          accept: "application/json",
          "user-agent": "Vellum/1.0 (+article-to-markdown)",
        },
        signal: controller.signal,
        redirect: "error",
        cache: "no-store",
      },
    );

    if (!response.ok) throw mapProviderStatus(response.status);

    let payload: unknown;
    try {
      payload = JSON.parse(await readBounded(response.body, 1_048_576));
    } catch (error) {
      if (controller.signal.aborted) throw error;
      if (error instanceof BodyLimitError) throw new ArticleFetchError(502, "response_too_large", "This article is too large for the public reader. You can paste its text instead.");
      throw new ArticleFetchError(
        502,
        "invalid_upstream_response",
        "The public reader returned an unreadable response.",
      );
    }
    return normalizeFxTwitterResponse(payload, parsed);
  } catch (error) {
    if (error instanceof ArticleFetchError) throw error;
    if (
      controller.signal.aborted ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new ArticleFetchError(
        504,
        "upstream_timeout",
        "The public reader took too long to respond. Try again in a moment.",
      );
    }
    throw new ArticleFetchError(
      502,
      "upstream_unavailable",
      "The public reader is temporarily unavailable. Your current article has not been changed.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export function toPublicError(error: unknown): PublicError {
  if (error instanceof ArticleFetchError) {
    return { status: error.status, code: error.code, message: error.message };
  }
  if (error instanceof Error && /public X post URL/i.test(error.message)) {
    return { status: 400, code: "invalid_url", message: error.message };
  }
  return {
    status: 500,
    code: "unexpected_error",
    message: "Vellum could not convert this post. Your current article has not been changed.",
  };
}
