# HIGH - LVL DAILY · site

Static, single-file site for High - Lvl Daily. No build step.

```
index.html      everything (CSS + JS inline; Lenis loads from cdnjs and is optional)
assets/         host_01.jpg, host_02.jpg (web-sized), wordmark PNGs, 02_avatar_512.png (favicon / og fallback)
press/          drop High_Lvl_Daily_One_Sheet.pdf here (the "Download the one-sheet" button already points at it)
vercel.json     clean URLs + long cache on /assets
```

## Deploy (Vercel)

1. Push this folder to `github.com/Bamechi/highlvldaily`.
2. Vercel: Add New Project, import the repo, Framework Preset **Other**, leave Build Command and Output Directory empty, Deploy.
3. Add the domain (highlvldaily.com). Update the `og:image`, `canonical`, and JSON-LD URLs in `<head>` if the domain differs.

## Forms (topic, advertise, invest, newsletter)

All four forms post JSON to one constant at the top of the script in `index.html`:

```js
const FORM_ENDPOINT = ""; // Google Apps Script web app URL
```

While it is empty, submitting opens a prefilled `mailto:19keys@19keys.com` and shows the inline "Sent" state.

Google Apps Script (Sheet > Extensions > Apps Script, paste, Deploy > New deployment > Web app, Execute as **Me**, Who has access **Anyone**, copy the URL into `FORM_ENDPOINT`):

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(d.form) || ss.insertSheet(d.form);
  if (sh.getLastRow() === 0) sh.appendRow(Object.keys(d));
  sh.appendRow(Object.keys(d).map(k => d[k]));
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Each form gets its own tab (`topic`, `advertise`, `invest`, `newsletter`). The page posts with `mode: "no-cors"` and `text/plain`, which is what Apps Script needs to skip the CORS preflight.

## Swapping in real episodes

In `#episodes`, each card's `.frame` is a placeholder. Replace it with a YouTube embed (the exact snippet is in an HTML comment above the grid) and point the card's Watch button at the video URL. Keep the `.chips` row so segment colors stay consistent.

## HERO_VIDEO_SLOT (upgrade path)

The hero is a two-portrait parallax diptych. When a scroll-scrubbed sequence is ready:

1. Export frames to `assets/seq/frame_0001.jpg ... frame_0120.jpg` (1920 wide, quality ~70).
2. Insert a `<canvas>` at the `<!-- HERO_VIDEO_SLOT -->` comment inside `.hero`.
3. In the scroll loop (`onScroll` in the script), compute `progress = scrollY / hero.offsetHeight`, pick `frames[Math.round(progress * (frames.length - 1))]`, and draw it with cover math.
4. Hide `.diptych` once the first frame paints.

## HUD clock

The top-right HUD counts down to the next weekday 4:44pm PT (premiere countdown until Monday, October 5, 2026) and flips to LIVE between 4:44 and 5:14pm PT on weekdays. All math is done in `America/Los_Angeles` via `Intl`, so it is correct for every visitor. Change `LAUNCH` in the script if the premiere moves.

## Notes

- Fonts load from Google Fonts (Michroma, Inter Tight, Manrope, JetBrains Mono) with system fallbacks.
- Two `<!-- TODO: confirm which portrait is which and swap if needed -->` comments mark the host photos; the order in copy is 19Keys first, B. Amechi second.
- Lenis (smooth scroll) is guarded; if the CDN is unavailable the page scrolls natively.


## Intake (Google Apps Script) · live

All four forms post to one web app: `FORM_ENDPOINT` in `index.html` is already set to the deployed `/exec` URL. The script is in `apps-script/Code.gs`; it routes by the `form` field to a tab in the sheet **High- Lvl Daily Intake Forms** (`1vB5Od_GE19WvzdEjzP24ydEp6Abr0h0OiwBWNRjAiFo`):

| Site form | Tab | Columns filled |
|---|---|---|
| Pitch a topic (private, code `ziion`) | `Pitch a topic` | Name, Email, Topic, Notes, Ziion Member, Timestamp |
| Advertise | `07 Advertise` | Brand, Budget, Category, Email, Notes, Timestamp |
| Invest & partner | `08 invest` | Name, Organization, Email, Interest, Note, Timestamp |
| Newsletter | `10 Newsletter` | Email, Timestamp |

Columns are matched by the header text in row 1, so you can reorder or add columns; unknown headers stay blank. After any code change: Deploy → Manage deployments → pencil → Version "New version" → Deploy (same URL).

## Private Pitch tab
`DESK_CODE = "ziion"` in the script. Unlock persists per browser via localStorage. Change the code by editing that constant.

## Latest episode
`LATEST_EPISODE_URL` in the script. Paste the newest episode URL after each show; the "Watch the latest" button reads it.
