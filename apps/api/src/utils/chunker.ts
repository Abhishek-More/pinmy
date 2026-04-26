export function chunkText(
  text: string,
  size = 5000,
): { sequence: number; content: string }[] {
  const trimmed = text?.trim();
  if (!trimmed) return [];

  if (trimmed.length <= size) {
    return [{ sequence: 0, content: trimmed }];
  }

  const chunks: { sequence: number; content: string }[] = [];
  let start = 0;
  let sequence = 0;

  while (start < trimmed.length) {
    let end = Math.min(start + size, trimmed.length);

    // Try to break on a sentence boundary within the last 20% of the chunk
    if (end < trimmed.length) {
      const searchStart = Math.floor(end - size * 0.2);
      const segment = trimmed.slice(searchStart, end);
      const sentenceEnd = segment.search(/[.!?]\s/);
      if (sentenceEnd !== -1) {
        end = searchStart + sentenceEnd + 2;
      }
    }

    const chunk = trimmed.slice(start, end).trim();
    if (chunk) {
      chunks.push({ sequence, content: chunk });
      sequence++;
    }

    start = end;
  }

  return chunks;
}
