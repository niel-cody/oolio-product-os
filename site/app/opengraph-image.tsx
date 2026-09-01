import { ImageResponse } from "next/og";
import os from "@/data/os.json";

/**
 * The link preview card.
 *
 * This is the first thing most people will ever see of the Product OS, because the way an
 * internal tool actually spreads is somebody pasting the URL into a Slack channel. Until
 * now that unfurled as a bare title and a sentence, which is a wasted first impression on
 * the exact surface the onboarding push depends on.
 *
 * Generated rather than drawn, so the counts on it cannot drift from the ones on the page.
 *
 * Public by definition — it is served to any crawler that asks — so it carries nothing but
 * the wordmark, the headline and three numbers. No skill names, no stages, nothing that
 * lib/landing-sky.ts would not already hand the page.
 */
export const alt = "Oolio Product OS — the product process, written down and running";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#070b11";
const INK = "#e6ecf5";
const MUTED = "#7d8aa0";
const ORCH = "#2dd4bf";

/**
 * Blocks Space Grotesk's `tt` ligature.
 *
 * The image renderer mis-measures that ligature and leaves the surplus as trailing advance,
 * so "written down" came out with a visible hole in it while the identical string was
 * perfect in the browser. A zero-width non-joiner between the two letters stops the
 * ligature forming, and the spacing is correct again; the glyphs are indistinguishable at
 * card size. Confirmed against `written`, `kitten`, `button` and `letter`, all of which had
 * it and none of which do now.
 *
 * Only `tt`. The font's other ligatures measure correctly, and inserting joiners into pairs
 * that are not broken would disable typography that is doing its job. If a new headline
 * word looks wrongly spaced, measure it before adding it here.
 */
const unligature = (s: string) => s.replaceAll("tt", "t\u200Ct");

/** Deterministic 0..1, so the star field is identical on every build. */
function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Space Grotesk, if Google will hand it over at build time. The card is worth the two
 * requests — the headline is the whole card — but it is not worth failing a deploy over, so
 * a refusal falls back to the default sans and the build carries on.
 */
async function spaceGrotesk(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const [bold, regular] = await Promise.all([spaceGrotesk(700), spaceGrotesk(400)]);

  const fonts = [
    bold && { name: "Space Grotesk", data: bold, weight: 700 as const, style: "normal" as const },
    regular && { name: "Space Grotesk", data: regular, weight: 400 as const, style: "normal" as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const stars = Array.from({ length: 46 }, (_, i) => ({
    left: hash01(`x${i}`, 11) * 1200,
    top: hash01(`y${i}`, 17) * 630,
    size: 2 + hash01(`r${i}`, 29) * 2.5,
    dim: 0.22 + hash01(`o${i}`, 31) * 0.34,
  }));

  const facts = [
    [String(os.totals.skills), "skills"],
    [String(os.map.columns.length), "lifecycle stages"],
    [String(os.map.flows.length), "end-to-end flows"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          backgroundImage:
            "radial-gradient(900px 620px at 12% 8%, rgba(45,212,191,0.14), transparent 60%), " +
            "radial-gradient(820px 560px at 88% 92%, rgba(167,139,250,0.16), transparent 58%)",
          padding: "72px 76px",
          fontFamily: fonts.length ? "Space Grotesk" : "sans-serif",
        }}
      >
        {stars.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: s.size,
              background: "#9fb0c9",
              opacity: s.dim,
            }}
          />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: ORCH }} />
          <div style={{ fontSize: 21, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>
            Oolio Product OS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Broken by hand, one line per box: left to wrap on its own the headline breaks
              wherever the container happens to end. */}
          {["The product process,", "written down and running."].map((line) => (
            <div
              key={line}
              style={{
                fontSize: 74,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.14,
                letterSpacing: "-0.03em",
              }}
            >
              {unligature(line)}
            </div>
          ))}
          <div style={{ fontSize: 27, color: MUTED, marginTop: 26, maxWidth: 800, lineHeight: 1.4 }}>
            Not a diagram of how we intend to work. The thing itself.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {facts.map(([n, label], i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              {i > 0 && <div style={{ width: 1, height: 22, background: "#1c2534" }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <div style={{ fontSize: 25, fontWeight: 700, color: INK }}>{n}</div>
                <div style={{ fontSize: 19, color: MUTED }}>{label}</div>
              </div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 19, color: ORCH }}>
            oolio-product-os.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
