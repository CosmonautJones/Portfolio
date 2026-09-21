import assert from "node:assert/strict";
import { test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import fixture from "./fixtures/article-response.json";
import {
  normalizeFxTwitterResponse,
  type PublicDocument,
} from "./fxtwitter";
import { articleToMarkdown } from "./to-markdown";

const parsed = {
  id: "2080668775796314331",
  handle: "AnatoliKopadze",
  canonicalUrl:
    "https://x.com/AnatoliKopadze/status/2080668775796314331",
};
const article = normalizeFxTwitterResponse(fixture, parsed);

test("preserves headings, emphasis, images, source metadata, and fenced code", () => {
  const result = articleToMarkdown(article, {
    obsidian: false,
    includeConversation: false,
  });

  assert.match(result.markdown, /^# Graph Engineering explained/m);
  assert.match(result.markdown, /By Anatoli Kopadze \(@AnatoliKopadze\)/);
  assert.match(result.markdown, /Source: https:\/\/x\.com\/AnatoliKopadze\/status\/2080668775796314331/);
  assert.match(result.markdown, /^## What a graph is/m);
  assert.match(result.markdown, /A \*\*bounded job\*\* produces a useful result\./);
  assert.match(
    result.markdown,
    /!\[Article image\]\(https:\/\/pbs\.twimg\.com\/media\/example\.jpg\)/,
  );
  assert.match(result.markdown, /```ts\nconst graph = true;\n```/);
  assert.doesNotMatch(result.markdown, /Conversation context/);
  assert.equal(result.filename, "graph-engineering-explained.md");
  assert.deepEqual(result.warnings, []);
});

test("adds YAML frontmatter and conversation only when requested", () => {
  const withConversation: PublicDocument = {
    ...article,
    conversation: [
      {
        author: "Helpful Reader",
        handle: "reader",
        text: "This adds one useful detail.",
        url: "https://x.com/reader/status/123",
      },
    ],
  };
  const result = articleToMarkdown(withConversation, {
    obsidian: true,
    includeConversation: true,
  });

  assert.match(result.markdown, /^---\ntitle: "Graph Engineering explained"/);
  assert.match(result.markdown, /source: "https:\/\/x\.com\//);
  assert.match(result.markdown, /^## Conversation context/m);
  assert.match(result.markdown, /Helpful Reader \(@reader\)/);
});

test("groups lists and resolves explicit link entities", () => {
  const document: PublicDocument = {
    ...article,
    blocks: [
      {
        key: "list-1",
        type: "unordered-list-item",
        text: "First",
        data: {},
        entityRanges: [],
        inlineStyleRanges: [],
      },
      {
        key: "list-2",
        type: "unordered-list-item",
        text: "Docs",
        data: {},
        entityRanges: [{ key: 9, offset: 0, length: 4 }],
        inlineStyleRanges: [],
      },
    ],
    entities: {
      "9": {
        type: "LINK",
        data: { url: "https://example.com/docs" },
      },
    },
  };

  const result = articleToMarkdown(document, {
    obsidian: false,
    includeConversation: false,
  });
  assert.match(result.markdown, /- First\n- \[Docs\]\(https:\/\/example\.com\/docs\)/);
});

test("clamps overlapping ranges and warns instead of dropping unknown atoms", () => {
  const document: PublicDocument = {
    ...article,
    blocks: [
      {
        key: "range",
        type: "unstyled",
        text: "Signal",
        data: {},
        entityRanges: [],
        inlineStyleRanges: [
          { offset: -2, length: 5, style: "Bold" },
          { offset: 2, length: 99, style: "Italic" },
          { offset: 3, length: 0, style: "Underline" },
        ],
      },
      {
        key: "unknown",
        type: "atomic",
        text: "Readable fallback",
        data: {},
        entityRanges: [{ key: 22, offset: 0, length: 1 }],
        inlineStyleRanges: [],
      },
    ],
    entities: {
      "22": { type: "POLL", data: {} },
    },
  };

  const result = articleToMarkdown(document, {
    obsidian: false,
    includeConversation: false,
  });
  assert.match(result.markdown, /Readable fallback/);
  assert.deepEqual(result.warnings, ["Preserved unsupported article element: POLL"]);
});

test("protects paragraph line prefixes from becoming Markdown structure", () => {
  const document: PublicDocument = {
    ...article,
    blocks: [
      {
        key: "plain",
        type: "unstyled",
        text: "# Not a heading\n- Not a list\n1. Not ordered\n---\nTitle\n===\n    Not code",
        data: {},
        entityRanges: [],
        inlineStyleRanges: [],
      },
    ],
  };
  const result = articleToMarkdown(document, {
    obsidian: false,
    includeConversation: false,
  });
  assert.match(
    result.markdown,
    /\\# Not a heading\n\\- Not a list\n1\\\. Not ordered\n\\---\nTitle\n\\===\n&#32; {3}Not code/,
  );
  const rendered = renderToStaticMarkup(
    createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, result.markdown),
  );
  assert.doesNotMatch(rendered, /<code>\s*Not code/);
  assert.doesNotMatch(rendered, /\\\s+Not code/);
  assert.match(rendered, /Not code/);
});

test("preserves partial data-only links and canonical style nesting", () => {
  const document: PublicDocument = {
    ...article,
    blocks: [
      {
        key: "data-link",
        type: "unstyled",
        text: "Read docs now",
        data: {
          urls: [
            {
              fromIndex: 5,
              toIndex: 9,
              text: "https://example.com/docs",
            },
          ],
        },
        entityRanges: [],
        inlineStyleRanges: [{ offset: 5, length: 4, style: "Bold" }],
      },
    ],
  };
  const result = articleToMarkdown(document, {
    obsidian: false,
    includeConversation: false,
  });
  assert.match(result.markdown, /Read \*\*\[docs\]\(https:\/\/example\.com\/docs\)\*\* now/);
});

test("omits invalid provider dates without losing the article", () => {
  const result = articleToMarkdown(
    { ...article, publishedAt: "not-a-date" },
    { obsidian: false, includeConversation: false },
  );
  assert.match(result.markdown, /^# Graph Engineering explained/m);
  assert.deepEqual(result.warnings, ["The publication date was unavailable."]);
});

