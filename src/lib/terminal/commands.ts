import type { Command, CommandContext, CommandResult } from "./types";
import { SITE_CONFIG, SKILL_CATEGORIES, PROJECTS, EXPERIENCE } from "@/lib/constants";

// ─── Fortune quotes ───────────────────────────────────────────────────

const FORTUNES = [
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"The best error message is the one that never shows up." — Thomas Fuchs',
  '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
  '"Simplicity is the soul of efficiency." — Austin Freeman',
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"Programs must be written for people to read, and only incidentally for machines to execute." — Abelson & Sussman',
  '"The most disastrous thing that you can ever learn is your first programming language." — Alan Kay',
  '"Walking on water and developing software from a specification are easy if both are frozen." — Edward V Berard',
  '"Debugging is twice as hard as writing the code in the first place." — Brian Kernighan',
  '"The only way to learn a new programming language is by writing programs in it." — Dennis Ritchie',
  '"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupery',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"It works on my machine." — Every Developer Ever',
  '"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton',
];

const SUDO_RESPONSES = [
  "Nice try. This incident will be reported. ...just kidding.",
  "Permission denied. You're not root here, friend.",
  "sudo: unable to resolve host portfolio-shell: system has feelings too",
  "I appreciate your ambition, but no.",
  "Access denied. Have you tried saying please?",
];

// ─── ASCII Art ────────────────────────────────────────────────────────

const NEOFETCH_ART = `
       ████████
     ██        ██
   ██   ▓▓  ▓▓   ██
   ██            ██
   ██   ▓▓▓▓▓   ██
     ██        ██
       ████████
`.trim();

