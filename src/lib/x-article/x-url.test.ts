import assert from "node:assert/strict";
import { test } from "vitest";
import { parseXStatusUrl } from "./x-url";

test("normalizes x.com and twitter.com status URLs", () => {
  assert.deepEqual(
    parseXStatusUrl(
      "https://twitter.com/AnatoliKopadze/status/2080668775796314331?s=20",
    ),
    {
      id: "2080668775796314331",
      handle: "AnatoliKopadze",
      canonicalUrl:
        "https://x.com/AnatoliKopadze/status/2080668775796314331",
    },
  );
});

test("accepts mobile X hosts and ignores trailing path segments", () => {
  assert.deepEqual(
    parseXStatusUrl(
      "https://mobile.x.com/jack/status/20/photo/1?utm_source=share",
    ),
    {
      id: "20",
      handle: "jack",
      canonicalUrl: "https://x.com/jack/status/20",
    },
  );
});

test("rejects profiles and non-X hosts", () => {
  assert.throws(
    () => parseXStatusUrl("https://x.com/AnatoliKopadze"),
    /public X post URL/i,
  );
  assert.throws(
    () =>
      parseXStatusUrl(
        "https://example.com/AnatoliKopadze/status/2080668775796314331",
      ),
    /public X post URL/i,
  );
});

test("rejects credentials and non-https URLs", () => {
  assert.throws(
    () => parseXStatusUrl("https://user:pass@x.com/jack/status/20"),
    /public X post URL/i,
  );
  assert.throws(
    () => parseXStatusUrl("http://x.com/jack/status/20"),
    /public X post URL/i,
  );
});

