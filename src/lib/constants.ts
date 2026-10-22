import type { Project } from "@/lib/types";

export const SITE_CONFIG = {
  name: "Travis Jones",
  title: "Software Engineer | Legacy Modernization & Applied AI",
  tagline:
    "Eight years building and supporting manufacturing ERP at Global Shop Solutions. Strongest in COBOL and VB.NET, with legacy modernization and practical AI tooling experience.",
  location: "Ypsilanti, Michigan",
  availability: "Open to roles in Michigan or remote",
  email: "travisjohn.jones@gmail.com",
  github: "https://github.com/CosmonautJones",
  linkedin: "https://www.linkedin.com/in/travis-john-jones/",
  twitter: "https://twitter.com/TravisJohnJones",
  instagram: "https://www.instagram.com/tj_jones/",
};

/** Each `claim` is underlined in the hero sentence (SITE_CONFIG.tagline); its row says where that claim comes from. */
export const PROOF_POINTS = [
  {
    claim: "manufacturing ERP",
    label: "Eight years at Global Shop Solutions",
    detail: "COBOL and VB.NET are my strongest production languages. My DataLayer work also involved C#/.NET integration and PSQL persistence.",
    href: "/about#experience",
    linkLabel: "Experience",
  },
  {
    claim: "read-only COBOL knowledge access",
    label: "Security-filtered MCP interface",
    detail: "Built an interface to COBOL business logic for QA, Support, and engineering, with training and documentation.",
    href: "/work/mcp-cobol-bridge",
    linkLabel: "Synthetic case study",
  },
  {
    claim: "UI and QR redemption",
    label: "M-Local: Local Impact Grand Prize",
    detail: "Contributed UI and QR redemption workflows on a four-person, 24-hour hackathon team connecting U-M students with local offers.",
    href: "/work/m-local",
    linkLabel: "Team project",
  },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
] as const;

