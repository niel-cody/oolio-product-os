# Motion

The site already holds itself to a strict motion standard and this does not loosen it. What the
brand adds is one signature animation and the rule that it is the only one with meaning.

## The rules

- **Transform and opacity only.** Nothing animates a layout property.
- **Two curves, both strong.** `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` for entering and
  exiting, where the first frame is the one being watched. `--ease-in-out`
  `cubic-bezier(0.77, 0, 0.175, 1)` for movement across the screen. The built-in easings are
  too weak to read as deliberate: `ease-out` at 200ms still looks like nothing decided it.
- **There is no `ease-in`.** It delays the moment being watched most, which is what makes an
  interface feel sluggish at an identical duration.
- **Asymmetric timing.** A deliberate reveal staggers in. A reset snaps back.
- **Transitions rather than keyframes** wherever a thing can be re-triggered, so a second click
  retargets from where the first one got to instead of restarting.
- **Hover motion only behind a real pointer.**
- **Every animation has a reduced-motion path.** Not "it runs anyway, faster".

## Durations

| Token | Value | For |
|---|---|---|
| `--dur-press` | 160ms | The press confirmation on anything pressable |
| `--dur-state` | 180ms | A colour or border changing state |
| `--dur-reveal` | 520ms | Something entering on scroll |
| `--dur-trace` | 2400ms | The slow trace behind the headline |
| `--dur-loop` | 1600ms | One turn of the bead around the ring |

Stagger is 60ms a step and no more than a handful of steps. A long cascade stops reading as
craft and starts reading as a wait.

## The signature: the bead runs the ring

[`assets/mark-loop.svg`](assets/mark-loop.svg). The bead leaves the break, travels the ring
once in 1600ms, and returns to the break.

It means **work is running**, and that is the only thing it is allowed to mean. Loading a
skill's output, a long tool call, a build. It is not a page decoration, not a hover reward, and
not a header ornament. The moment it runs while nothing is happening it stops being information.

At rest the bead sits in the break. The resting frame is the mark, so a viewer with reduced
motion on gets the logo rather than a missing element, which is why the reduced-motion path
holds it still rather than hiding it.

## Reduced motion

`prefers-reduced-motion: reduce` is a request to be spared movement, not a request for faster
movement. Under it:

- Scroll reveals resolve to their final state with no transform.
- The bead holds at the break.
- The smooth scroll on in-page anchors is off. A forced smooth scroll is one of the exact
  motions that setting is asking to be spared.
- Press feedback is removed rather than shortened.
