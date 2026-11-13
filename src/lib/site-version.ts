import pkg from "../../package.json";

/** The site's own version, from package.json. Shown in the footer so a deploy can be identified at a glance. */
export const SITE_VERSION: string = pkg.version;

/** Short commit the deploy was built from (Netlify sets COMMIT_REF at build time); empty in local builds. */
export const SITE_COMMIT: string = (process.env.NEXT_PUBLIC_COMMIT_REF ?? "").slice(0, 7);

export function siteVersionLabel(): string {
  return SITE_COMMIT ? `Rev ${SITE_VERSION} · ${SITE_COMMIT}` : `Rev ${SITE_VERSION}`;
}
