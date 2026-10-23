---
name: GX1
description: A pocket gimbal camera's launch page, built as the camera's own live viewfinder.
colors:
  ink: "#0b0b0b"
  hud: "#f5f5f0"
  hud-dim: "rgb(245 245 240 / 0.68)"
  hud-faint: "rgb(245 245 240 / 0.32)"
  rec: "#ff2d2d"
  focus: "#ffd400"
  panel: "rgb(11 11 11 / 0.72)"
typography:
  display:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "clamp(3.75rem, 9vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "normal"
  title:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.05em"
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "32px"
  gutter-desktop: "8%"
  take-top: "112px"
  panel-top: "128px"
components:
  button-shutter:
    textColor: "{colors.hud}"
    typography: "{typography.title}"
    rounded: "{rounded.full}"
    padding: "4px 24px 4px 4px"
  button-reserve:
    backgroundColor: "{colors.rec}"
    textColor: "{colors.hud}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  button-hud-pill:
    backgroundColor: "{colors.hud}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  button-hud-pill-hover:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.ink}"
  toggle-off:
    textColor: "{colors.hud}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  toggle-on:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  caption-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.hud}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  hud-slate:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.hud-dim}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  menu-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.hud}"
    rounded: "{rounded.md}"
    padding: "48px"
  input-email:
    textColor: "{colors.hud}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    height: "56px"
    padding: "0 160px 0 24px"
---

# Design System: GX1

## Overview

**Creative North Star: "The Live Viewfinder"**

The page is the camera's own screen, and every scroll is a take. Each section is daylight footage running edge to edge, with a thin white HUD laid over it: a recording line at the top, a clip slate in the corner, readouts along the bottom edge, and focus brackets around whatever matters. The interface doesn't sit next to the footage. It sits on it, the way a camera's overlay does.

The system is sparse and functional. It has one off-white for the HUD, one red that means recording and the primary action, and one yellow that means focus. Barlow Condensed caps carry the HUD and the headlines, Barlow carries reading text, and Geist Mono is kept for timecode and measurements. Depth comes from local scrims and translucent ink chips, never from lit surfaces. The only flat ink plane is the camera-menu panel, which appears where the visitor reads or chooses: specs, configurator, and credits. The page deliberately avoids the category's usual floating product render on black.

**Key Characteristics:**
- Full-bleed photographic takes (`min-height: 100svh`), each with a clip slate and timecode.
- **Moving footage** (`FootageVideo`): where a take's point is motion (the hero and the stabilizer), a muted loop plays over a `next/image` poster. The poster is the content and the LCP. The file is chosen on mount (a phone size under 768px and a desktop size otherwise, both encoded from 4K masters), it plays only while on screen, and it never loads under reduced motion. Every looping video has a `VideoToggle` pause control (WCAG 2.2.2) outside any transformed frame. Bright footage behind the hero headline gets the stronger `hero` scrim.
- A thin off-white HUD over footage, set in condensed tracked caps.
- Red for recording and the primary action, and yellow for focus. Each color has one meaning.
- Legibility comes from local scrims and ink caption chips, never from darkening the whole frame.
- Focus brackets and a level line are the signature marks.
- No glows, no gradient text, and every motion has a reduced-motion path.

## Colors

The palette is restrained: footage provides the color, and the UI adds an off-white HUD, two signal colors and ink.

### Primary
- **REC Red** (rec): Used for recording state and the primary action only: the blinking REC dot and label in the HUD, the shutter disc on the hero's Configure button, the Reserve button, and an invalid field's border. It is never decoration.

### Secondary
- **Focus Yellow** (focus): Marks whatever is in focus: focus brackets, the centre tick of the level line, the compare slider line, the selected finish ring and kit dot, the active spec row's caret, `:focus-visible` outlines, text selection, the input caret, the stabilizer's "on" state, the Commentary toggle's "on" state, and file paths in the credits. It also fills the hero's audio meter bars.

