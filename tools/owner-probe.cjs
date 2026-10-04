"use strict";
// Probe: for each unique Yelp photo on a MapQuest page, report the business
// whose JSON/GraphQL record it appears to belong to. Used to confirm photo
// ownership before harvesting.
//
//   node tools/owner-probe.cjs <page.html> [hint]
const fs = require("fs");

const file = process.argv[2];
const hint = (process.argv[3] || "").toLowerCase();
if (!file) {
  console.error("usage: node owner-probe.cjs <page.html> [hint]");
  process.exit(2);
}
const html = fs.readFileSync(file, "utf8");

const re = /https?:\/\/s3-media0\.fl\.yelpcdn\.com\/(?:bphoto|photo)\/[A-Za-z0-9_\-]+\/l\.jpg/g;
const namePlain = /"name":"([^"]{3,70})"/g;
const nameEscaped = /\\"name\\":\\"([^"\\]{3,70})\\"/g;

const seen = new Set();
const owners = {};
let m;
while ((m = re.exec(html))) {
  const url = m[0];
  if (seen.has(url)) continue;
  seen.add(url);

  const before = html.slice(Math.max(0, m.index - 3000), m.index);
  let owner = "?";
  for (const rx of [namePlain, nameEscaped]) {
    rx.lastIndex = 0;
    let hit;
    let last = null;
    while ((hit = rx.exec(before))) last = hit[1];
    if (last) {
      owner = last;
      break;
    }
  }
  (owners[owner] = owners[owner] || []).push(url.split("/")[4]);
}

console.log(`unique yelp photos: ${seen.size}`);
const rows = Object.entries(owners).sort((a, b) => b[1].length - a[1].length);
for (const [name, ids] of rows) {
  const match = hint && name.toLowerCase().includes(hint) ? "  <== HINT MATCH" : "";
  console.log(String(ids.length).padStart(4), name, match ? match : "");
  if (match) ids.forEach((i) => console.log("        ", i));
}
