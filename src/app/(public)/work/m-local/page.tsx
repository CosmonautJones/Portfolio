import type { Metadata } from "next";
import { CaseStudy } from "@/components/portfolio/case-study";

export const metadata: Metadata = {
  title: "M-Local | Local Impact Grand Prize",
  description: "M-Local, a JacHacks a2Tech team prototype connecting U-M students with local offers. Travis contributed UI and QR redemption workflows.",
};

export default function MLocalCasePage() {
  return (
    <CaseStudy
      title="M-Local"
      lede="A team-built prototype connecting U-M students with local business offers. Local Impact Grand Prize at JacHacks a2Tech."
      tags={["Jac / Jaseci", "UI", "QR redemption", "Team hackathon"]}
      githubUrl="https://github.com/CosmonautJones/m-local"
      downloadUrl="https://devpost.com/software/m-local"
      downloadLabel="Award submission"
      gallery={[
        {
          src: "/projects/m-local.png",
          alt: "M-Local welcome interface in a historical project capture",
          caption: "Historical capture, September 29, 2026. Fictional demo data; this image is not evidence of current live readiness.",
        },
      ]}
      sections={[
        {
          heading: "The problem",
          body: "Help students discover nearby business offers and give a local offer a clear path from discovery to redemption. The hackathon prototype brought that student and merchant workflow into one project.",
        },
        {
          heading: "My contribution",
          body: "I contributed UI and QR redemption workflows on a four-person, 24-hour hackathon team. The source and submission describe the broader team project; my contribution here is the interface and redemption work.",
        },
        {
          heading: "What the award establishes",
          body: "M-Local won Local Impact - Grand Prize at JacHacks a2Tech. Devpost lists the award and all four creators. This is recognition of the team prototype, rather than a claim about customer adoption or production operation.",
        },
        {
          heading: "Inspect the work",
          body: "Use the public repository to inspect the implementation and the award submission to understand the original hackathon project. The screenshot above is a dated record. Current release acceptance is still being evaluated, so this case study does not promise a production onboarding or redemption service.",
        },
      ]}
    />
  );
}