### Neutral
- **HUD White** (hud): Primary text and HUD strokes over footage and ink, including the level line, ticks, and the battery glyph.
- **HUD Dim** (hud-dim): Secondary text such as nav items at rest, slate text, spec labels, legends, and credit details.
- **HUD Faint** (hud-faint): Hairlines and the scrollbar thumb. Dividers inside panels use HUD White at 15% opacity.
- **Ink** (ink): The page ground, the camera-menu panels (at 80% opacity over footage, and solid behind the credits), and the dark side of every scrim.
- **Panel** (panel): The translucent ink used for slates and caption chips. In use it ranges from 55% to 80% opacity, always with a backdrop blur.

### Named Rules
**The One Meaning Rule.** Red means recording or "do it now". Yellow means "this is in focus or selected". Neither color is ever used as plain decoration, and they never swap roles.

**The Ink Is the Menu Rule.** A solid or near-solid ink plane (`bg-ink/80` and above, `rounded-md`) appears only where the camera's menu would: specs, the configurator, and the end credits. Everything else floats over footage.

## Typography

**Display Font:** Barlow Condensed (500, 600, 700), with system-ui as the fallback
**Body Font:** Barlow (400, 500, 600), with system-ui as the fallback
**Label/Mono Font:** Geist Mono, for timecode and measurements only

**Character:** Condensed uppercase reads like a camera's on-screen menu, dense and engineered. Barlow at normal width keeps the reading text human. The mono face appears only where a real camera would show numbers.

### Hierarchy
- **Display** (700, `clamp(3.75rem, 9vw, 6rem)`, line-height 0.88, uppercase): Used once, for the hero headline inside focus brackets.
- **Headline** (700, `clamp(2.75rem, 6vw, 5rem)`, line-height 0.9, uppercase): Section headlines for each take. The credits headline is a step smaller (`clamp(2.25rem, 4.5vw, 3.75rem)`).
- **Title** (600, 1.125 to 1.5rem, tracking 0.1 to 0.14em, uppercase): Spec labels, kit names, credit roles, the Configure GX1 button, and Note titles.
- **Body** (400, 1.125rem, line-height 1.625, max about 28rem): Reading text over footage, usually set in a caption chip.
- **Label** (600, 15px, tracking 0.12em, uppercase): HUD bar items, nav links, and toggle text. Fieldset legends use 0.875rem with 0.2em tracking.
- **Mono** (400, 11px, tracking 0.05 to 0.2em, uppercase, tabular numerals): Timecode, clip slates, exposure readouts, Roll readout, prices, spec values, and file paths.

### Named Rules
**The Mono Is Measurement Rule.** Geist Mono is used only for numbers a camera would display (timecode, exposure, degrees, prices, spec values) and for code file paths. It is never used for prose or headings.

**The Caps Are HUD Rule.** Anything that belongs to the camera interface is set in Barlow Condensed uppercase with positive tracking. Reading text stays in sentence case Barlow.

## Layout

Every section is a **take**: a full-bleed `<section>` at least `100svh` tall, with footage filling it absolutely (`object-cover`) and content layered on top. Horizontal gutters follow one rhythm at every level: 16px on mobile, 32px from `sm`, and 8% of the frame from `lg`. Take content starts 112px from the top so it clears the fixed HUD bar and the clip slate. Menu-panel sections start at 128px. Content sits left of centre, top-left or bottom-left of the frame, leaving the footage's subject open.

The HUD bar is fixed at the top. The section nav appears from `lg`, the "4K · 60" readout from `md`, and the Configure pill from `sm`. Two-column grids (specs, configurator, credits) open at `lg` and stack below it. Bottom-edge HUD readouts (exposure, battery, audio meter) are pinned to the frame corners.

**The Level Line Rule.** The hero's level line spans the whole frame at every width by pulling outward through the gutter (negative margins that match the gutter). It is the thesis, so it is never cropped to the content column.

## Elevation & Depth

