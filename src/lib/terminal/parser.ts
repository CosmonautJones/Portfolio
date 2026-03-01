export function parseInput(raw: string): { command: string; args: string[] } {
  const trimmed = raw.trim();
  if (!trimmed) return { command: "", args: [] };

  const tokens: string[] = [];
  let current = "";
  let inQuote: string | null = null;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = char;
    } else if (char === " ") {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) tokens.push(current);

  return {
    command: tokens[0]?.toLowerCase() ?? "",
    args: tokens.slice(1),
  };
}
