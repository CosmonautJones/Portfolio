export function complete(
  partial: string,
  commandNames: string[]
): { completed: string | null; suggestions: string[] } {
  if (!partial) return { completed: null, suggestions: [] };

  const lower = partial.toLowerCase();
  const matches = commandNames.filter((name) => name.startsWith(lower));

  if (matches.length === 0) return { completed: null, suggestions: [] };
  if (matches.length === 1) return { completed: matches[0], suggestions: [] };

  return { completed: null, suggestions: matches };
}