The system is flat. Depth comes from footage under translucent ink, not from lifted surfaces. Legibility comes from **local scrims**, which are gradients from ink to transparent placed where the text sits: a left-to-right wash for left-set content, a top wash, or a radial ellipse anchored at a corner (`radial-gradient(ellipse 65–80% … at 0% 0% | 0% 100%, rgb(11 11 11 / 0.78–0.9), transparent 70–78%)`). The rest of the frame keeps full daylight. Only the configure take, which holds a menu panel, uses a uniform 65% ink wash.

### Shadow Vocabulary
- **Headline lift** (`text-shadow: 0 2px 28px rgb(0 0 0 / 0.55)`): A dark, diffuse shadow on section headlines set over footage without a left scrim. It is a legibility aid, never a coloured glow.
- **Note float** (`box-shadow: 0 12px 32px rgba(0,0,0,0.45)`): Only on director's-commentary Notes, which float above everything.
- **Device drop** (`drop-shadow(0 24px 32px rgba(0,0,0,0.45))`): Only on the GX1 device illustration in the configurator.

### Named Rules
**The Local Scrim Rule.** Darken only where the words are. Use a gradient anchored to the text's corner or edge. Never put a whole-frame dark overlay on footage that has no panel.

**The No Glow Rule.** Shadows are black and serve legibility or separation. No coloured glows, no light-emitting edges, and no gradient text.

## Shapes

There are three corner sizes, each with its own job. **Small corners** (4px) go on chips: clip slates, caption chips, compare labels, the punch-in label, and the stabilizer graph. **Medium corners** (6px) go on camera-menu panels and Notes. **Full pills** go on every control the visitor presses: the shutter button, the Reserve button, the HUD Configure pill, toggles, finish swatches, and the email field. Strokes are 1px hairlines, or 2 to 3px for rings around controls. The signature form is the **focus bracket**: four L-shaped corners (2px stroke, 28px arm by default, smaller on small targets), drawn with background gradients and no extra DOM. Brackets are yellow when something is in focus and white when they only frame a target.

## Components

### Buttons
- **Shutter (primary, hero):** A 64px ring (3px HUD White border) around a 44px REC Red disc, followed by "Configure GX1" in title caps. On hover the ring scales to 95% and the disc morphs into a 28px rounded square, the shutter's record-to-stop shape. The text pill picks up a 10% HUD wash. It eases on the expo curve over 300ms.
- **Reserve:** A REC Red pill 44px tall, seated inside the right end of the email field, with a small white dot before the label. While pending, the label reads "Holding…" and the dot blinks.
- **HUD pill (Configure):** A HUD White pill with ink text that turns Focus Yellow on hover.
- **Toggles (Commentary, Stabilizer):** Off is an outlined pill with a 40 to 70% HUD border. On fills with Focus Yellow and ink text. The stabilizer adds a small switch track inside the pill.

### Chips
- **Clip slate:** Every take has one at the top left, under the HUD bar: a mono 11px clip ID and timecode on 65% ink with a small blur and small corners.
- **Caption chip:** Body copy over footage sits in a fitted chip (`bg-ink/75`, 4px corners, `backdrop-blur-sm`, 8 by 12px padding) so it stays readable over any frame. The live-caption line uses the same treatment at 80%.
- **Labels:** The compare labels are solid chips. The phone side is HUD White and the GX1 side is Focus Yellow, both with ink mono text.

