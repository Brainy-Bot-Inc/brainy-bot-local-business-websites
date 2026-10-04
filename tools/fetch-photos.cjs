"use strict";

// Bring in photos whose source matches the business itself.
//   node tools/fetch-photos.cjs
//
// Key Home Improvements: 10 listing photos from Yelp (via the MapQuest
//   listing of Key Home Improvements, telephone +15033916812 - their alt
//   number on file). Replaces the /shop product images.
// Sasquatch Services LLC: 3 photos from their own old site
//   (sasquatchservicesllc.com, tel:5412852353 matches), as served by
//   img1.wsimg.com from the Wayback capture of that site.
// Kings Cupboard: drops a duplicate photo and the photo that is just the
//   logo (already carried as the real logo file).

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..", "assets");

const KEY_YELP = [
  "https://s3-media0.fl.yelpcdn.com/bphoto/wzucyDAhIgGxiJdsEkbY7A/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/-9lpxgXIlcpuizOCGJsKzg/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/Ks8N5EaaCNwrjU9KZyy7tQ/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/bflKu2pFhlYxpB2JZAeSGQ/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/dLVQAA4BAOzdq5eTQ24NrQ/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/WcVQGjlwx7P_TpqO8q3g3Q/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/ixfdQTV6hIFv5YR1JT94YA/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/hHzgWWTM3QAzfXGiB87Fiw/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/AV90Z4TuFLND1jiW4C9DSw/l.jpg",
  "https://s3-media0.fl.yelpcdn.com/bphoto/-HDcXT63SfRzxZNmtUXD7A/l.jpg",
];
const KEY_SOURCE =
  "(source: https://www.mapquest.com/us/oregon/key-home-improvements-429606943) " +
  "listing of Key Home Improvements, telephone +15033916812 - Yelp photo mirrored on the listing";

const SASQ_BASE = "https://img1.wsimg.com/isteam/ip/20259507-0549-4cec-bbfd-a8c9e64989cf/";
const SASQ_FILES = ["IMG_0462.jpg", "IMG_1786.jpg", "IMG_1943.jpg"];
const SASQ_SOURCE =
  "(source: https://www.sasquatchservicesllc.com/ via Wayback capture - " +
  "site phone tel:5412852353 matches)";

function dims(buf) {
  // JPEG SOF / PNG IHDR
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return buf.readUInt32BE(16) + "x" + buf.readUInt32BE(20);
  }
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return buf.readUInt16BE(i + 7) + "x" + buf.readUInt16BE(i + 5);
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return "?x?";
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; site-photo-audit)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(get(res.headers.location));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(url + " -> HTTP " + res.statusCode));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function sidecar(file, url, source, size) {
  fs.writeFileSync(file, url + "\n" + source + "\n" + size + "\n", "utf8");
}

async function main() {
  // ---- Key Home Improvements: Yelp listing photos replace /shop products --
  const keyDir = path.join(ROOT, "Key Home Improvements", "raw");
  const keepUrl = fs.readFileSync(path.join(keyDir, "img0.url.txt"), "utf8");
  const keepImg = fs.readFileSync(path.join(keyDir, "img0.jpg"));
  for (const f of fs.readdirSync(keyDir)) {
    if (f !== "img0.jpg" && f !== "img0.url.txt") fs.rmSync(path.join(keyDir, f));
  }
  // their own /home photo moves to the back of the set
  fs.renameSync(path.join(keyDir, "img0.jpg"), path.join(keyDir, "img10.jpg"));
  fs.renameSync(path.join(keyDir, "img0.url.txt"), path.join(keyDir, "img10.url.txt"));
  void keepImg;

  let n = 0;
  for (const url of KEY_YELP) {
    try {
      const buf = await get(url);
      const idx = String(n).padStart(1, "0");
      fs.writeFileSync(path.join(keyDir, `img${n}.jpg`), buf);
      sidecar(path.join(keyDir, `img${n}.url.txt`), url, KEY_SOURCE, dims(buf));
      console.log(`  Key Home img${n}: ${buf.length} bytes ${dims(buf)}`);
      n++;
    } catch (e) {
      console.error("  KEY FAIL " + e.message);
    }
  }
  if (n < 5) throw new Error("too few Key Home Yelp photos downloaded: " + n);
  void keepUrl;

  // ---- Sasquatch Services: photos from their own old site ----------------
  const sasqDir = path.join(ROOT, "Sasquatch Services LLC", "raw");
  fs.mkdirSync(sasqDir, { recursive: true });
  let s = 0;
  for (const f of SASQ_FILES) {
    try {
      const buf = await get(SASQ_BASE + f);
      fs.writeFileSync(path.join(sasqDir, `img${s}.jpg`), buf);
      sidecar(
        path.join(sasqDir, `img${s}.url.txt`),
        SASQ_BASE + f,
        SASQ_SOURCE,
        dims(buf)
      );
      console.log(`  Sasquatch img${s}: ${buf.length} bytes ${dims(buf)}`);
      s++;
    } catch (e) {
      console.error("  SASQ FAIL " + f + " " + e.message);
    }
  }
  if (s === 0) console.warn("  Sasquatch: NO photos retrieved - site stays photo-free");

  // ---- Kings Cupboard: drop duplicate + logo-as-photo --------------------
  const kingsDir = path.join(ROOT, "Kings Cupboard", "raw");
  for (const f of ["img1.jpg", "img1.url.txt", "img2.jpg", "img2.url.txt"]) {
    fs.rmSync(path.join(kingsDir, f), { force: true });
  }
  console.log("  Kings Cupboard: pruned duplicate photo and logo-as-photo");
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
