export function stripHtmlToText(html: unknown): string | null {
  if (typeof html !== "string") return null;
  const noTags = html.replace(/<[^>]*>/g, " ");
  const collapsed = noTags.replace(/\s+/g, " ").trim();
  return collapsed.length > 0 ? collapsed : null;
}
