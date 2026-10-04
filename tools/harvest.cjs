"use strict";
// Harvest real business photos. Two modes:
//
//   listing  - parse the page's JSON-LD LocalBusiness record and take only the
//              photos attached to THAT business (MapQuest mirrors Yelp's feed).
//   site     - take images embedded in the business's own website.
//
//   node harvest.cjs <out-dir> <listing|site> <url> [url...]
//
// No native deps: dimensions are read straight from the image headers.

const fs = require("fs");
const path = require("path");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const MIN_W = Number(process.env.MIN_W || 480);
const MIN_H = Number(process.env.MIN_H || 300);
const MAX_BYTES = Number(process.env.MAX_BYTES || 480 * 1024); // keeps WP files manageable
const MIN_BYTES = Number(process.env.MIN_BYTES || 15 * 1024);
const CAP = Number(process.env.CAP || 16); // per business
const REJECT = process.env.NO_REJECT
  ? /a^/
  : /logo|favicon|sprite|badge|avatar|placeholder|spinner|arrow|pixel|tracking|blank\.|1x1|icon|share|social|\.svg|\.gif/i;

function dimensions(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50)
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf.length > 10 && buf[0] === 0x47 && buf[1] === 0x49)
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      const len = buf.readUInt16BE(i + 2);
      const isSof =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      if (len < 2) break;
      i += 2 + len;
    }
    return null;
  }
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const four = buf.toString("ascii", 12, 16);
    if (four === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (four === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (four === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) };
    }
  }
  return null;
}

async function fetchBuffer(url, referer) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      ...(referer ? { referer } : {}),
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const ct = res.headers.get("content-type") || "";
  if (!ct.startsWith("image/") && !/octet-stream/.test(ct)) throw new Error("not an image: " + ct);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return { code: res.status, html: "" };
    return { code: res.status, html: await res.text() };
  } catch (e) {
    return { code: 0, html: "", err: e.message };
  }
}

function absolute(u) {
  let v = u.replace(/\\u002F/gi, "/").replace(/&amp;/g, "&");
  if (v.startsWith("//")) v = "https:" + v;
  return v;
}

