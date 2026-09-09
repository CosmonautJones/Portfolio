# Project delivery queue

Status: inspected on 2026-09-09. Capture presentation and article extraction implementation are prepared in the portfolio; integrated verification passed (930 tests, production build, ESLint with one existing warning); hosted verification remains the integrator's gate. This plan does not claim a persistent or scheduled agent service has been provisioned.

## Decision

Prioritize useful output people can take away. Whole Page Capture already produces a real file. Vellum addresses a real research workflow; its incomplete default branch hid a complete extractor on a working branch, recovered in this session. The sand project may be an excellent visual proof, but its identity has not been verified. Do not invent a repository or substitute Alchemy for it.

## 1. Whole Page Capture: installable, immediate value

- Human job: keep a complete webpage as one PNG for reference, feedback, or documentation.
- Verified public source: https://github.com/CosmonautJones/whole-page-capture
- Inspected main: `8fb6b0194c0ec5b82f6ed0e206c48c9acc87a389`.
- Verified release: https://github.com/CosmonautJones/whole-page-capture/releases/tag/v1.0.0
- Verified download: https://github.com/CosmonautJones/whole-page-capture/releases/download/v1.0.0/whole-page-capture.zip
- Download returned HTTP 200, 17,483 bytes; SHA-256 `01635889a65ab6aee75f0423f88cb2cd3f32ea2adc68376c8e1fde686e527eec`, matching checked-in archive/checksum.
- Runtime: Chrome/Edge Manifest V3, minimum Chromium 116, four permissions (`contextMenus`, `activeTab`, `scripting`, `storage`); no host permissions.
- Hosting answer: the portfolio can host the installation page and archive. An ordinary website cannot install itself as an extension or capture arbitrary browser tabs. Explain the desktop requirement before the download.

### Smallest valuable slice today

- [x] Add a project page with a real ZIP download, Chrome/Edge steps, supported-page limits, source link, and concise privacy explanation.
- [x] Preserve release provenance and show version 1.0.0; if mirroring the archive, verify exact checksum.
- [ ] Show a real capture example only after producing or obtaining verified evidence. README references `docs/images/whole-page-capture-proof.png`, but that file is absent from the inspected tree.
- [x] Make the download useful from mobile by explaining that installation happens on a desktop, without pretending it is an iOS extension.

### Acceptance

- Download returns a ZIP containing only approved runtime files, with a matching checksum.
- Installation steps match the actual manifest and ZIP layout.
- Public page and download work without login, and its cards distinguish installation from an in-browser demo.
- A Chrome/Edge capture of a labeled long page includes top/middle/bottom and restores scroll; failure/cancel does not emit a partial screenshot.

Existing verification in this session: runtime boundary check passed; 31 unit tests passed. The one packaging test requires PowerShell 7 and could not spawn `pwsh` (`ENOENT`) here. This is an environment limitation, not a successful packaging rerun. Do not claim full extension browser verification from these tests.

## 2. Article to Markdown: recovered Vellum's useful core

- Human job: turn an article into a clean, attributed Markdown file for personal notes or assistant context.
- Existing source: Vellum, private repository; keep its visibility unchanged and omit inaccessible source links from the public project card.
- Inspected main tree: `38b2a6e096f37380665269ecb3b5ddafad8a76fc`.
- README promises X post/thread/article/profile conversion and optional xAI summaries, but the actual tree is incomplete.
- `src/routes/index.tsx` imports missing `src/components/vellum-app.tsx`; `src/lib/store.ts` imports missing `src/lib/to-markdown.ts`; referenced build/migration scripts and Vite configuration are absent. This snapshot cannot be presented as a deployable application.
- A subsequent branch check resolved the missing implementation: `codex/vellum-article-extractor`, commit `23005fa4effc2a947369a0fdbd6c6be240588e77`, contains the complete Next/Vinext app, API, FxTwitter normalization, Markdown rendering, and tests.
- Its existing Sites deployment requires custom access, so do not change its sharing or offer it as a public recruiter demo.
- Conversion modules were adapted into the public portfolio with Travis's MIT notice preserved at `src/lib/x-article/LICENSE`; no private deployment configuration or credentials were copied.

### Smallest valuable slice today

- [x] Add actual public X post/attached article retrieval at `/api/x-article`, surfaced at `/work/article-to-markdown`.
- [x] Disclose FxTwitter as a third-party reader before the explicit request. No paid API, X login, or user credentials.
- [x] Only accept HTTPS X/Twitter status URLs; send the validated numeric ID to one fixed provider host. Reject redirects, cap provider response at 1 MiB and input at 4 KiB, enforce an eight-second provider timeout.
- [x] Add a best-effort process allowance of 30 conversions/minute and maximum three concurrent reads. This is not a distributed abuse-control guarantee.
- [x] Keep attributed Markdown and warnings visible; provide copy/download. A failed read preserves the previous result.
- [x] Provide a separate collapsed browser-only pasted-text fallback with title, author, source, original example, and optional safely quoted YAML frontmatter. URL reads never overwrite that draft.
- [x] Explicitly exclude complete threads, profile timelines, private/deleted/unavailable posts, and automatic AI summaries.
- [ ] Verify the deployed URL-reader interaction against a real public post and an attached article.

