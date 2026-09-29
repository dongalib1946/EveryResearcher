"""Preserve the original textured waves and particles; remove only orbit outlines."""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw
import imageio_ffmpeg

media = Path(__file__).resolve().parents[1] / 'assets/media'
w, h, fps, seconds = 1440, 480, 30, 20
y, x = np.mgrid[0:h, 0:w].astype(np.float32)
x /= w
y /= h

def pixels(phase):
    # Travel smoothly through the original eight seconds and back. The original
    # wave equations stay intact, while zero velocity at each turn avoids a cut.
    t = 4 * (1 - math.cos(phase))
    u = x * 5 + y * 2 + .65 * np.sin(y * 5 + t * .4) + .3 * np.sin(x * 9 - t * .45)
    light = np.clip((np.sin(u * 3.5 - t * .6) + 1) / 2, 0, 1) ** 1.6
    fine = .06 * np.sin(u * 33 + y * 13 + t * .4)
    glow = np.exp(-((x - .63 - .08 * math.sin(t)) ** 2 + (y - .4) ** 2) * 5)
    colors = np.empty((h, w, 3), dtype=np.float32)
    for c, (low, high) in enumerate([(12, 206), (42, 153), (53, 78)]):
        colors[:, :, c] = low + (high - low) * light + fine * 100 + glow * [27, 22, 12][c]
    img = Image.fromarray(np.clip(colors, 0, 255).astype(np.uint8))
    draw = ImageDraw.Draw(img, 'RGBA')
    for n in range(32):
        px = int((n * 173.7 + t * (5 + n % 3)) % w)
        py = int((n * 93.4 + 20 * math.sin(t * .7 + n)) % h)
        draw.ellipse((px, py, px + 2, py + 2), fill=(244, 226, 174, 130))
    return np.asarray(img)

assert np.max(np.abs(pixels(0).astype(int) - pixels(2 * math.pi).astype(int))) <= 1
writer = imageio_ffmpeg.write_frames(str(media / 'research-motion.mp4'), (w, h), fps=fps,
    codec='libx264', quality=8, pix_fmt_out='yuv420p', macro_block_size=16,
    output_params=['-movflags', '+faststart', '-g', '30', '-bf', '0'])
writer.send(None)
for frame in range(fps * seconds):
    rgb = pixels(2 * math.pi * frame / (fps * seconds))
    if frame == 0:
        Image.fromarray(rgb).save(media / 'intro-poster.jpg', quality=92)
    writer.send(rgb.tobytes())
writer.close()
print('Original waves restored without orbit lines; seamless endpoint verified.')
