"""Animate the original offer artwork locally, preserving its text and layout."""
from pathlib import Path
import argparse
import json
import subprocess

PROJECT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--ffmpeg", default=str(PROJECT.parent / ".tools/node_modules/ffmpeg-static/ffmpeg.exe"))
args = parser.parse_args()
assets = PROJECT / "dist/assets"
fields = []
for index, (x, y) in enumerate([(.13,.26),(.86,.18),(.87,.54),(.15,.59),(.85,.91)]):
    phase = f"(2*PI*T/6+{index*1.37:.3f})"
    dx, dy = f"(X-W*({x}+.009*sin({phase})))", f"(Y-H*({y}+.006*cos({phase})))"
    fields.append(f"(.5+.5*sin({phase}))*(.06*exp(-({dx}^2+{dy}^2)/(W*W*.003))+.32*exp(-({dx}^2+{dy}^2)/(W*W*.000025))+.12*exp(-{dx}^2/(W*W*.0004)-{dy}^2/(H*H*.000008)))")
field = "+".join(fields)
channels = ":".join(f"{channel}='255*{factor}*clip({field},0,.65)'" for channel, factor in [("r",1),("g",.76),("b",.36)])
filters = (
    "[0:v]scale=430:580:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=430:580:(ow-iw)/2:(oh-ih)/2,setsar=1,format=gbrp[base];"
    f"nullsrc=s=128x172:r=24:d=6,format=gbrp,geq={channels},scale=430:580:flags=bilinear[light];"
    "[base][light]blend=all_mode=screen:all_opacity=.75,format=yuv420p[v]"
)
output = assets / "loop-oferta.mp4"
command = [args.ffmpeg,"-hide_banner","-loglevel","error","-y","-filter_complex_threads","2",
           "-loop","1","-framerate","24","-i",str(assets / "pdf-6-1.jpg"),"-filter_complex",filters,
           "-map","[v]","-frames:v","144","-an","-c:v","libx264","-preset","fast","-crf","21",
           "-pix_fmt","yuv420p","-threads","2","-movflags","+faststart",str(output)]
result = subprocess.run(command, capture_output=True, text=True)
if result.returncode:
    raise RuntimeError(result.stderr)
manifest = PROJECT / "tools/loops-manifest.json"
ledger = json.loads(manifest.read_text(encoding="utf-8"))
ledger["clips"] = [clip for clip in ledger["clips"] if clip["name"] != "oferta"]
ledger["clips"].append({"name":"oferta","type":"local-light-animation","source":"pdf-6-1.jpg","path":"dist/assets/loop-oferta.mp4","duration":6,"fps":24,"width":430,"height":580})
manifest.write_text(json.dumps(ledger,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"Offer loop ready: 430x580, 6s, no audio, {output.stat().st_size} bytes.",flush=True)
