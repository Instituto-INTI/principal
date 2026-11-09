"""Render silent, cyclic web loops using only Python's standard library and FFmpeg.

Run from any directory. Pass --ffmpeg PATH when the workspace-local binary is absent.
The first three source clips are retained in tools/sources; the kit uses
the supplied artwork directly and deterministic light overlays, with no paid API.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import argparse
import json
import math
import subprocess

PROJECT = Path(__file__).resolve().parents[1]
WORKSPACE = PROJECT.parent
ASSETS = WORKSPACE.parent / "magnetismo-feminino" / "assets"
QA = WORKSPACE / "tmp" / "loop-review"
QA.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument("--ffmpeg", default=str(WORKSPACE / ".tools/node_modules/ffmpeg-static/ffmpeg.exe"))
parser.add_argument("--portraits-only", action="store_true", help="Reprepare only the three generated portraits; retain the existing kit loops.")
args = parser.parse_args()
FFMPEG = args.ffmpeg
FPS, SECONDS, SIZE = 24, 6, 720

def run(name, command):
    result = subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", *command], capture_output=True, text=True)
    (QA / (name + ".log")).write_text(result.stderr, encoding="utf-8")
    if result.returncode:
        raise RuntimeError(name + ": " + result.stderr[-1800:])

def glows(points):
    fields = []
    for index, (x, y) in enumerate(points):
        phase = index * 1.37
        phase_expr = f"(2*PI*T/{SECONDS}+{phase:.3f})"
        dx = f"(X-W*({x}+.008*sin({phase_expr})))"
        dy = f"(Y-H*({y}+.006*cos({phase_expr})))"
        pulse = f"(.5+.5*sin({phase_expr}))"
        halo = f".045*exp(-({dx}^2+{dy}^2)/(W*W*.004))"
        core = f".3*exp(-({dx}^2+{dy}^2)/(W*W*.000018))"
        ray = f".13*exp(-{dx}^2/(W*W*.0004)-{dy}^2/(H*H*.000008))"
        fields.append(f"{pulse}*({halo}+{core}+{ray})")
    field = "+".join(fields)
    return ":".join(f"{channel}='255*{factor}*clip({field},0,.65)'" for channel, factor in [("r", 1), ("g", .76), ("b", .36)])

KITS = [
    ("ativacao", "pdf-4-1.jpg", [(0.29,.06),(.65,.20),(.78,.82),(.51,.90),(.70,.70)]),
    ("audios", "pdf-4-2.jpg", [(.32,.07),(.55,.60),(.78,.35),(.23,.77),(.61,.94)]),
    ("cards", "pdf-5-1.jpg", [(.10,.30),(.80,.30),(.50,.75),(.80,.79),(.21,.91)]),
    ("imaginacao", "pdf-5-2.jpg", [(.17,.24),(.82,.45),(.50,.80),(.32,.12),(.65,.57)])
]

def render_kit(spec):
    name, image, points = spec
    output = ASSETS / ("loop-" + name + ".mp4")
    zoom = f"1.012+.006*(1-cos(2*PI*on/{FPS*SECONDS}))"
    filters = (
        f"[0:v]zoompan=z='{zoom}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={SIZE}x{SIZE}:fps={FPS},format=gbrp[base];"
        f"nullsrc=s=180x180:r={FPS}:d={SECONDS},format=gbrp,geq={glows(points)},scale={SIZE}:{SIZE}:flags=bilinear[light];"
        "[base][light]blend=all_mode=screen:all_opacity=.7,format=yuv420p[v]"
    )
    run(name, ["-loop", "1", "-framerate", str(FPS), "-i", str(ASSETS / image), "-filter_complex", filters,
               "-map", "[v]", "-frames:v", str(FPS*SECONDS), "-an", "-c:v", "libx264", "-preset", "fast",
               "-crf", "22", "-pix_fmt", "yuv420p", "-threads", "2", "-movflags", "+faststart", str(output)])
    print(f"Rendered {name}: {output.stat().st_size} bytes", flush=True)
    return {"name":name, "type":"local-light-animation", "source":image, "path":str(output.relative_to(WORKSPACE.parent)), "duration":SECONDS, "fps":FPS, "width":SIZE, "height":SIZE}

ledger = []
for name in ["presenca", "fascinio", "magnetismo"]:
    source = PROJECT / "tools/sources" / (name + ".mp4")
    output = ASSETS / ("loop-" + name + ".mp4")
    run(name, ["-i", str(source), "-map", "0:v:0", "-an", "-vf", "setpts=PTS-STARTPTS", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", "24", "-threads", "2", "-movflags", "+faststart", str(output)])
    ledger.append({"name":name, "type":"heygen-free-quota", "path":str(output.relative_to(WORKSPACE.parent)), "approximate_duration":5.17, "fps":24})
    print(f"Prepared {name}: silent, timestamps reset, web encode ready", flush=True)

if args.portraits_only:
    previous = json.loads((PROJECT / "tools/loops-manifest.json").read_text(encoding="utf-8"))
    ledger.extend(clip for clip in previous["clips"] if clip["type"] == "local-light-animation")
else:
    with ThreadPoolExecutor(max_workers=2) as pool:
        ledger.extend(pool.map(render_kit, KITS))
(PROJECT / "tools/loops-manifest.json").write_text(json.dumps({"style":"restrained gold light and subtle cyclical motion; no sound, no text overlays", "clips":ledger}, ensure_ascii=False, indent=2), encoding="utf-8")
print("All seven loops are ready.", flush=True)
