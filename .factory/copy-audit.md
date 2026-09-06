# Landing copy audit

Reviewed: 2026-09-06. This audit covers visitor-facing landing sentences and facts in `site/index.html`. Labels, filenames, selectors, and code samples are excluded from the sentence count.

| Copy | Words | Result |
| --- | ---: | --- |
| You’re offline. | 2 | Pass |
| Reconnect before downloading files. | 4 | Pass |
| Explain why an element misses the viewport. | 7 | Pass |
| For frontend engineers and test authors who need a checkable reason before changing layout or writing a test. | 18 | Pass |
| Opens a populated inspection report. | 5 | Pass |
| Free to download. | 3 | Pass |
| Runs on your device. | 4 | Pass |
| No page contents or form values. | 6 | Pass |
| Browser geometry shown as measured layout relationships. | 6 | Pass |
| The report names the target, records its geometry, and gives an explicit reachability reason. | 13 | Pass |
| The visible centre is covered by `.sticky-footer`. | 7 | Pass |
| Border and content boxes, document offset, viewport position, centre delta, and visible-area ratio. | 13 | Pass |
| Relevant ancestors, overflow mode, scroll extent, current offset, and clipped edges. | 10 | Pass |
| Computed visibility, viewport intersection, centre-point hit target, pointer events, and reason codes. | 11 | Pass |
| Position, insets, transform, z-index, box sizing, margins, borders, and padding. | 10 | Pass |
| Open the toolbar popup or press Alt + Shift + V. | 10 | Pass |
| Check the verdict, measurements, hit test, and ancestor chain. | 10 | Pass |
| Copy or download a versioned report for a bug or test. | 11 | Pass |
| The helper accepts a selector or locator. | 8 | Pass |
| It returns a report or throws reason codes. | 9 | Pass |
| Reports exclude page text, ARIA labels, form values, query strings, and URL fragments. | 12 | Pass |
| Download and unzip the extension package. | 6 | Pass |
| Open chrome://extensions and enable Developer mode. | 6 | Pass |
| Choose “Load unpacked” and select the unzipped folder. | 8 | Pass |
| Browser facts for visible layout problems. | 6 | Pass |
| Generated blueprint imagery is disclosed in the design notes. | 9 | Pass |

No line exceeds 22 words. None contains the banned terms: leverage, seamless, effortless, robust, powerful, intuitive, reimagine, supercharge, unlock, delightful, journey, ecosystem, or AI-powered.

## Terminology

| Concept | Product term |
| --- | --- |
| A chosen DOM object | element |
| The inspection output | report |
| A failed explanation | reason code |
| The test API | Playwright helper |
| The no-setup workspace | demo or sample |
| Saved report data | JSON |