const COWSAY_TEMPLATE = (msg: string) => {
  const border = "-".repeat(msg.length + 2);
  return ` ${border}
< ${msg} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
};

// ─── Main commands ────────────────────────────────────────────────────

const helpCommand: Command = {
  name: "help",
  description: "Show available commands",
  execute: (_args, ctx) => {
    const cmds = getCommandsForTheme(ctx.theme).filter((c) => !c.hidden);
    const lines = cmds.map(
      (c) => `  ${c.name.padEnd(12)} ${c.description}`
    );
    return {
      output: [
        { type: "system", content: "Available commands:" },
        { type: "ascii", content: lines.join("\n") },
      ],
    };
  },
};

const aboutCommand: Command = {
  name: "about",
  description: "Who is Travis Jones?",
  execute: () => {
    const bio = [
      `Name: ${SITE_CONFIG.name}`,
      `Title: ${SITE_CONFIG.title}`,
      `Tagline: "${SITE_CONFIG.tagline}"`,
      "",
      "Experience:",
      ...EXPERIENCE.map((e) => `  ${e.year} — ${e.title}`),
      "",
      `GitHub: ${SITE_CONFIG.github}`,
      `LinkedIn: ${SITE_CONFIG.linkedin}`,
    ];
    return { output: [{ type: "text", content: bio.join("\n") }] };
  },
};

const skillsCommand: Command = {
  name: "skills",
  description: "View skill categories",
  execute: () => {
    const lines = SKILL_CATEGORIES.map(
      (cat) => `[${cat.label}]\n  ${cat.skills.join(", ")}`
    );
    return { output: [{ type: "text", content: lines.join("\n\n") }] };
  },
};

const projectsCommand: Command = {
  name: "projects",
  description: "List portfolio projects",
  execute: () => {
    const lines = PROJECTS.map(
      (p) => `  ${p.title.padEnd(22)} ${p.description?.slice(0, 60)}...`
    );
    return {
      output: [
        { type: "system", content: "Projects:" },
        { type: "ascii", content: lines.join("\n") },
      ],
    };
  },
};

const neofetchCommand: Command = {
  name: "neofetch",
  description: "Display system info",
  execute: (_args, ctx) => {
    const info = [
      `OS:      TravisOS v2.0`,
      `Shell:   portfolio-shell`,
      `Theme:   ${ctx.theme === "retro" ? "CRT Green" : "Modern Dark"}`,
      `Level:   ${ctx.level ?? 1} (${ctx.title ?? "Visitor"})`,
      `Uptime:  since 2018`,
      `Packages: React, Next.js, TypeScript`,
    ];

    const artLines = NEOFETCH_ART.split("\n");
    const maxArt = artLines.reduce((m, l) => Math.max(m, l.length), 0);
    const combined = [];
    const maxLines = Math.max(artLines.length, info.length);

    for (let i = 0; i < maxLines; i++) {
      const art = (artLines[i] ?? "").padEnd(maxArt + 4);
      const inf = info[i] ?? "";
      combined.push(art + inf);
    }

    return { output: [{ type: "ascii", content: combined.join("\n") }] };
  },
};

const matrixCommand: Command = {
  name: "matrix",
  description: "Enter the Matrix",
  execute: () => {
    const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789";
    const lines: string[] = [];
    for (let i = 0; i < 8; i++) {
      let line = "";
      for (let j = 0; j < 40; j++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      lines.push(line);
    }
    return {
      output: [
        { type: "system", content: "Entering the Matrix..." },
        { type: "ascii", content: lines.join("\n") },
        { type: "system", content: "Wake up, Neo..." },
      ],
    };
  },
};

const cowsayCommand: Command = {
  name: "cowsay",
  description: "The cow speaks",
  execute: (args) => {
    const msg = args.length > 0 ? args.join(" ") : "Moo! Welcome to my portfolio.";
    return { output: [{ type: "ascii", content: COWSAY_TEMPLATE(msg) }] };
  },
};

const fortuneCommand: Command = {
  name: "fortune",
  description: "Random developer wisdom",
  execute: () => {
    const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    return { output: [{ type: "text", content: quote }] };
  },
};

const clearCommand: Command = {
  name: "clear",
  description: "Clear the terminal",
  execute: () => ({ output: [], clear: true }),
};

const sudoCommand: Command = {
  name: "sudo",
  description: "Attempt superuser access",
  execute: (args) => {
    const response = SUDO_RESPONSES[Math.floor(Math.random() * SUDO_RESPONSES.length)];
    return {
      output: [
        { type: "error", content: `$ sudo ${args.join(" ")}` },
        { type: "error", content: response },
      ],
    };
  },
};

const vaporwaveCommand: Command = {
  name: "vaporwave",
  description: "Activate aesthetic mode",
  hidden: true,
  execute: (_args, ctx) => {
    // Trigger discovery via context callback
    ctx.onDiscover?.("vaporwave");

    // Apply vaporwave class to document
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("vaporwave");
      setTimeout(() => {
        document.documentElement.classList.remove("vaporwave");
      }, 30000);
    }

    return {
      output: [
        { type: "system", content: "A E S T H E T I C  M O D E  A C T I V A T E D" },
        { type: "text", content: "Palette shifted for 30 seconds. Enjoy the vibes." },
      ],
    };
  },
};

// ─── Retro-only commands (hidden terminal) ────────────────────────────

const whoisCommand: Command = {
  name: "whois",
  description: "Identity card",
  execute: () => {
    const card = [
      "┌─────────────────────────────────┐",
      "│  IDENTITY CARD                  │",
      "│                                 │",
      `│  Name:   ${SITE_CONFIG.name.padEnd(22)}│`,
      `│  Handle: CosmonautJones          │`,
      `│  Role:   ${SITE_CONFIG.title.padEnd(22)}│`,
      "│  Status: Building things         │",
      "│  Coffee: Black, no sugar         │",
      "│                                 │",
      "│  \"Curiosity is the engine.\"     │",
      "└─────────────────────────────────┘",
    ];
    return { output: [{ type: "ascii", content: card.join("\n") }] };
  },
};

const lsCommand: Command = {
  name: "ls",
  description: "List directory contents",
  execute: () => ({
    output: [
      { type: "text", content: "readme.txt  .vault  secrets/  .hidden" },
    ],
  }),
};

const catCommand: Command = {
  name: "cat",
  description: "Read file contents",
  execute: (args) => {
    const file = args[0]?.toLowerCase();
    if (file === "readme" || file === "readme.txt") {
      return {
        output: [
          {
            type: "text",
            content: [
              "If you found this, you're my kind of person.",
              "",
              "Most people scroll. You dig.",
              "Most people click. You type.",
              "",
              "There's a vault somewhere on this site.",
              "No link will take you there.",
              "But if you've gotten this far...",
              "try /vault in your browser.",
              "",
              "— T",
            ].join("\n"),
          },
        ],
      };
    }
    if (file === ".hidden") {
      return {
        output: [{ type: "text", content: "You found a file, but it's empty. Or is it?" }],
      };
    }
    return {
      output: [{ type: "error", content: `cat: ${args[0] ?? ""}: No such file or directory` }],
    };
  },
};

// ─── Command registries ───────────────────────────────────────────────

const MAIN_COMMANDS: Command[] = [
  helpCommand,
  aboutCommand,
  skillsCommand,
  projectsCommand,
  neofetchCommand,
  matrixCommand,
  cowsayCommand,
  fortuneCommand,
  clearCommand,
  sudoCommand,
  vaporwaveCommand,
];

const RETRO_COMMANDS: Command[] = [
  { ...helpCommand },
  whoisCommand,
  lsCommand,
  catCommand,
  fortuneCommand,
  clearCommand,
];

const mainMap = new Map<string, Command>();
for (const cmd of MAIN_COMMANDS) {
  mainMap.set(cmd.name, cmd);
  cmd.aliases?.forEach((a) => mainMap.set(a, cmd));
}

const retroMap = new Map<string, Command>();
for (const cmd of RETRO_COMMANDS) {
  retroMap.set(cmd.name, cmd);
  cmd.aliases?.forEach((a) => retroMap.set(a, cmd));
}

export function getCommand(
  name: string,
  theme: "main" | "retro"
): Command | undefined {
  const map = theme === "retro" ? retroMap : mainMap;
  return map.get(name);
}

export function getCommandsForTheme(theme: "main" | "retro"): Command[] {
  return theme === "retro" ? RETRO_COMMANDS : MAIN_COMMANDS;
}

export function getCommandNames(theme: "main" | "retro"): string[] {
  const commands = getCommandsForTheme(theme);
  return commands.filter((c) => !c.hidden).map((c) => c.name);
}

export function executeCommand(
  name: string,
  args: string[],
  ctx: CommandContext
): CommandResult {
  const cmd = getCommand(name, ctx.theme);
  if (!cmd) {
    return {
      output: [
        {
          type: "error",
          content: `Command not found: ${name}. Type 'help' for available commands.`,
        },
      ],
    };
  }
  return cmd.execute(args, ctx);
}