### Acceptance

- Pasted content round-trips without fabricated text or attribution.
- Source URL accepts only intended HTTP(S) links; unsafe protocols cannot become clickable output.
- Quotes, newlines, code fences, and YAML characters have deterministic tests.
- Copy failure leaves selectable text; downloaded filename and content are correct.
- Keyboard/mobile users can input, preview, and export without horizontal page overflow.
- No network request is made when converting pasted content; only choosing Read article invokes the public reader.

### Verification and next real slice

Scoped validation passed: 37 tests across eight files covering original structured conversion, URL validation, provider failure/timeout, byte limits, request allowance, paste export contents, clipboard fallback, and separate URL-reader failure retention. Focused ESLint passed. A direct live request to FxTwitter for public post `20` returned HTTP 200 and the expected structured post response; the final same-site handler and browser flow still require hosted verification. No canned content is substituted for retrieval.

Next, reconcile the working Vellum branch with its incomplete main before advertising a standalone Vellum repository. Add live availability checks and a verified public-article fixture refresh process, without importing private data. Prefer better extraction fidelity and usable error handling over another superficial generator.

## 3. Sand project: identify before promising

- Human job to confirm: playful, tactile material experimentation; a memorable interactive proof of simulation and rendering work.
- Status: unidentified. The current portfolio catalog contains no sand entry or route. GitHub repository/readme searches did not resolve it.
- Do not label `alchemy-opus` as the sand project: its inspected README describes combining mathematical essences, not a falling-sand simulation.
- No demo URL or repository has been verified, so no release date or implementation claim is warranted.

### First bounded slice once identified

- [ ] Confirm the source and actual runnable deployment.
- [ ] Preserve its strongest interaction; put one visible material control and reset action within reach.
- [ ] Add one deliberately designed starter scene that produces a satisfying result in 20 seconds.
- [ ] Expose a clear launch path from the portfolio; prefer a full-width route or focused external launch over a cramped iframe.
- [ ] Add a screenshot/export only if it serves sharing an actual creation.

### Acceptance

- Fresh visitor can reach and manipulate the simulation without sign-in or developer setup.
- Pointer/touch interaction works; controls have labels and keyboard access where applicable.
- Paused/offscreen behavior avoids needless work; reduced-motion preference is respected where meaningful.
- Frame rate and memory observations name the device/browser; do not invent performance claims.
- Reset restores a known state and does not destroy an unrelated saved creation without a clear action.

## Delivery team

| Role | Bounded ownership | Required handoff |
| --- | --- | --- |
| Product/editor lead | Choose the user problem, project order, wording, and honest readiness | One user journey, exclusions, acceptance checklist |
| Implementation worker | One tool or route with an explicit file boundary | Changed files, behavior, focused tests, limitations |
| Visual/accessibility reviewer | Desktop/mobile screenshots and keyboard flow | Specific defects with reproducible steps |
| Independent verifier | Source, tests, release artifact, deployment | Commit SHA, check results, live URL, tested interaction |
| Integrator | Portfolio catalog and publishing | No broken links; verified source/demo/download distinction |

Use the available Codex agents now. Grok or Cursor may run the same bounded briefs later if actually connected, but no external bot, paid account, background schedule, or persistent worker has been established by this document. Do not spread one unfinished feature across competing workers. Finish one useful slice before promoting it.

## Proposed professional flagship: behavior comparison lab

This is the strongest next mission after the useful tools ship. It would demonstrate Trav's actual differentiator: modernizing established business software while preserving behavior. It is proposed, not implemented.

Human job: give a reviewer a small synthetic business scenario, run legacy-style and modern .NET implementations against identical cases, and make behavioral differences understandable.

- [ ] Invent a tiny public business domain and entirely synthetic inputs; use no employer code, naming, data, screenshots, or internal documents.
- [ ] Show a few representative cases, including boundary conditions and rounding, with expected behavior explained.
- [ ] Execute both implementations or clearly identify any prerecorded comparison. Never label static illustrative output as a live .NET run.
- [ ] Present legacy result, modern result, exact difference, and the regression case that protects the fix.
- [ ] Let visitors change one input and see a meaningful result; provide an exportable regression report.
- [ ] Publish architecture, tradeoffs, real tests, and a short explanation of what Trav personally learned from modernization work.

Completion means a hiring engineer can understand the compatibility problem, reproduce one failing case, inspect the correction, and see why preserving behavior matters. This is more differentiated than another general agent dashboard.

## Presentation order

Lead with enterprise modernization experience and its concrete outcomes. Among personal projects, put a verified useful tool first (Whole Page Capture), then a working browser utility, then the strongest visual simulation when identified. Keep experimental orchestrators, Lumen, and novelty pieces in a secondary collection until their reason to exist is apparent from use. No project should need Trav to explain it personally before it makes sense.