export const PROJECTS: Project[] = [
  {
    title: "M-Local",
    description: "A team-built prototype connecting U-M students with local business offers. I contributed UI and QR redemption workflows during a four-person, 24-hour hackathon.",
    image: "/projects/m-local.png",
    tags: ["Jac/Jaseci", "UI", "QR redemption"],
    caseStudyUrl: "/work/m-local",
    githubUrl: "https://github.com/CosmonautJones/m-local",
    role: "Local Impact Grand Prize · team project",
    featured: true,
    proof: "JacHacks a2Tech Local Impact Grand Prize, verified on Devpost. My contribution was UI and QR redemption; the award belongs to the team. The case study includes a historical capture with fictional demo data.",
  },
  {
    title: "MCP-to-COBOL bridge",
    description: "At Global Shop Solutions, I built a security-filtered, read-only MCP interface to COBOL business logic for QA, Support, and engineering. Explore the problem through a clearly synthetic example.",
    image: "",
    tags: ["COBOL", "MCP", "Legacy modernization"],
    caseStudyUrl: "/work/mcp-cobol-bridge",
    role: "Production contribution · synthetic illustration",
    featured: true,
    proof: "The original contribution is summarized at a high level. All public code, data, and architecture illustrations are newly authored examples; no employer implementation or customer data is included.",
  },
  {
    title: "TravOS",
    description: "A working engineering prototype that checks artifact evidence separately from a worker's success claim. Its deterministic demo rejects a missing artifact and accepts an explicitly requested correction.",
    image: "",
    tags: ["Python", "Verification", "Agent workflows"],
    caseStudyUrl: "/work/travos",
    role: "Working prototype · simulated workers",
    featured: true,
    proof: "The local demo retained its failed receipts through correction: three fixture dispatches, zero provider calls. Model-agnostic compounding remains a direction for future work, not a demonstrated autonomous capability.",
  },
  {
    title: "Whole Page Capture",
    description: "Capture a long web page as one PNG using a local Chrome or Edge extension. Useful for design reviews, bug reports, and keeping a visual record.",
    image: "/projects/whole-page-capture.jpg",
    tags: ["Browser extension", "JavaScript", "Canvas"],
    demoUrl: "/work/whole-page-capture",
    githubUrl: "https://github.com/CosmonautJones/whole-page-capture",
    role: "Installable utility",
    featured: true,
    proof: "Scroll-and-stitch capture with explicit tab access. Download the verified release and follow the local installation guide.",
    actionLabel: "Get the extension",
  },
  {
    title: "Article to Markdown",
    description: "Export a public X post or attached article as Markdown, or convert text you paste yourself. Keep an attributed copy for notes, research, or an assistant handoff.",
    image: "/projects/article-to-markdown.jpg",
    tags: ["TypeScript", "Local processing", "Markdown"],
    demoUrl: "/work/article-to-markdown",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Browser tool",
    featured: true,
    proof: "Public X links are read through FxTwitter with request limits and timeouts. Local pasted-text mode needs no network request; both paths support preview and Markdown download.",
    actionLabel: "Use the tool",
  },
  {
    title: "AI Usage Overlays",
    description:
      "A Windows tray HUD that normalizes local Claude Code, Codex, Cursor, and Grok usage into one always-on-top view. Each provider is an independent adapter; a missing login only blanks that tile.",
    image: "/projects/ai-usage-overlays.jpg",
    tags: ["PowerShell", "Windows", "WPF"],
    githubUrl: "https://github.com/CosmonautJones/ai-usage-overlays",
    caseStudyUrl: "/work/ai-usage-overlays",
    gallery: [
      {
        src: "/projects/overlays-full-hud.jpg",
        caption: "Always-on-top tray view",
        alt: "AI Usage Overlays HUD on black",
      },
      {
        src: "/projects/overlays-provider-tiles.jpg",
        caption: "Claude, Codex, Cursor, Grok",
        alt: "AI Usage Overlays provider tiles",
      },
      {
        src: "/projects/overlays-travos-footer.jpg",
        caption: "Brand + install path",
        alt: "AI Usage Overlays TravOS footer",
      },
    ],
    role: "Open Source",
    featured: true,
    proof: "Always-on-top tray HUD with themes, opacity, section toggles, and start-at-login. Providers write their own auth — the overlay never stores passwords. One-liner PowerShell install under LocalAppData.",
    actionLabel: "Read code",
  },
  {
    title: "PAD-7 Firing Room",
    description:
      "A dawn blockhouse on the Eastern Range. Arm a ten-second count, light Kestrel I, and warp the range clock until the orbit lamp comes up green.",
    image: "/projects/pad-7.jpg",
    tags: ["Three.js", "Orbital mechanics", "Web Audio"],
    liveUrl: "/pad-7/PAD-7.html",
    githubUrl: "https://github.com/CosmonautJones/pad-7-firing-room",
    role: "Simulation",
    featured: false,
    proof:
      "No bundler. Physics, the optical window, and the paper desk are separate scripts, and the flight math is tested on its own. RANGE flies the gravity turn. The room stays formica, brass, and mosaic lamps.",
    actionLabel: "Open the firing room",
  },
  {
    title: "Alcubemy",
    playground: true,
    preview: {
      src: "/projects/alcubemy-reaction.mp4",
      caption: "Water meets lava. Captured in Alcubemy.",
    },
    description:
      "An experimental falling-sand art game. Paint with sand, water, heat and alchemy, then watch the vessel change.",
    image: "/projects/alcubemy.png",
    tags: ["TypeScript", "Three.js", "Cellular simulation"],
    liveUrl: "https://alcubemy.travisjohnjones.com/",
    githubUrl: "https://github.com/CosmonautJones/falling-sand",
    role: "Experimental sandbox",
    featured: false,
    proof: "129,600 cells with local reactions, living habitats and material-aware lighting. Living construction remains on the roadmap.",
    actionLabel: "Play Alcubemy",
  },
  {
    title: "Lumen Garden",
    description:
      "A private idea workspace for choosing a next step, recording progress, and preparing context for an assistant. Built with React and TypeScript; data stays in your browser.",
    image: "/projects/lumen-garden.jpg",
    tags: ["React", "TypeScript", "Vite", "Vitest"],
    liveUrl: "https://cosmonautjones.github.io/lumen-garden/",
    githubUrl: "https://github.com/CosmonautJones/lumen-garden",
    role: "Interactive Demo",
    featured: false,
    proof: "Versioned local storage, validated backups, reversible edits, and scoped assistant handoffs. No accounts or automatic AI access.",
    actionLabel: "Open demo",
  },
  {
    title: "Mission Control",
    description:
      "A local control plane for supervised coding agents. Goals are divided among bounded workers in separate worktrees, verifier loops can reject and retry work, and approval decisions remain visible to the operator.",
    image: "/projects/mission-control.jpg",
    tags: ["TypeScript", "Node.js", "React", "Python"],
    githubUrl: "https://github.com/CosmonautJones/mission-control",
    caseStudyUrl: "/work/mission-control",
    role: "Open Source",
    featured: false,
    proof: "Bounded worktree teams, verifier loops, approval gates, and auditable run evidence. Local-first, no cloud account.",
    actionLabel: "Read code",
  },
  {
    title: "The Conductor",
    description:
      "A pure-orchestrator skill for ADR-driven implementation: it dispatches specialized subagents, persists run state, and escalates only on a small set of human-gated triggers.",
    image: "/projects/the-conductor.jpg",
    tags: ["TypeScript", "Vitest", "Claude Code"],
    githubUrl: "https://github.com/CosmonautJones/the-conductor",
    role: "Open Source",
    featured: false,
    proof: "Orchestrator does not write code; persists run state; human-gated escalations only.",
    actionLabel: "Read code",
  },
  {
    title: "Pixel Workshop",
    description:
      "A browser-only sprite bench that opens with Travis's ClaudeBot lobster, then makes remixing, sketching, undoing, and exporting feel immediate.",
    image: "/projects/pixel-art-editor.jpg",
    tags: ["Canvas API", "React", "TypeScript"],
    demoUrl: "/work/pixel-art-editor",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Interactive Demo",
    featured: false,
    proof: "32×32 lobster starter, touch drawing, flood fill, focused and extended palettes, 50-step history, and transparent PNG export.",
    actionLabel: "Open workshop",
  },
  {
    title: "Release Signal",
    description:
      "A concrete go/no-go evidence tool for UI changes, data migrations, and supervised agent workflows, with honest Hold, Ready with notes, and Ready verdicts.",
    image: "/projects/release-signal.jpg",
    tags: ["React", "TypeScript", "Product Quality"],
    demoUrl: "/work/release-signal",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Interactive Tool",
    featured: false,
    proof: "Scenario-specific gates, deterministic verdicts, evidence coverage, release notes, and a copyable PR or handoff packet.",
    actionLabel: "Build evidence",
  },
  {
    title: "TableSense",
    description:
      "A Flutter poker practice app with a six-seat Quick Deal table, hand replays, and decision feedback. Play with simulated chips in the browser.",
    image: "/projects/tablesense.jpg",
    tags: ["Flutter", "Dart", "Poker practice"],
    liveUrl: "https://cosmonautjones.github.io/poker-pokr/",
    githubUrl: "https://github.com/CosmonautJones/poker-pokr",
    role: "Working prototype",
    playground: true,
    featured: false,
    proof: "Verified in the hosted app: Quick Deal opens six seats, Fold advances the turn, and five folds reach an uncontested Hand Complete result. Source also contains Hold'em/Omaha configuration, lessons, replay history, and local session reports; those broader paths have not all been smoke-tested.",
    actionLabel: "Play TableSense",
  },
  {
    title: "The Cosmonaut’s Bar",
    description:
      "A personal six-drink recipe flight with compact animated pours, saved tasting progress, and Travis's secret Cosmonaut recipe waiting at the end.",
    image: "/projects/cocktail-mixer.jpg",
    tags: ["Animation", "SVG", "React"],
    demoUrl: "/work/cocktail-mixer",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Interactive Demo",
    featured: false,
    proof: "Layered SVG motion, reduced-motion support, sequenced ingredients, browser-saved progress, and a fair six-drink unlock path.",
    actionLabel: "Visit the bar",
  },
  {
    title: "ClaudeBot's Adventure",
    description:
      "A TypeScript arcade engine with a fixed-timestep loop, procedural lanes, WebGL rendering, bloom, scoring, and procedural audio.",
    image: "/projects/claudebot-adventure.jpg",
    tags: ["Game Engine", "WebGL", "TypeScript", "Web Audio"],
    demoUrl: "/adventure",
    githubUrl: "https://github.com/CosmonautJones/Portfolio",
    role: "Game",
    proof: "Fixed-step simulation, WebGL rendering, procedural audio, and scoring.",
    actionLabel: "Start run",
  },
  {
    title: "LoopedIn",
    description:
      "A private, event-centered family app that keeps invitations, plans, RSVPs, conversation, photos, and the memories afterward in one shared place.",
    image: "/projects/loopedin.jpg",
    tags: ["React Native", "Supabase", "TypeScript", "Netlify"],
    liveUrl: "https://loopedin-family.netlify.app",
    githubUrl: "https://github.com/CosmonautJones/family-loop",
    role: "Full-Stack Product",
    proof:
      "Public source. Hosted beta for private family events, invitations, RSVPs, discussions, and photos. Signed-out visitors see sign-in; there is no guest demo.",
    actionLabel: "Open LoopedIn",
  },
  {
    title: "Members Only Poker Club",
    description:
      "A private poker club platform with a public site, member portal, cashier tools, and admin workflows.",
    image: "/projects/members-only-poker-club.jpg",
    tags: ["Next.js", "Supabase", "Stripe", "PostgreSQL"],
    liveUrl: "https://members-only-poker-club.vercel.app",
    githubUrl: "https://github.com/CosmonautJones/members-only-poker-club",
    role: "Full-Stack App",
    proof: "Public pages, authenticated member areas, operational tooling, Supabase data, and Stripe payments.",
    actionLabel: "View site",
  },
  {
    title: "Harness Core",
    description:
      "An open-source framework for checking, scoring, and improving AI-generated work through repeatable quality loops.",
    image: "/projects/harness-core.jpg",
    tags: ["TypeScript", "CLI", "MCP", "Quality Gates"],
    githubUrl: "https://github.com/CosmonautJones/harness-core",
    role: "Open Source",
    proof: "Config-driven validation, scoring, iteration loops, plugins, CLI workflows, and MCP integration.",
    actionLabel: "Read code",
  },
];