// --- listing mode: only photos attached to the business itself -------------
function listingImages(html, page) {
  const out = [];
  const push = (u) => {
    u = absolute(String(u));
    if (/^https?:\/\//i.test(u) && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u)) out.push(u);
  };

  // 1. JSON-LD blocks - the authoritative record for this place.
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRe.exec(html))) {
    let parsed;
    try {
      parsed = JSON.parse(m[1].trim());
    } catch (_) {
      continue;
    }
    const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] || [parsed];
    for (const n of nodes) {
      if (!n || typeof n !== "object") continue;
      const t = n["@type"];
      const types = Array.isArray(t) ? t : [t];
      const isBusiness = types.some((x) =>
        /LocalBusiness|Restaurant|Store|Shop|FoodEstablishment|Organization|Corporation|GasStation|Automotive|Contractor/i.test(
          String(x)
        )
      );
      if (!isBusiness) continue;
      if (Array.isArray(n.image)) n.image.forEach(push);
      else if (typeof n.image === "string") push(n.image);
      if (Array.isArray(n.photo)) n.photo.forEach(push);
      else if (typeof n.photo === "string") push(n.photo);
    }
  }

  // 2. The listing's own primary photo on the MapQuest CDN.
  const primary = /"photos":\{"primary":\{"caption":[^,]*,"url":"([^"]+)"/g;
  while ((m = primary.exec(html))) push(m[1].replace(/\\u002F/gi, "/").replace(/\\\//g, "/"));

  return [...new Set(out)];
}

// --- site mode: images hosted on the business's own site -------------------
function siteImages(html, page) {
  const host = (() => {
    try {
      return new URL(page).hostname.replace(/^www\./, "");
    } catch (_) {
      return "";
    }
  })();
  const out = [];
  const re = /https?:\/\/[^"'\\ <>()\]]+?\.(?:jpg|jpeg|png|webp)/gi;
  let m;
  while ((m = re.exec(html))) {
    const u = absolute(m[0]);
    if (REJECT.test(u)) continue;
    // stay on the business's own hosts (or its CDN)
    const h = (() => {
      try {
        return new URL(u).hostname;
      } catch (_) {
        return "";
      }
    })();
    const sameSite = h.includes(host.split(".").slice(-2).join(".")) || host.includes(h.split(".").slice(-2).join("."));
    const knownCdn = /wixstatic|squarespace-cdn|static1\.squarespace|cloudinary|imgur|shopify/i.test(h);
    if (!sameSite && !knownCdn) continue;
    // Squarespace serves originals (~1.5MB). Ask its CDN for a sized copy.
    let finalUrl = u;
    if (/squarespace-cdn|static1\.squarespace/i.test(h) && !/[?&]format=/.test(finalUrl)) {
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + "format=1000w";
    }
    out.push(finalUrl);
  }
  return [...new Set(out)];
}

// --- commons mode: freely-licensed topical photos from Wikimedia Commons ---
async function commonsImages(query) {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url%7Cmime%7Cextmetadata" +
    "&iiurlwidth=1200&format=json";
  const res = await fetch(api, {
    headers: { "user-agent": UA, accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error("commons HTTP " + res.status);
  const j = await res.json();
  const pages = j.query && j.query.pages ? Object.values(j.query.pages) : [];
  const out = [];
  for (const p of pages) {
    const i = p.imageinfo && p.imageinfo[0];
    if (!i) continue;
    if (i.mime && !/^image\/(jpeg|png|webp)$/.test(i.mime)) continue;
    if (/(svg|gif)/i.test(i.mime || "")) continue;
    const lic = (i.extmetadata && i.extmetadata.LicenseShortName && i.extmetadata.LicenseShortName.value) || "";
    out.push({ url: (i.thumburl || i.url).split("?")[0], title: p.title, lic });
  }
  return out;
}

async function main() {
  const [name, mode, ...pages] = process.argv.slice(2);
  if (!name || !mode || pages.length === 0) {
    console.error("usage: node harvest.cjs <out-dir> <listing|site|commons> <url|query> [...]");
    process.exit(2);
  }
  const outDir = path.join(__dirname, "..", "assets", name);
  fs.mkdirSync(path.join(outDir, "raw"), { recursive: true });

  const candidates = [];
  for (const page of pages) {
    if (mode === "commons") {
      try {
        const hits = await commonsImages(page);
        console.log(`  commons [${hits.length}] "${page}"`);
        for (const h of hits)
          candidates.push({ u: h.url, page: "Wikimedia Commons (" + h.lic + "): " + h.title });
      } catch (e) {
        console.log(`  commons ERR ${page}: ${e.message}`);
      }
      continue;
    }
    const { code, html, err } = await fetchText(page);
    console.log(`  page [${code}] ${page}${err ? " " + err : ""}`);
    if (code !== 200) continue;
    const urls = mode === "listing" ? listingImages(html, page) : siteImages(html, page);
    console.log(`    ${urls.length} candidate url(s)`);
    for (const u of urls) candidates.push({ u, page });
  }

  const rawDir = path.join(outDir, "raw");
  const existing = fs.existsSync(rawDir)
    ? fs.readdirSync(rawDir).filter((f) => /^img\d+\.(jpg|jpeg|png|webp)$/.test(f))
    : [];
  let kept = existing.length;
  const start = kept;

  // index already-downloaded files so re-runs never duplicate a photo
  const seen = new Set();
  for (const f of existing) {
    const meta = path.join(rawDir, f + ".url.txt");
    if (fs.existsSync(meta)) {
      const first = fs.readFileSync(meta, "utf8").split("\n")[0].trim();
      if (first) seen.add(first.split("?")[0]);
    }
  }
  for (const { u, page } of candidates) {
    if (kept >= CAP) break;
    const key = u.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const buf = await fetchBuffer(u, page);
      if (buf.length < MIN_BYTES || buf.length > MAX_BYTES) {
        if (process.env.VERBOSE) console.log(`      - skip ${Math.round(buf.length / 1024)}KB  ${u.slice(0, 90)}`);
        continue;
      }
      const d = dimensions(buf);
      if (!d || d.w < MIN_W || d.h < MIN_H) {
        if (process.env.VERBOSE) console.log(`      - skip ${d ? d.w + "x" + d.h : "?"}  ${u.slice(0, 90)}`);
        continue;
      }
      const ext = buf[0] === 0x89 ? "png" : "jpg";
      const file = `img${kept}.${ext}`;
      fs.writeFileSync(path.join(outDir, "raw", file), buf);
      fs.writeFileSync(
        path.join(outDir, "raw", `img${kept}.url.txt`),
        u + "\n(source: " + page + ")\n" + d.w + "x" + d.h + "\n"
      );
      console.log(`    + ${file}  ${d.w}x${d.h}  ${Math.round(buf.length / 1024)}KB`);
      kept++;
    } catch (_) {
      /* skip */
    }
  }
  console.log(`  -> +${kept - start} added, ${kept} total for ${name}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
