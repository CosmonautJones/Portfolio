# Portfolio release — September 9, 2026

## Delivered

- Expanded two-page Software Engineer resume and public HTML page, based on the strongest September 3 general resume and supplied career history. Both PDF pages visually inspected; selectable text and contact links checked. No invented metrics or public links to private project source.
- Shorter homepage, less repeated professional copy, resume navigation, improved muted text contrast, quieter project motion and expandable engineering details. Existing illustrated project covers preserved.
- Calm orbital logo concept generated for this task and implemented as a compact vector brand mark, favicon and Apple touch icon.
- Featured order: Whole Page Capture, Article to Markdown, AI Usage Overlays. Existing experimental projects remain discoverable.
- Whole Page Capture installation page and exact v1.0.0 release mirror. Archive SHA-256: `01635889a65ab6aee75f0423f88cb2cd3f32ea2adc68376c8e1fde686e527eec`. Desktop browser extension, not an iframe capture service.
- Public X post/article extraction through FxTwitter, adapted from the recovered Vellum working branch with its MIT notice; independent pasted-text fallback. Fixed provider endpoint, bounded bodies, timeout, redirect rejection, and best-effort process allowance. Provider disclosure precedes requests.
- Durable project queue and team handoffs in `docs/delivery/2026-09-09-project-delivery-queue.md`.

## Verification before release

- `npm test`: 89 files, 930 tests passed.
- `npm run lint`: no errors; existing `use-game-engine.ts:635` dependency warning remains.
- `npm run build`: production build passed, including the public resume, both project pages and X API route.
- PDF and release ZIP inspected; agent scoped extraction tests independently included in full test run.
- Direct FxTwitter request returned real post content; same-site hosted interaction is a post-release gate.

## Limits and follow-up

- No claim of mobile device or installed-extension end-to-end verification. Extension packaging rerun requires unavailable PowerShell; existing release archive is mirrored unchanged.
- Provider availability and extraction fidelity can vary. Complete threads, profile timelines, unavailable/private posts and AI summaries are not offered.
- Site deploy and public visitor interactions must be checked after publishing.
- Sand project identity is unresolved; request its link before adding it.
- Legacy-to-.NET behavior comparison lab is proposed, not built. No persistent Grok/Cursor service or paid subscription was provisioned; Codex agents worked in this session.
