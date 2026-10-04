"use strict";
// Renders an HTML contact sheet of every harvested image so they can be eyeballed.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "assets");
let html = `<!doctype html><meta charset="utf-8"><title>Contact sheet</title>
<style>
body{font-family:system-ui,sans-serif;background:#1b1b1f;color:#eee;margin:0;padding:18px}
h2{border-bottom:2px solid #444;margin-top:22px;font-size:15px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:7px}
figure{margin:0;background:#111;padding:6px;border-radius:6px}
img{width:100%;height:104px;object-fit:cover;background:#000;border-radius:4px;display:block}
figcaption{font-size:10px;color:#9a9;margin-top:5px;word-break:break-all}
</style>`;

const only = (process.argv[2] || "").toLowerCase();
const dirs = fs.existsSync(root) ? fs.readdirSync(root).sort() : [];
for (const d of dirs) {
  if (only && !d.toLowerCase().includes(only)) continue;
  const raw = path.join(root, d, "raw");
  if (!fs.existsSync(raw)) continue;
  const imgs = fs
    .readdirSync(raw)
    .filter((x) => /^img\d+\.(jpg|jpeg|png|webp)$/.test(x))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  if (!imgs.length) continue;
  html += `<h2>${d} (${imgs.length})</h2><div class="g">`;
  for (const f of imgs) {
    const meta = path.join(raw, f + ".url.txt");
    let src = "";
    if (fs.existsSync(meta)) {
      const lines = fs.readFileSync(meta, "utf8").split("\n");
      src = lines[0].replace(/^https?:\/\//, "").split("/")[0];
    }
    const rel = path.relative(__dirname, path.join(raw, f)).split(path.sep).join("/");
    html += `<figure><img src="../${rel}" loading="lazy"><figcaption>${f} &middot; ${src}</figcaption></figure>`;
  }
  html += "</div>";
}

fs.writeFileSync(path.join(__dirname, "contact-sheet.html"), html);
console.log("contact-sheet.html written" + (only ? " (filtered: " + only + ")" : ""));
