# Viewport Fact Sheet — visual thesis

## Direction: blueprint drafting sheet

The product makes invisible browser geometry inspectable, so its interface borrows from a working architect's blueprint rather than a generic developer dashboard. Fine cyan construction lines, registration crosses, dimension ticks, punched-paper edges, and a single vermilion review mark make the page feel measured and evidentiary. Decoration always describes boxes, clipping, or sight lines.

## Visual system

- **Palette:** midnight blueprint `#071A2B` (dark field), paper `#F4F0E7` (light field), drawing cyan `#48C6E8`, deep ink `#09263B`, muted steel `#54717F`, rule blue `#A8D7E4`, inspection vermilion `#F15A3C`, pass green `#187A61`, caution ochre `#A85F00`, and failure red `#B83244`. Light and dark treatments retain at least 4.5:1 text contrast; status is always paired with a label or icon.
- **Type:** `ui-monospace, SFMono-Regular, Consolas, monospace` for measurements, labels, and controls; `Georgia, Cambria, serif` for editorial display copy. Both are local system stacks—no network font requests. Tabular numerals are enabled throughout the fact sheet.
- **Scale:** 4/8 px base grid. Spacing steps are 4, 8, 12, 16, 24, 32, 48, 72. Hairlines are mostly 1 px; selected geometry is 2 px vermilion. Type steps are 12, 14, 16, 20, 28, and clamp(40–72) px.
- **Layout:** sections align to a visible 24 px drafting grid. Independent facts appear as ruled rows, not floating cards. Corner ticks and measurement arrows explain box-model and viewport relationships. The popup uses a compact 360 px drawing sheet; the landing page opens into a two-column drafting table and stacks at 760 px.
- **Interaction grammar:** primary controls are filled vermilion tabs with a small arrow; secondary controls are blueprint-outline buttons. Hover shifts only the registration mark or underline. Focus is a 3 px cyan/ink double ring. Pick mode changes the cursor to a crosshair and places a measured outline around the candidate element. Esc always cancels.
- **Motion:** 160–220 ms opacity/transform transitions suggest a sheet being placed on a table; picker outlines follow pointer movement without easing so evidence stays exact. There is no looping animation. With `prefers-reduced-motion: reduce`, transforms and transitions are removed and state changes are immediate.
- **Responsive intent:** the landing page drops decorative coordinate labels and stacks the sample sheet below the main action at 390 px. The extension popup keeps full inspection and export controls with scrollable evidence sections and 44 px targets.

## Original asset plan

One generated hero plate shows an isometric browser viewport as a physical cyan technical drawing: nested frames, clipped panels, measurement leaders, and an occluding slab on midnight blueprint paper. It contains no text because actual facts remain live HTML. Hand-authored SVG extension icons use the same measured-frame motif.

### Image prompt sheet

- **Use case:** stylized-concept
- **Subject/world:** an exploded axonometric browser viewport diagram with nested layout rectangles, scroll boundaries, clipping planes, dimension arrows, registration crosses, and one offset element
- **Materials:** cyan technical ink, translucent drafting film, midnight blueprint paper, tiny vermilion inspection marks
- **Light/lens:** flat overhead drafting-table light, crisp orthographic/isometric lens, tactile paper grain
- **Palette words:** midnight navy, blueprint cyan, pale paper, sparse vermilion
- **Composition:** landscape, dense diagram on the right and calm negative space on the left; no realistic screen UI
- **Negative list:** no text, letters, numbers, watermark, logo, people, branded browser chrome, gradients, neon glow, illegible pseudo-labels

### Provenance

`site/public/assets/viewport-blueprint-hero.20260828.webp` and its mobile counterpart were generated for this product with the Factory Azure image deployment using `/opt/fleet/lib/gen-image.sh` on 2026-08-28. The date-stamped filenames make their immutable deployment caching safe. The exact prompt and generation metadata are stored in `assets/src/viewport-blueprint-hero.prompt.json`. Generated imagery is original to this product. Extension icons are hand-authored SVG by the product builder and are MIT-licensed with the repository.
