import * as THREE from "three";
import { getPortraitMeta } from "./portraitInfo";

const portraitUrlCache = new Map<string, string>();
const portraitTextureCache = new Map<string, THREE.Texture>();

export function buildPortraitDataUrl(conceptId: string, title: string, accent: string): string {
  const key = `${conceptId}:${accent}:${title}`;
  const cached = portraitUrlCache.get(key);
  if (cached) return cached;
  const { glyph } = getPortraitMeta(conceptId, title);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 512, 640);
  grad.addColorStop(0, accent);
  grad.addColorStop(0.55, "#FFFFFF");
  grad.addColorStop(1, shade(accent, -30));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 640);

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.arc(420, 120, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "180px system-ui, Apple Color Emoji, Segoe UI Emoji";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, 256, 260);

  ctx.fillStyle = "#1e1b4b";
  ctx.font = "bold 42px Georgia, serif";
  wrapText(ctx, title, 256, 480, 440, 48);

  ctx.strokeStyle = "#FDE047";
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, 464, 592);

  const url = canvas.toDataURL("image/png");
  portraitUrlCache.set(key, url);
  return url;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, x, startY + i * lineHeight));
}

function shade(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount / 100);
  return `#${c.getHexString()}`;
}

export function createPortraitTexture(conceptId: string, title: string, accent: string) {
  const key = `${conceptId}:${accent}:${title}`;
  const existing = portraitTextureCache.get(key);
  if (existing) return existing;

  const url = buildPortraitDataUrl(conceptId, title, accent);
  const tex = new THREE.TextureLoader().load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  portraitTextureCache.set(key, tex);
  return tex;
}
