# VemaFlow Branding

This folder contains the project logo and brand assets.

Files:

- `logo.svg`: Full logo with wordmark
- `logo-mark.svg`: Standalone mark for small sizes or favicon

Public assets (served from `/`):

- `/favicon.svg`: SVG favicon
- `/icons/icon-192.svg` and `/icons/icon-512.svg`: PWA icons (SVG)
- `/og-image.svg`: Social sharing banner (Open Graph)

Usage tips:

- In React, you can import the mark as an image URL:

  ```jsx
  import mark from '@/assets/branding/logo-mark.svg';
  <img src={mark} alt="VemaFlow" />
  ```

- For the navbar, prefer the mark + text to keep it compact.
- If you need PNGs (for legacy PWA requirements), export these SVGs to PNG at 192x192 and 512x512.
