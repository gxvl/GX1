# Footage provenance

These stand in for GX1 footage in a fictional showcase. None of it is real GX1 output.

## Video (Pexels License)

Masters (4K unless noted), re-encoded with ffmpeg into web versions (H.264, no audio, faststart): a desktop size and a phone size per clip.

| File | Source | Master |
|---|---|---|
| `public/video/street-1440.mp4`, `street-720.mp4` | [Pexels video 2836342](https://www.pexels.com/video/backside-of-people-walking-on-a-street-sidewalk-2836342/), first 12 s | 3840×2160, 23.976 fps |
| `public/video/beach-1080.mp4` (also served to phones: the gyro mode zooms up to ~2×) | [Pexels video 6319741](https://www.pexels.com/video/person-walking-to-the-beach-6319741/), first 28.5 s, light denoise | listed as 4K, file served at 2560×1440, 29.97 fps |
| `src/assets/posters/street.jpg` | first frame of 2836342 (4K) | |
| `src/assets/posters/beach.jpg` | frame at 0:00.5 of 6319741 (1440p master) | |

## Stills (Unsplash License)

Files live in `src/assets/footage/`, downloaded at 3840 px wide from images.unsplash.com.

| File | Unsplash photo id |
|---|---|
| kyoto-dusk.jpg | 1493976040374-85c8e12f0c0e |
| kyoto-dusk-phone.jpg | derived from kyoto-dusk.jpg with ffmpeg (darkened, desaturated, blurred, grain) to simulate a small phone sensor |
| waterfront.jpg | Pexels photo [259447](https://www.pexels.com/photo/aerial-photography-of-boat-terminal-259447/), original 5312×2988 (Pexels License) |
| desert-road.jpg | 1500530855697-b586d89ba3ee |
| friends.jpg | 1529156069898-49953e39b3ac |
| venice.jpg | 1523906834658-6e24ef2386f9 |
