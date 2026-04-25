/**
 * Yields chunks one at a time so we never hold all chunks in memory.
 */
export function* chunkText(
  text: string,
  size = 5000,
): Generator<{ sequence: number; content: string }> {
  if (!text) return;

  const trimmed = text.trim();
  if (!trimmed) return;

  if (trimmed.length <= size) {
    yield { sequence: 0, content: trimmed };
    return;
  }

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
      yield { sequence, content: chunk };
      sequence++;
    }

    start = end;
    if (start >= trimmed.length) break;
  }
}
