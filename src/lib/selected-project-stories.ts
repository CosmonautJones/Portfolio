export type SelectedProjectStory = {
  id: string;
  title: string;
  kind: string;
  problem: string;
  role: string;
  evidence: string;
  scope: string;
  href: string;
  linkLabel: string;
  awardUrl?: string;
};

export const SELECTED_PROJECT_STORIES: readonly SelectedProjectStory[] = [
  {
    id: "m-local",
    title: "M-Local",
    kind: "Team hackathon project",
    problem: "Help U-M students discover local business offers and take an offer through redemption.",
    role: "Contributed UI and QR redemption workflows on a four-person, 24-hour team.",
    evidence: "Local Impact Grand Prize at JacHacks a2Tech, awarded to our team and recorded on Devpost.",
    scope: "Hackathon prototype. The award establishes team recognition; production onboarding and adoption remain outside this case study.",
    href: "/work/m-local",
    linkLabel: "Read the M-Local story",
    awardUrl: "https://devpost.com/software/m-local",
  },
  {
    id: "mcp-cobol-bridge",
    title: "MCP-to-COBOL bridge",
    kind: "Production contribution / synthetic illustration",
    problem: "Help QA, Support, and engineering investigate business behavior held in COBOL.",
    role: "Built a security-filtered, read-only MCP interface at Global Shop Solutions, with training and documentation.",
    evidence: "The public companion checks a fictional rule lookup and rejects an unknown rule ID.",
    scope: "Public code, data, and architecture examples are synthetic. They illustrate the problem; the original implementation remains private.",
    href: "/work/mcp-cobol-bridge",
    linkLabel: "Read the synthetic bridge case study",
  },
  {
    id: "travos",
    title: "TravOS",
    kind: "Working engineering prototype",
    problem: "Keep a worker's success claim separate from evidence that the required artifact exists and passes checks.",
    role: "Built a Python prototype and a reproducible synthetic demo with independent artifact verification.",
    evidence: "A three-dispatch fixture rejects false success, verifies an explicit correction, and retains the failed receipts.",
    scope: "Scripted, simulated workers; zero model calls. Compounding learning and broader autonomous operation remain future work.",
    href: "/work/travos",
    linkLabel: "Inspect the TravOS prototype",
  },
];
