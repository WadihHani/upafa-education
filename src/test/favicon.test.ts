/**
 * Automated favicon regression check.
 *
 * Real browser tabs render the favicon in the chrome (outside the DOM), so we
 * cannot screenshot the actual tab icon from a headless browser. Instead we
 * verify the *bytes* the browser would receive for desktop, Android Chrome
 * (manifest icons), and iOS Safari (apple-touch-icon) and assert each one is
 * perceptually derived from the university logo, not from a stale default
 * (e.g. the Lovable heart that previously slipped through).
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PNG } from "pngjs";

const root = resolve(__dirname, "../..");
const SOURCE_LOGO = resolve(root, "src/assets/logo.png");

// Each entry maps to the file the browser/OS will actually fetch.
const TARGETS: { label: string; path: string; consumer: string }[] = [
  { label: "favicon.png (desktop tab)", path: "public/favicon.png", consumer: "Desktop browsers" },
  { label: "apple-touch-icon.png", path: "public/apple-touch-icon.png", consumer: "iOS Safari" },
  { label: "icon-192.png", path: "public/icon-192.png", consumer: "Android Chrome (manifest)" },
  { label: "icon-512.png", path: "public/icon-512.png", consumer: "Android Chrome (PWA install)" },
];

function decode(filePath: string): PNG {
  const buf = readFileSync(filePath);
  return PNG.sync.read(buf);
}

/** 8x8 average-hash (aHash) — robust to scale, sensitive to silhouette. */
function aHash(png: PNG): bigint {
  const N = 8;
  const { width: w, height: h, data } = png;
  const samples: number[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const sx = Math.floor(((x + 0.5) / N) * w);
      const sy = Math.floor(((y + 0.5) / N) * h);
      const i = (sy * w + sx) * 4;
      const a = data[i + 3] / 255;
      // Composite over white so transparent backgrounds match a flat white icon.
      const r = data[i] * a + 255 * (1 - a);
      const g = data[i + 1] * a + 255 * (1 - a);
      const b = data[i + 2] * a + 255 * (1 - a);
      samples.push(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }
  const avg = samples.reduce((s, v) => s + v, 0) / samples.length;
  let hash = 0n;
  for (let i = 0; i < samples.length; i++) {
    if (samples[i] >= avg) hash |= 1n << BigInt(i);
  }
  return hash;
}

function hamming(a: bigint, b: bigint): number {
  let x = a ^ b;
  let count = 0;
  while (x) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

// Hash of the previously-shipped Lovable heart favicon (orange/blue blob).
// Hardcoded so the test fails loudly if that asset ever returns.
const LOVABLE_HEART_HASH = 0x00183c7e7e3c1800n;

describe("favicon assets render the university logo", () => {
  it("source logo exists", () => {
    expect(existsSync(SOURCE_LOGO), "src/assets/logo.png missing").toBe(true);
  });

  const sourceHash = aHash(decode(SOURCE_LOGO));

  it.each(TARGETS)("$consumer serves the logo via $label", ({ path }) => {
    const full = resolve(root, path);
    expect(existsSync(full), `${path} missing`).toBe(true);

    const png = decode(full);
    const hash = aHash(png);

    const distToLogo = hamming(hash, sourceHash);
    const distToHeart = hamming(hash, LOVABLE_HEART_HASH);

    // Closer to the university logo than to the Lovable heart, with an
    // absolute ceiling so a totally unrelated image also fails.
    expect(distToLogo, `silhouette diverges from logo (distance ${distToLogo})`).toBeLessThanOrEqual(18);
    expect(distToHeart, "icon still matches the old Lovable heart").toBeGreaterThan(distToLogo);
  });

  it("icon dimensions match what each platform requests", () => {
    const expected: Record<string, number> = {
      "public/favicon.png": 64,
      "public/apple-touch-icon.png": 180,
      "public/icon-192.png": 192,
      "public/icon-512.png": 512,
    };
    for (const [p, size] of Object.entries(expected)) {
      const png = decode(resolve(root, p));
      expect(png.width, `${p} width`).toBe(size);
      expect(png.height, `${p} height`).toBe(size);
    }
  });
});
