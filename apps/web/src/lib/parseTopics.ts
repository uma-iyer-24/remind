/** One non-empty line is one topic. Bullets and numbering are stripped. Commas stay inside the topic. */

const LIST_MARKER = /^(?:\d+|[a-zA-Z])[\.\)\:]\s+|^(?:[-*•–—])\s+/;

export function normalizeTopicLine(line: string): string {
  let text = line.trim();
  for (let i = 0; i < 3 && LIST_MARKER.test(text); i++) {
    text = text.replace(LIST_MARKER, "").trim();
  }
  return text.replace(/\s+/g, " ");
}

export function parseTopicLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map(normalizeTopicLine)
    .filter((line) => line.length > 0);
}
