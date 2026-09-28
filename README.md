# raja-website

Portfolio website for **Creation Memories Photography**: wedding, pre-wedding, corporate and commercial photography and films, with in-house editing.

A static, mobile-first site (plain HTML, CSS and JavaScript, with no build step).

## Structure
- `index.html`: the page
- `css/style.css`: styles (mobile-first, breakpoints at 600 / 820 / 1080px)
- `js/main.js`: nav, portfolio filter and lightbox, film previews, WhatsApp enquiry form
- `js/photos.js`: list of portfolio photos (`[file, category, width, height]`)
- `assets/img/thumb` + `assets/img/full`: gallery images (900px wide / 2560px long edge, JPEG q88 / q92). Older photos are 700px / 1600px
- `assets/video`: full films (1080p, x264 CRF 20) + `-preview.mp4` muted 12s loops (720p) + poster frames

## Adding photos
Put a 2560px (long edge, q92) version in `assets/img/full/` and a 900px-wide (q88) version in `assets/img/thumb/` with the same file name,
then add a line to `js/photos.js`. Categories: `wedding`, `prewedding`, `celebration`, `club`, `commercial`, `design`.

## Run locally
```
python -m http.server 8000
```
then open http://localhost:8000

## Publish
Settings → Pages → Deploy from branch → `main` / root.
