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
export const alt = "Pixie Dust Industries, Product OS: the product process, written down and running";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The ink set, restated as literals because Satori resolves no CSS variables. If these ever
   disagree with brand/tokens/brand.tokens.json, the tokens are right and this is stale. */
const STOCK = "#E4E2DB";
const INK = "#231F20";
const MUTED = "#65606A";
const PINK = "#FF48B0";
const YELLOW = "#FFE800";
const RULE = "#C4C0B7";

/**
 * The Gate, as a data URI. Satori renders no <path>, so the mark cannot be drawn as elements
 * here; an inline SVG in an <img> is the one form it accepts. Geometry identical to
 * brand/assets/mark.svg, and if the two ever disagree that file is right and this is stale.
 */
const MARK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      `<path d="M26.76 13.713A11 11 0 1 1 18.287 5.24" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="23.778" cy="8.222" r="3" fill="${YELLOW}"/>` +
    "</svg>",
  );

/**
 * Blocks the `tt` ligature.
 *
 * The image renderer mis-measures that ligature and leaves the surplus as trailing advance,
 * so "written down" came out with a visible hole in it while the identical string was
 * perfect in the browser. A zero-width non-joiner between the two letters stops the
 * ligature forming, and the spacing is correct again; the glyphs are indistinguishable at
 * card size. Confirmed against `written`, `kitten`, `button` and `letter`, all of which had
 * it and none of which do now.
 *
 * It was found on Space Grotesk and is kept through the move to Instrument Serif, which has
 * its own `tt`. Only `tt`: inserting joiners into pairs that are not broken would disable
 * typography that is doing its job. If a new headline word looks wrongly spaced, measure it
 * before adding it here.
 */
const unligature = (s: string) => s.replaceAll("tt", "t\u200Ct");

/**
 * A Google font, if Google will hand it over at build time. The card is worth the requests,
 * the headline being the whole card, but it is not worth failing a deploy over, so a refusal
 * falls back to the renderer's default and the build carries on.
 */
async function googleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}:wght@${weight}`,
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
  // Two families, because the card is the brand in miniature: the headline is the argument
  // and is set in Syne, the numbers along the foot are machine output and are set in DM Mono.
  const [display, mono] = await Promise.all([
    googleFont("Syne", 800),
    googleFont("DM Mono", 500),
  ]);

  const fonts = [
    display && { name: "Syne", data: display, weight: 800 as const, style: "normal" as const },
    mono && { name: "DM Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const MONO = fonts.length > 1 ? "DM Mono" : "monospace";

  /**
   * A halftone screen, drawn dot by dot.
   *
   * Satori resolves no CSS masks, blend modes or repeating background images, so the screen
   * the site draws in three lines of CSS has to be laid out here as individual elements.
   * A regular grid at a fixed pitch with the dot radius falling off from the top right is
   * exactly what a Riso does to a gradient, and it is the one part of the press language
   * this renderer can honestly reproduce.
   *
   * It replaces a random star field, which was the dark card's atmosphere and reads on a
   * printed sheet as dirt rather than ink.
   */
  const PITCH = 22;
  const dots: { left: number; top: number; r: number }[] = [];
  for (let x = 0; x <= 1200 + PITCH; x += PITCH) {
    for (let y = 0; y <= 630 + PITCH; y += PITCH) {
      // Distance from the top-right corner, normalised, then eased so the screen opens up
      // rather than fading linearly — a dot either prints or it does not.
      const d = Math.hypot((1200 - x) / 1200, y / 630) / 1.35;
      const r = (1 - Math.min(1, d)) ** 1.7 * (PITCH * 0.44);
      if (r > 0.55) dots.push({ left: x, top: y, r });
    }
  }

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
          background: STOCK,
          // Two ink washes standing in for the halftone plate the page carries. Satori draws
          // no CSS masks or blend modes, so the screen itself cannot be reproduced here; a
          // soft pass of each drum is the honest approximation rather than a fake screen.
          backgroundImage:
            "radial-gradient(700px 520px at 97% 88%, rgba(61,85,136,0.24), transparent 62%)",
          padding: "70px 74px",
          fontFamily: fonts.length ? "Syne" : "sans-serif",
        }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.left - d.r,
              top: d.top - d.r,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: d.r * 2,
              background: PINK,
              opacity: 0.55,
            }}
          />
        ))}

        {/* The lockup. Satori draws no <path>, so the mark arrives as an inline SVG data URI
            rather than as elements: same geometry as brand/assets/mark.svg, nothing else. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img width={28} height={28} src={MARK} alt="" />
          <div style={{ fontSize: 23, color: INK, letterSpacing: "-0.03em", textTransform: "uppercase" }}>
            Pixie Dust Industries
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Broken by hand, one line per box: left to wrap on its own the headline breaks
              wherever the container happens to end. */}
          {["The product process,", "written down and running."].map((line) => (
            <div
              key={line}
              style={{
                fontSize: 72,
                color: INK,
                lineHeight: 0.98,
                letterSpacing: "-0.028em",
              }}
            >
              {unligature(line)}
            </div>
          ))}
          <div style={{ fontSize: 28, color: MUTED, marginTop: 28, maxWidth: 820, lineHeight: 1.4 }}>
            Not a diagram of how we intend to work. The thing itself.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {facts.map(([n, label], i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              {i > 0 && <div style={{ width: 1, height: 22, background: RULE }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <div style={{ fontFamily: MONO, fontSize: 23, color: INK }}>{n}</div>
                <div style={{ fontFamily: MONO, fontSize: 17, color: MUTED }}>{label}</div>
              </div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 16, color: INK, background: PINK, padding: "5px 10px" }}>
            oolio-product-os.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
