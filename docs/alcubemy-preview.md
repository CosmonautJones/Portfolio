# Alcubemy portfolio preview

Alcubemy is the first Playground item on `/work`. Its external game link remains separate from the inline preview. It is presented as an experimental sandbox; living construction remains on the roadmap.

`public/projects/alcubemy-reaction.mp4` is an eight-second, silent recording of the real game renderer, cropped around a deliberately composed glass bowl. Water is poured into lava, producing steam and obsidian. This is a composed experiment, not the opening vessel or a rendered mockup.

- 960 × 540, H.264, YUV 4:2:0, fast-start MP4; 188,400 bytes.
- Native controls and inline playback; no autoplay or loop. `preload="none"` avoids fetching the video before playback in supporting browsers.
- The existing Alcubemy share image serves as its poster. The visible caption supplies context for the silent clip.
- Card tests cover controls, inline playback, preload and poster. The work-page test requires one Alcubemy entry, first in Playground.

To recapture, compose a glass cup in the game, fill it with lava and pour a narrow stream of water. Capture the actual 480 × 270 renderer with `canvas.captureStream`, crop the reaction area if needed, and encode a short silent H.264 MP4 with `-pix_fmt yuv420p -movflags +faststart`. Keep the preview below 1 MB and verify actual browser playback before publishing. Do not use generated imagery as gameplay footage.
