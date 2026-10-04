# Homepage contribution atlas

The homepage now includes an interactive GitHub contribution calendar after the selected projects. Visitors can switch between overhead and 3D views, replay the reveal, orbit the camera, adjust height, and inspect individual days with a pointer or keyboard. Heights use exact daily contribution counts; colors use GitHub's activity levels.

The renderer loads when the section enters the viewport. `/api/github-contributions` reads only CosmonautJones's public GitHub calendar, with a five-second upstream timeout and daily revalidation. It validates 365 consecutive dates and exact tooltip counts. Upstream failures or unexpected markup return a clearly dated October 3, 2026 snapshot; the homepage still works without GitHub availability. No token, added dependency, auth change, or database change is required.

Verified locally on the production build: 99 test files / 968 tests passed; lint passed with the existing `use-game-engine.ts` inputRef warning; `npm run build` passed. Browser checks covered both views, real daily refresh, hover counts, peak selection, keyboard navigation, camera dragging/reset, height scaling, 390px mobile layout, reduced motion, and an unavailable endpoint fallback. The live data check returned 365 days through October 4, 2026 and 1,624 contributions.

GitHub's calendar includes commits, pull requests, issues, and reviews. Public HTML is the data source; a future markup change will show the saved snapshot until the parser is updated. The refresh is a cached request when a visitor opens the section, so no scheduled worker or credential is needed.
