import JSZip from "jszip";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/** Pull readable lines out of a PDF, Word, or PowerPoint file. The create page still treats each line as one topic. */
export async function extractDocumentText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  if (name.endsWith(".pptx")) return extractPptx(file);
  if (name.endsWith(".ppt") || name.endsWith(".doc")) {
    throw new Error("Save it as .docx or .pptx. Older Word and PowerPoint files cannot be read here.");
  }
  throw new Error("Use a PDF, Word (.docx), or PowerPoint (.pptx) file.");
}

async function extractPdf(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(linesFromPdfItems(content.items));
  }
  return pages.filter(Boolean).join("\n");
}

function linesFromPdfItems(items: unknown[]): string {
  const rows = new Map<number, { x: number; text: string }[]>();
  for (const item of items) {
    if (!item || typeof item !== "object" || !("str" in item) || !("transform" in item)) continue;
    const text = String((item as { str: string }).str);
    if (!text.trim()) continue;
    const transform = (item as { transform: number[] }).transform;
    const y = Math.round(transform[5] ?? 0);
    const x = transform[4] ?? 0;
    const bucket = rows.get(y) ?? [];
    bucket.push({ x, text });
    rows.set(y, bucket);
  }
  return [...rows.keys()]
    .sort((a, b) => b - a)
    .map((y) =>
      (rows.get(y) ?? [])
        .sort((a, b) => a.x - b.x)
        .map((part) => part.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .join("\n");
}

async function extractDocx(file: File): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value.replace(/\r\n/g, "\n").trim();
}

async function extractPptx(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const names = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => slideNumber(a) - slideNumber(b));
  if (names.length === 0) throw new Error("That PowerPoint file has no readable slides.");
  const lines: string[] = [];
  for (const name of names) {
    const xml = await zip.files[name]!.async("string");
    lines.push(...linesFromSlideXml(xml));
  }
  return lines.join("\n");
}

function slideNumber(path: string): number {
  const match = path.match(/slide(\d+)\.xml/i);
  return match ? Number(match[1]) : 0;
}

function linesFromSlideXml(xml: string): string[] {
  const paragraphs = xml.split(/<a:p[\s>/]/).slice(1);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const body = paragraph.split("</a:p>")[0] ?? "";
    const text = [...body.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)]
      .map((match) => decodeXml(match[1] ?? ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (text) lines.push(text);
  }
  return lines;
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