export const SKILLS = [
  "COBOL", "VB.NET", "C#/.NET integration", "PSQL", "Entity Framework",
  "Python", "TypeScript", "React", "Next.js", "Node.js", "Git",
];

export const SKILL_CATEGORIES = [
  {
    label: "Strongest production languages",
    skills: ["ACU & Fujitsu COBOL", "VB.NET"],
  },
  {
    label: "Supporting enterprise experience",
    skills: ["C#/.NET integration", "PSQL", "SQL Server", "Entity Framework", "REST/JSON APIs"],
  },
  {
    label: "Web and independent projects",
    skills: ["Python", "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "PostgreSQL", "Jac/Jaseci (hackathon)"],
  },
  {
    label: "Tools used",
    skills: ["Model Context Protocol", "Playwright", "Vitest", "Git/GitHub", "GitHub Actions"],
  },
];

type ExperienceItem = {
  year: string;
  title: string;
  organization: string;
  description: string;
  highlights?: readonly string[];
};

export const EXPERIENCE: readonly ExperienceItem[] = [
  {
    year: "Sep 2018 - Sep 2026",
    title: "Software Engineer",
    organization: "Global Shop Solutions",
    description:
      "Built and supported manufacturing ERP features across manufacturing, engineering, shipping, sales, payroll, and accounting. Worked with system owners to clarify business rules and dependencies.",
    highlights: [
      "Contributed to DataLayer modernization connecting ACU/Fujitsu COBOL with VB.NET, C#/.NET, and PSQL persistence while preserving mature production behavior.",
      "Built a security-filtered, read-only MCP interface to COBOL business logic for QA, Support, and engineering; supported use through training and documentation.",
      "Supported REST integrations and SQL/Entity Framework data access; traced defects across application, service, data, and legacy code paths.",
      "Built regression, API/integration, and Playwright test tooling; reproduced defects and validated fixes before release.",
    ],
  },
  {
    year: "2018",
    title: "Software Engineering Program",
    organization: "Lambda Academy of Computer Science",
    description:
      "Completed a full-time software engineering program before moving into enterprise product development.",
  },
  {
    year: "Mar 2015 - Oct 2017",
    title: "Technical Supervisor",
    organization: "Buzzles Concessions, LLC",
    description:
      "Maintained POS, networking, security, and production systems across four locations; trained staff and resolved operational issues.",
  },
  {
    year: "2015",
    title: "A.A.S., Electronics Technology & Communications Engineering",
    organization: "San Jacinto College",
    description: "",
  },
];

/** Home "Try it now" strip. Copy locked in Portfolio Copy (TRY-IT-NOW.md, 2026-10-21). Media comes from PROJECTS. */
export const TRY_IT_NOW = [
  {
    project: "Article to Markdown",
    line: "Turn a public X post or pasted text into clean Markdown.",
    cta: "Use the tool",
    href: "/work/article-to-markdown",
    external: false,
    badge: "Browser tool",
  },
  {
    project: "TableSense",
    line: "Practice poker decisions at a six-seat table with simulated chips.",
    cta: "Play TableSense",
    href: "https://cosmonautjones.github.io/poker-pokr/",
    external: true,
    badge: "Working prototype",
  },
  {
    project: "Alcubemy",
    line: "Paint with sand, water, and heat, then watch the reactions play out.",
    cta: "Play Alcubemy",
    href: "https://alcubemy.travisjohnjones.com/",
    external: true,
    badge: "Experimental",
  },
] as const;
