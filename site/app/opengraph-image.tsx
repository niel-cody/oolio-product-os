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

/* Brand tokens, restated as literals because Satori resolves no CSS variables. If these ever
   disagree with brand/tokens/brand.tokens.json, the tokens are right and this is stale. */
const VOID = "#03070f";
const INK = "#ecf0f7";
const MUTED = "#808fa4";
const GATE = "#fcbd30";
const LINE = "#1f2a3a";

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
      `<circle cx="23.778" cy="8.222" r="3" fill="${GATE}"/>` +
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
  // and is set in the serif, the numbers along the foot are machine output and are set in the
  // mono. Instrument Serif has one weight, so there is nothing to request but 400.
  const [serif, mono] = await Promise.all([
    googleFont("Instrument Serif", 400),
    googleFont("JetBrains Mono", 500),
  ]);

  const fonts = [
    serif && { name: "Instrument Serif", data: serif, weight: 400 as const, style: "normal" as const },
    mono && { name: "JetBrains Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const MONO = fonts.length > 1 ? "JetBrains Mono" : "monospace";

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
          background: VOID,
          // One warm wash from the top left, where the mark is, and one cool one opposite to
          // stop the card going flat. Amber leads because on this brand it is the thing that
          // matters; the old card led with teal and violet, which is every other card.
          backgroundImage:
            "radial-gradient(900px 620px at 12% 8%, rgba(252,189,48,0.13), transparent 60%), " +
            "radial-gradient(820px 560px at 88% 92%, rgba(68,208,222,0.10), transparent 58%)",
          padding: "72px 76px",
          fontFamily: fonts.length ? "Instrument Serif" : "serif",
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
              background: "#a3b0c2",
              opacity: s.dim,
            }}
          />
        ))}

        {/* The lockup. Satori draws no <path>, so the mark arrives as an inline SVG data URI
            rather than as elements: same geometry as brand/assets/mark.svg, nothing else. */}
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <img width={30} height={30} src={MARK} alt="" />
          <div style={{ fontSize: 27, color: INK, letterSpacing: "-0.012em" }}>
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
                fontSize: 82,
                color: INK,
                lineHeight: 1.08,
                letterSpacing: "-0.022em",
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
              {i > 0 && <div style={{ width: 1, height: 22, background: LINE }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <div style={{ fontFamily: MONO, fontSize: 23, color: INK }}>{n}</div>
                <div style={{ fontFamily: MONO, fontSize: 17, color: MUTED }}>{label}</div>
              </div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 17, color: GATE }}>
            oolio-product-os.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
