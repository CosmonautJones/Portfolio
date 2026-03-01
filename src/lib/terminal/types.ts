export type OutputLineType = "text" | "ascii" | "error" | "system" | "clear";

export interface OutputLine {
  type: OutputLineType;
  content: string;
}

export interface CommandResult {
  output: OutputLine[];
  clear?: boolean;
}

export interface CommandContext {
  theme: "main" | "retro";
  level?: number;
  title?: string;
  onDiscover?: (eggId: string) => void;
}

export type CommandFn = (args: string[], ctx: CommandContext) => CommandResult;

export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  hidden?: boolean;
  execute: CommandFn;
}
