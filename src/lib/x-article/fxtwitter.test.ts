import assert from "node:assert/strict";
import { test } from "vitest";
import fixture from "./fixtures/article-response.json";
import {
  ArticleFetchError,
  fetchPublicArticle,
  normalizeFxTwitterResponse,
} from "./fxtwitter";
import type { ParsedXUrl } from "./x-url";

const parsed: ParsedXUrl = {
  id: "2080668775796314331",
  handle: "AnatoliKopadze",
  canonicalUrl:
    "https://x.com/AnatoliKopadze/status/2080668775796314331",
};

test("normalizes the live FxTwitter article nesting and media join", () => {
  const result = normalizeFxTwitterResponse(fixture, parsed);

  assert.equal(result.kind, "article");
  assert.equal(result.title, "Graph Engineering explained");
  assert.equal(result.blocks[1]?.type, "header-two");
  assert.equal(result.entities["0"]?.type, "MEDIA");
  assert.deepEqual(result.media, [
    {
      kind: "image",
      mediaId: "2080633727265165312",
      url: "https://pbs.twimg.com/media/example.jpg",
      width: 1672,
      height: 941,
    },
  ]);
});

test("normalizes a public non-article post as the basic fallback", () => {
  const result = normalizeFxTwitterResponse(
    {
      code: 200,
      status: {
        id: "20",
        url: "https://x.com/jack/status/20",
        text: "just setting up my twttr",
        created_at: "Tue Mar 21 20:50:14 +0000 2006",
        author: { name: "jack", screen_name: "jack" },
      },
    },
    { id: "20", handle: "jack", canonicalUrl: "https://x.com/jack/status/20" },
  );

  assert.equal(result.kind, "post");
  assert.equal(result.blocks[0]?.text, "just setting up my twttr");
  assert.equal(result.title, "Post by jack");
});

test("rejects missing public content and provider error codes", () => {
  assert.throws(
    () => normalizeFxTwitterResponse({ code: 404, status: null }, parsed),
    (error: unknown) =>
      error instanceof ArticleFetchError &&
      error.status === 404 &&
      error.code === "not_found",
  );
  assert.throws(
    () => normalizeFxTwitterResponse({ code: 200, status: { id: parsed.id, text: "" } }, parsed),
    /does not contain readable public text/i,
  );
});

test("maps upstream rate limits and malformed JSON to public errors", async () => {
  await assert.rejects(
    fetchPublicArticle(parsed, async () =>
      Response.json({ code: 429, message: "slow down" }, { status: 429 }),
    ),
    (error: unknown) =>
      error instanceof ArticleFetchError &&
      error.status === 429 &&
      error.code === "rate_limited",
  );

  await assert.rejects(
    fetchPublicArticle(
      parsed,
      async () => new Response("not json", { status: 200 }),
    ),
    (error: unknown) =>
      error instanceof ArticleFetchError &&
      error.status === 502 &&
      error.code === "invalid_upstream_response",
  );
});

test("maps empty public posts to the documented not-found contract", () => {
  assert.throws(
    () =>
      normalizeFxTwitterResponse(
        { code: 200, status: { id: parsed.id, text: "" } },
        parsed,
      ),
    (error: unknown) =>
      error instanceof ArticleFetchError &&
      error.status === 404 &&
      error.code === "no_readable_content",
  );
});

test("preserves video media through safe provider variants", () => {
  const raw = structuredClone(fixture) as unknown as {
    status: { article: { media_entities: unknown[] } };
  };
  raw.status.article.media_entities = [
    {
      media_id: "video-1",
      media_info: {
        __typename: "ApiVideo",
        thumbnail_url: "https://pbs.twimg.com/media/video-thumbnail.jpg",
        variants: [
          {
            bit_rate: 256000,
            content_type: "video/mp4",
            url: "https://video.twimg.com/example-low.mp4",
          },
          {
            bit_rate: 832000,
            content_type: "video/mp4",
            url: "https://video.twimg.com/example-high.mp4",
          },
        ],
      },
    },
  ];

  const result = normalizeFxTwitterResponse(raw, parsed);
  assert.deepEqual(result.media, [
    {
      kind: "video",
      mediaId: "video-1",
      url: "https://video.twimg.com/example-high.mp4",
    },
  ]);
});

test("classifies timer-triggered wrapped fetch failures as timeouts", async () => {
  const wrappedAbort: typeof fetch = async (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener(
        "abort",
        () => reject(new TypeError("wrapped abort")),
        { once: true },
      );
    });

  await assert.rejects(
    fetchPublicArticle(parsed, wrappedAbort, 5),
    (error: unknown) =>
      error instanceof ArticleFetchError &&
      error.status === 504 &&
      error.code === "upstream_timeout",
  );
});

