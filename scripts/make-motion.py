"""Generate a seamless mineral/gold loop, without decorative rings or particles."""
from pathlib import Path
import math
import numpy as np
from PIL import Image
import imageio_ffmpeg

media = Path(__file__).resolve().parents[1] / 'assets/media'
w, h, fps, seconds = 1440, 480, 30, 12
y, x = np.mgrid[0:h, 0:w].astype(np.float32)
x /= w
y /= h

def pixels(phase):
    # Every time-dependent term has an integer period: the wrap is one normal frame step.
    u = x * 5 + y * 2 + .55 * np.sin(y * 5 + phase) + .25 * np.sin(x * 7 - phase)
    light = ((np.sin(u * 2.4 - phase) + 1) / 2) ** 1.5
    glow = np.exp(-((x - .6 - .12 * math.sin(phase)) ** 2 + (y - .4) ** 2) * 5)
    colors = np.empty((h, w, 3), dtype=np.float32)
    for c, (low, high) in enumerate([(12, 206), (42, 153), (53, 78)]):
        colors[:, :, c] = low + (high - low) * light + glow * [22, 18, 10][c]
    return np.clip(colors, 0, 255).astype(np.uint8)

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
print('Seamless 12-second motion generated; periodic endpoint verified.')
