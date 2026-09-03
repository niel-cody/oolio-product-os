/**
 * The Gate.
 *
 * A ring with a break in it, and a bead standing in the break. The ring is the loop; the break
 * is where it does not close on its own; the bead is the person who closes it. The whole
 * identity is that one sentence: brand/identity.md.
 *
 * Geometry is fixed and not to be nudged. On a 32 grid: r=11, stroke 3, the ring drawn from
 * -12 degrees clockwise through 294 degrees, the break 66 degrees wide centred on -45, and the
 * bead r=3 sitting on the ring's own path at -45. The round caps eat about 8 degrees at each
 * end, which is why the break is specified wider than it looks.
 *
 * Re-inked for the press: the ring is the black drum, the bead is Sun Yellow. The bead keeps
 * its meaning through the change of palette because Sun Yellow is the human-gate drum — the
 * third and smallest ink, reserved for "a person decides here".
 *
 * Inline rather than an <img> so the ring can take currentColor and the bead can be dimmed
 * with the rest of a disabled control. The file at brand/assets/mark.svg is the same drawing
 * for everywhere that is not React.
 */
export function GateMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M26.76 13.713A11 11 0 1 1 18.287 5.24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={23.778} cy={8.222} r={3} fill="var(--yellow)" />
    </svg>
  );
}