### Cards / Containers
- **Camera-menu panel:** Ink at 80% with `backdrop-blur-md` and 6px corners. Padding is 20px on mobile, 32px from `sm`, and 48px from `lg`. Rows are divided by 15% HUD hairlines. In the specs panel, the active row is marked by a yellow triangle caret.
- **Note (director's commentary):** Hidden until Commentary is on. It is 90% ink with a Focus Yellow 1px border, a yellow title in caps, dim body text, and a mono file path.

### Inputs / Fields
- **Email field:** A 56px pill on 70% ink with a 40% HUD border. On focus the border turns yellow and the caret is yellow. When invalid the border turns REC Red. Placeholders cycle every 3 seconds, a vanish animation plays on success, and both are disabled under reduced motion.

### Navigation
- **HUD bar:** Fixed and transparent, with a short top-down ink gradient behind it. From left to right it holds the GX1 wordmark (700, mixed case), a blinking REC dot, "Rec", and running mono timecode, then section links in dim caps that brighten to HUD White on hover, then "4K · 60", the Commentary toggle, and the Configure pill. On mobile the nav collapses away, and the toggle shortens to "Notes".

### Configurator
- **Finish swatches:** 64px pill rings around a shaded 44px disc. The active swatch has a Focus Yellow ring. On hover the swatch lifts 2px. The device preview sits inside white focus brackets at 60% opacity, with a mono spec line underneath.
- **Kit list:** Rows between hairlines with a radio dot that fills yellow when active, a kit name in title caps, the contents in dim body text, and a mono price.

### Viewfinder overlays (signature)
- **Level line:** A full-width 1px HUD line with white end ticks, a yellow centre tick, and a mono "0.0°" readout. The stabilizer demo repeats it at 12% inset, perfectly level while the footage moves under it. In that demo the visitor is the hand. On desktop, pointer position aims a spring-modeled camera over first-person footage: with the stabilizer off the frame follows with overshoot, tremor and roll, and with it on it follows smoothly with roll at zero. On phones the screen is the camera: one **Test the stabilizer** tap gets motion access and turns the stabilizer on, the gyroscope measures the phone's in-screen roll, and the footage counter-rotates by that angle (zooming to hide its corners) so its horizon stays level with the real one. The level line there marks the true horizon.
- **Adapted effects:** Aceternity components were rebuilt into the HUD grammar. Compare uses a yellow slider line with a bracket handle and a native range input instead of sparkles and an indigo glow. Lens became a square punch-in frame with focus brackets and a "2× punch-in" chip. Text Generate became live captions on an ink bar. Placeholders and Vanish Input became the HUD email field.

### Motion
All motion uses `cubic-bezier(0.16, 1, 0.3, 1)` (the expo-out curve). The hero has a 24-second push-in (scale 1.02 to 1.09), the REC dot blinks in steps every 1.2 seconds, and finish changes play a 600ms device-in. Every animation, rAF loop, autoplay and placeholder cycle checks `prefers-reduced-motion` and holds still. Loops also pause off-screen or when the tab is hidden.

## Do's and Don'ts

### Do:
- **Do** run every section as a full-bleed take at `100svh` or taller, with its own clip slate and timecode.
- **Do** put body copy over footage in an ink caption chip (`bg-ink/75`, 4px corners, `backdrop-blur-sm`) unless a local scrim already sits directly under it.
- **Do** protect text with a local scrim (radial, left, or top) anchored where the text sits, and leave the rest of the frame in daylight.
- **Do** reserve REC Red (#ff2d2d) for recording state and the primary action, and Focus Yellow (#ffd400) for focus and selection.
- **Do** set HUD elements in Barlow Condensed caps with 0.1 to 0.2em tracking, and numbers in Geist Mono with tabular numerals.
- **Do** frame the thing in focus with focus brackets rather than a box or a card.
- **Do** give every animation a reduced-motion path and pause loops off-screen.
- **Do** rebuild any third-party effect into the HUD grammar (brackets, hairlines, mono readouts, ink chips) before shipping it.

### Don't:
- **Don't** darken a whole footage frame to make text readable. The only exception is a take that holds a menu panel.
- **Don't** use solid ink panels outside the camera-menu roles (specs, configurator, credits).
- **Don't** use glows, coloured shadows, or gradient text. Shadows are black and exist for legibility.
- **Don't** float a product render on a black void as the hero. Footage carries the hero.
- **Don't** use Geist Mono for prose or headings, or Barlow Condensed for reading paragraphs.
- **Don't** add a third accent hue. New states should map to red (action or recording), yellow (focus), or HUD White.
