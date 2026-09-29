"""Convert the user-provided opening film without changing its source."""
from pathlib import Path
import subprocess
import sys
import imageio_ffmpeg

if len(sys.argv) != 2:
    raise SystemExit('Usage: python scripts/prepare-opening.py "path/to/opening.mp4"')
source = Path(sys.argv[1]).resolve(strict=True)
media = Path(__file__).resolve().parents[1] / 'assets/media'
output = media / 'opening-film.mp4'
if source == output.resolve():
    raise SystemExit('Input must differ from output')
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ffmpeg, '-y', '-i', str(source), '-map', '0:v:0', '-an',
    '-vf', 'scale=1920:-2', '-c:v', 'libx264', '-crf', '23', '-preset', 'medium',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(output)], check=True)
subprocess.run([ffmpeg, '-y', '-ss', '0.5', '-i', str(output), '-frames:v', '1',
    str(media / 'opening-poster.jpg')], check=True)
