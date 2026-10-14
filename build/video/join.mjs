/* ============================================================
   SALUS stand videos - join several loops into one
   ------------------------------------------------------------
   Every video record.mjs makes ends by fading back to its own
   first card, so that it loops. join.mjs drops that return (the
   last --cut seconds of each video), dips each video into the
   next through the cards' navy (one fades out on it, the next
   fades in), and does the same from the last one into the first
   frame of the first video: the joined file loops without a cut.

       node build/video/join.mjs video/r-system-salon-complet.mp4 \
            <site video> <configurator video>

   Options
       --cut <s>    seconds dropped at the end of each video (default 1.2,
                    the return to the first card in every scenario)
       --fade <s>   length of each half of a dip (default 0.45)
       --through <hex>   the colour of the dip (default 1D2858, the cards' navy)
       --crf <n>    x264 quality, lower is better (default 18)

   The inputs must be record.mjs outputs (1920 x 1080, 30 fps).
   Needs ffmpeg and ffprobe on the PATH.
   ============================================================ */

import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const opt = (n, d) => Number(arg(n, d));
const files = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
const [out, ...inputs] = files;
if (!out || inputs.length < 2) {
  console.error("Usage: node build/video/join.mjs <out.mp4> <video 1> <video 2> [...] [--cut 1.2] [--fade 0.45] [--through 1D2858] [--crf 18]");
  process.exit(1);
}
const CUT = opt("cut", 1.2), FADE = opt("fade", 0.45), CRF = String(opt("crf", 18)), FPS = 30;
const THROUGH = arg("through", "1D2858").replace(/^#/, "");

const duration = f => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
const lengths = inputs.map(f => duration(f) - CUT);
const norm = `fps=${FPS},scale=1920:1080,format=yuv420p,settb=AVTB`;

/* each video, its return to the first card cut off */
const graph = [`[0:v]split=2[in0][first]`];
inputs.forEach((_, i) => graph.push(`[${i === 0 ? "in0" : `${i}:v`}]trim=0:${lengths[i].toFixed(4)},setpts=PTS-STARTPTS,${norm}[v${i}]`));
/* the first frame of the first video, held just long enough to fade into */
const HOLD = FADE + 0.2;
graph.push(`[first]trim=end_frame=1,setpts=PTS-STARTPTS,loop=loop=${Math.ceil(HOLD * FPS)}:size=1:start=0,setpts=N/${FPS}/TB,${norm}[loop]`);
/* the dip: a plain navy plate, long enough for a fade out and a fade in */
const DIP = 2 * FADE + 0.1;
inputs.forEach((_, i) => graph.push(`color=c=0x${THROUGH}:s=1920x1080:r=${FPS}:d=${DIP},scale=out_color_matrix=bt709:out_range=tv,${norm}[dip${i}]`));

/* video 1, dip, video 2, dip, ..., the first frame again: each joined to the next by a fade */
const parts = [];
inputs.forEach((_, i) => { parts.push([`v${i}`, lengths[i]], [`dip${i}`, DIP]); });
parts.push(["loop", HOLD]);
let [label, length] = parts[0];
parts.slice(1).forEach(([n, l], k) => {
  const to = k === parts.length - 2 ? "out" : `x${k}`;
  graph.push(`[${label}][${n}]xfade=transition=fade:duration=${FADE}:offset=${(length - FADE).toFixed(4)}[${to}]`);
  length += l - FADE;
  label = to;
});

execFileSync("ffmpeg", [
  "-y", "-loglevel", "error", ...inputs.flatMap(f => ["-i", f]),
  "-filter_complex", graph.join(";"), "-map", "[out]", "-pix_fmt", "yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", CRF, "-profile:v", "high", "-level:v", "4.1",
  "-g", String(FPS * 2), "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
  "-movflags", "+faststart", "-an", out,
], { stdio: "inherit" });

console.log(`Done: ${out} - ${length.toFixed(1)} s, ${(statSync(out).size / 1048576).toFixed(1)} MB, from ${inputs.length} videos`);
