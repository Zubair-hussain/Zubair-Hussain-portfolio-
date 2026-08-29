# Videos

Drop your video-editing samples / showreels here (e.g. `showreel.mp4`, `edit-01.mp4`).

Files placed in this folder are served at `/videos/<filename>` on the live site,
so you can reference them anywhere in the portfolio, for example:

```tsx
<video src="/videos/showreel.mp4" controls playsInline muted />
```

`intro-video.json` stores the public intro video metadata used by the portfolio
and chatbot knowledge base:

- URL: https://youtu.be/W3Zmlo3D49Y
- Uploaded: 2026-03-16T08:56:28-07:00
- Author: Detroon Shah

Tips for a lightweight, fast site (important on Cloudflare):
- Prefer `.mp4` (H.264) or `.webm`; keep clips compressed.
- For anything large, consider hosting on YouTube/Vimeo and embedding instead.
