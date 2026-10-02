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
export const alt = "Pixie Dust Industries, Product OS: everything but the deciding";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The ink set, restated as literals because Satori resolves no CSS variables. If these ever
   disagree with brand/tokens/brand.tokens.json, the tokens are right and this is stale. */
const STOCK = "#E4E2DB";
const INK = "#231F20";
const MUTED = "#65606A";
const PINK = "#F8B6BA"; // Corinthian Pink, the tint: a ground, never a line here
const YELLOW = "#FDBF68"; // Cream Yellow, the gate
const RULE = "#C4C0B7";
const RULE2 = "#A8A39A";
const SHEET = "#EFEDE7";

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
 * It was found on Space Grotesk and is kept through every face since, each of which has
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
  // and is set in the serif, the numbers along the foot are machine output and are set in
  // the mono. The same two the site uses, so the card and the page are one thing.
  const [display, mono] = await Promise.all([
    googleFont("Newsreader", 400),
    googleFont("Geist Mono", 500),
  ]);

  const fonts = [
    display && { name: "Newsreader", data: display, weight: 400 as const, style: "normal" as const },
    mono && { name: "Geist Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const MONO = fonts.length > 1 ? "Geist Mono" : "monospace";

  // The fold: one corner of the sheet turned over, drawn as two triangles because Satori
  // draws no <path>. The same dog-ear every surface on the site carries.
  const FOLD = 64;
  const FOLD_SVG =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
        `<path d="M0 0H64V64Z" fill="${STOCK}"/>` +
        `<path d="M0 0V64H64Z" fill="${PINK}"/>` +
        `<path d="M0 0L64 64" stroke="${RULE2}" stroke-width="1"/>` +
      `</svg>`,
    );

  const facts = [
    [String(os.totals.skills), "specialists"],
    [String(os.map.columns.length), "lifecycle stages"],
    [String(os.map.flows.length), "end-to-end paths"],
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
          padding: "70px 74px",
          fontFamily: fonts.length ? "Newsreader" : "serif",
        }}
      >
        {/* The lifted sheet behind everything, with its corner folded. Satori draws no
            <path> and no CSS triangles, so the fold arrives as an inline SVG, the same way
            the mark does. */}
        <div style={{ position: "absolute", inset: 28, background: SHEET, border: `1px solid ${RULE2}`, borderRadius: 22, display: "flex" }} />
        <img width={FOLD} height={FOLD} src={FOLD_SVG} alt="" style={{ position: "absolute", top: 28, right: 28 }} />
        {/* The lockup. Satori draws no <path>, so the mark arrives as an inline SVG data URI
            rather than as elements: same geometry as brand/assets/mark.svg, nothing else. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img width={28} height={28} src={MARK} alt="" />
          <div style={{ fontSize: 26, color: INK, letterSpacing: "0.005em" }}>
            Pixie Dust Industries
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Broken by hand, one line per box: left to wrap on its own the headline breaks
              wherever the container happens to end. */}
          {["Everything but", "the deciding."].map((line) => (
            <div
              key={line}
              style={{
                fontSize: 74,
                color: INK,
                lineHeight: 1.04,
                letterSpacing: "-0.015em",
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
          <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 15, letterSpacing: "0.08em", color: INK, background: PINK, padding: "7px 12px", borderRadius: 6 }}>
            PRODUCT OS
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
