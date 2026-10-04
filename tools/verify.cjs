"use strict";

// Static verification of everything build-sites.cjs produced.
//   node tools/verify.cjs        -> exits 1 if anything fails

const fs = require("fs");
const path = require("path");
const DATA = require("./data.cjs");

const ROOT = path.join(__dirname, "..");
const SITES = path.join(ROOT, "sites");
const PAGES = ["index", "services", "about", "contact"];
const css = fs.readFileSync(path.join(SITES, "assets", "site.css"), "utf8");

const fails = [];
const ok = [];
const fail = (m) => fails.push(m);
const pass = (m) => ok.push(m);

function check(cond, msg) {
  if (cond) pass(msg);
  else fail(msg);
}

for (const b of DATA) {
  const dir = path.join(SITES, b.slug);
  const wp = path.join(dir, "wordpress");
  const imgDir = path.join(dir, "images");
  const tag = b.name;

  check(fs.existsSync(dir), `${tag}: folder exists`);
  check(fs.existsSync(path.join(dir, "README.md")), `${tag}: README.md`);
  check(fs.existsSync(path.join(dir, "email.md")), `${tag}: email.md`);
  // the gallery page is gone for good
  check(!fs.existsSync(path.join(dir, "gallery.html")), `${tag}: no gallery.html`);
  const readme = fs.readFileSync(path.join(dir, "README.md"), "utf8");
  check(!/gallery/i.test(readme), `${tag}/README.md: no gallery mention`);
  check(!/photo strip/i.test(readme), `${tag}/README.md: no photo-strip mention (strip removed)`);

  // No email on file? Then no email is shown, and nothing is said about it.
  const noEmailRe = /no (public )?email|email (address )?(is |was |not )(published|listed|available|provided)/i;
  for (const doc of ["README.md", "email.md"]) {
    const f = path.join(dir, doc);
    if (!fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, "utf8");
    check(!noEmailRe.test(txt), `${tag}/${doc}: no commentary about a missing email`);
    if (!b.email) {
      check(!/mailto:|Email:/i.test(txt), `${tag}/${doc}: no email line when business has none`);
    }
  }

  const imgs = fs.existsSync(imgDir) ? fs.readdirSync(imgDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f)) : [];
  const photoFiles = imgs.filter((f) => /^photo-/i.test(f));
  const logoFiles = imgs.filter((f) => /^logo\./i.test(f));

  // ---- provenance: every photo must belong to THIS business -------------
  const rawDir = path.join(ROOT, "assets", b.name, "raw");
  const metas = fs.existsSync(rawDir)
    ? fs.readdirSync(rawDir).filter((f) => /^img\d+\.url\.txt$/i.test(f))
    : [];
  const stockRe = /Wikimedia Commons|unsplash|pexels|pixabay|adobestock|stock\.free/i;
  const foreign = metas
    .map((f) => ({ f, txt: fs.readFileSync(path.join(rawDir, f), "utf8") }))
    .filter((m) => stockRe.test(m.txt));
  check(
    foreign.length === 0,
    `${tag}: all ${metas.length} photo sources are the business itself${
      foreign.length ? " FOREIGN: " + foreign.map((m) => m.f).join(",") : ""
    }`
  );
  const photoCount = metas.length;
  check(
    photoFiles.length === metas.length,
    `${tag}: images/ photos mirror assets raw (${photoFiles.length}/${metas.length})`
  );

  // ---- the business's own logo, when one was found ---------------------
  const logoSrc = b.logo ? path.join(ROOT, "assets", b.name, b.logo) : null;
  const logoMeta = path.join(ROOT, "assets", b.name, "logo.url.txt");
  if (b.logo) {
    check(fs.existsSync(logoSrc), `${tag}: logo source exists`);
    check(fs.existsSync(logoMeta), `${tag}: logo provenance sidecar`);
    if (fs.existsSync(logoMeta)) {
      check(
        !stockRe.test(fs.readFileSync(logoMeta, "utf8")),
        `${tag}: logo source is the business itself`
      );
    }
    check(
      logoFiles.length === 1 && logoFiles[0] === b.logo,
      `${tag}: images/ carries the logo (${logoFiles.join(",") || "none"})`
    );
  } else {
    check(logoFiles.length === 0, `${tag}: no logo file (none found for this business)`);
  }

  for (const p of PAGES) {
    const file = path.join(dir, p + ".html");
    if (!fs.existsSync(file)) {
      fail(`${tag}/${p}: missing`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");

    // no unresolved template tokens
    check(!/\{\{|\b__(IMG|G_|FULL|NAV|PHONE)/.test(html), `${tag}/${p}: tokens resolved`);
    // correct relative asset path (one level below sites/)
    check(html.includes('href="../assets/site.css"'), `${tag}/${p}: stylesheet path`);
    check(html.includes('src="../assets/site.js"'), `${tag}/${p}: script path`);
    // navigation across all four pages
    for (const target of PAGES) {
      check(html.includes(`href="${target}.html"`), `${tag}/${p}: link -> ${target}.html`);
    }
    check(!/gallery\.html/.test(html), `${tag}/${p}: no gallery link`);

    // images referenced must exist
    const refs = [...html.matchAll(/src="(images\/[^"]+)"/g)].map((m) => m[1]);
    const missing = refs.filter((r) => !fs.existsSync(path.join(dir, r)));
    check(missing.length === 0, `${tag}/${p}: ${refs.length} image ref(s) resolve${missing.length ? " MISSING " + missing.join(",") : ""}`);
    // a business with no photos must not render an empty or stray <img>
    if (photoCount === 0) {
      const nonLogo = refs.filter((r) => !(b.logo && r.includes(b.logo)));
      check(nonLogo.length === 0, `${tag}/${p}: no photo tags when business has none`);
    }
    // never an empty src
    check(!/src=""/.test(html), `${tag}/${p}: no empty src`);
    // never any commentary about a missing email
    check(!/no (public )?email|email (address )?(is |not )(published|listed|available)/i.test(html), `${tag}/${p}: no commentary about a missing email`);

    // ---- ONE button per page, and it shows the phone number --------------
    const btnAnchors = html.match(/<a\s[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*>[\s\S]*?<\/a>/g) || [];
    check(btnAnchors.length === 1, `${tag}/${p}: exactly one button on the page (${btnAnchors.length})`);
    check(
      btnAnchors.length === 1 && btnAnchors[0].includes(b.phone),
      `${tag}/${p}: the one button shows the phone number`
    );
    check(
      !/<a\s[^>]*>\s*(Get in touch|Send a message|Call us)\s*<\/a>/i.test(html),
      `${tag}/${p}: no Get in touch / Send a message / Call us buttons`
    );

    // ---- real logo in the upper-left header ------------------------------
    const logoTag = html.match(/<img class="brand-logo" src="([^"]+)" alt="([^"]*)">/);
    if (b.logo) {
      check(!!logoTag, `${tag}/${p}: real logo in the header`);
      if (logoTag) {
        check(logoTag[1] === "images/" + b.logo, `${tag}/${p}: logo src points at images/${b.logo}`);
        check(logoTag[2] === b.name + " logo", `${tag}/${p}: logo alt text names the business`);
      }
    } else {
      check(!logoTag && html.includes('class="brand-mark"'), `${tag}/${p}: monogram header (no logo found)`);
    }

    // ---- theme personality ------------------------------------------------
    check(html.includes(`data-theme="${b.theme}"`), `${tag}/${p}: data-theme=${b.theme}`);

    // stale template copy from earlier rounds must not survive
    for (const phrase of ["A look inside", "Services you can rely on", "Four simple steps", "What people say", "Photos from around the business"]) {
      check(!html.includes(phrase), `${tag}/${p}: no stale copy "${phrase}"`);
    }

    // ---- live open/closed: schedule on <body>, status text in the hero ---
    const schedAttr = html.match(/data-schedule="([^"]*)"/);
    let sched = null;
    if (schedAttr) {
      try {
        sched = JSON.parse(schedAttr[1].replace(/&quot;/g, '"'));
      } catch (e) {
        sched = null;
      }
    }
    check(Array.isArray(sched) && sched.length >= 1, `${tag}/${p}: data-schedule parses with entries`);
    if (sched) {
      const wellFormed = sched.every(
        (s) => Array.isArray(s.d) && s.d.length >= 1 && /^\d{2}:\d{2}$/.test(s.o) && /^\d{2}:\d{2}$/.test(s.c)
      );
      check(wellFormed, `${tag}/${p}: schedule entries well-formed`);
      // a day the business lists as Closed must not be in the schedule
      const closedDay = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      let leaked = null;
      for (const [label, val] of b.hours) {
        if (!/^closed$/i.test(val.trim())) continue;
        const single = label.match(/^\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*$/i);
        if (!single) continue;
        const d = closedDay[single[1].toLowerCase().slice(0, 3)];
        if (sched.some((s) => s.d.includes(d))) leaked = label;
      }
      check(leaked == null, `${tag}/${p}: closed days excluded from schedule${leaked ? " LEAKED " + leaked : ""}`);
    }
    if (p === "index") {
      check(html.includes("data-hours-status"), `${tag}/index: live open/closed indicator`);
      const fallback = html.match(/<span class="hours-live-text">([^<]*)<\/span>/);
      check(!!fallback && fallback[1].length > 10, `${tag}/index: hours fallback text present`);
      if (fallback && b.hours.some(([, v]) => /closed/i.test(v))) {
        check(/closed/i.test(fallback[1]), `${tag}/index: fallback names the closed days`);
      }
    }

    // ---- tiles are gone: services are rows, values are rows --------------
    check(!html.includes('class="card"'), `${tag}/${p}: no card tiles`);
    // a business that relabels its services page (Trapala -> Menu)
    if (b.servicesNavLabel) {
      check(html.includes(`>${b.servicesNavLabel}</a>`), `${tag}/${p}: nav/footer says "${b.servicesNavLabel}"`);
    }
    if (p !== "contact") {
      check(!html.includes('class="icon-badge"'), `${tag}/${p}: no icon tiles`);
    }
    if (p === "index" || p === "services") {
      check(html.includes('class="svc-list"'), `${tag}/${p}: service list, not a grid`);
    }
    if (p === "about") {
      check(html.includes('class="values-list"'), `${tag}/about: value rows, not a grid`);
    }
    // the about page no longer carries the photo strip
    if (p === "about") {
      check(!/class="grid grid-4"[\s\S]*?<img/.test(html), `${tag}/about: no photo strip section`);
    }
    // services page carries the redistributed photos
    if (p === "services" && photoCount > 0) {
      check(html.includes('class="photo-band"'), `${tag}/services: photo band present`);
    }

    // the phone number must appear exactly once inside the hero
    const heroMatch = html.match(/<section class="hero[\s\S]*?<\/section>/);
    if (heroMatch) {
      const n = heroMatch[0].split(b.phone).length - 1;
      check(n === 1, `${tag}/${p}: hero shows the phone exactly once (found ${n})`);
      // no adjacent phone-number-then-same-number-button duplication anywhere
      const dup = new RegExp(esc(b.phone) + "[\\s\\S]{0,160}" + esc(b.phone));
      check(!dup.test(heroMatch[0]), `${tag}/${p}: hero has no phone duplication`);
    } else {
      fail(`${tag}/${p}: hero section present`);
    }
    // one H1
    check((html.match(/<h1[\s>]/g) || []).length === 1, `${tag}/${p}: exactly one <h1>`);
    // meaningful document title
    check(/<title>[^<]{10,}<\/title>/.test(html), `${tag}/${p}: descriptive <title>`);
  }

  // ---- WordPress copies ----
  for (const p of PAGES) {
    const file = path.join(wp, p + ".html");
    if (!fs.existsSync(file)) {
      fail(`${tag}/wp/${p}: missing`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    check(!/\{\{|\b__(IMG|G_|FULL|NAV|PHONE)/.test(html), `${tag}/wp/${p}: tokens resolved`);
    // Google Fonts is the one allowed external stylesheet (offline it
    // degrades to the system stacks in site.css); nothing else may be one
    const noFonts = html.replace(/<link[^>]+href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>/g, "");
    check(!/<link[^>]+stylesheet/i.test(noFonts), `${tag}/wp/${p}: no external stylesheet`);
    for (const phrase of ["A look inside", "Services you can rely on", "Four simple steps"]) {
      check(!html.includes(phrase), `${tag}/wp/${p}: no stale copy "${phrase}"`);
    }
    check(!/<script[^>]+src=/i.test(html), `${tag}/wp/${p}: no external script`);
    const styleAt = html.indexOf("<style>");
    const styleEnd = html.indexOf("</style>");
    check(
      styleAt !== -1 && styleEnd > styleAt && styleEnd - styleAt > 5000,
      `${tag}/wp/${p}: CSS inlined (${styleAt !== -1 && styleEnd > styleAt ? styleEnd - styleAt : 0} bytes)`
    );
    if (photoCount > 0) {
      check(/background-image:url\('data:image/.test(html), `${tag}/wp/${p}: hero inlined as data URI`);
    } else {
      check(!/<div class="hero-bg"/.test(html), `${tag}/wp/${p}: no hero photo block (business has none)`);
    }
    if (b.logo) {
      check(
        /<img class="brand-logo" src="data:image\//.test(html),
        `${tag}/wp/${p}: logo inlined as data URI`
      );
    } else {
      check(!/<img class="brand-logo"/.test(html), `${tag}/wp/${p}: no logo tag (none found)`);
    }
    const wbtn = html.match(/<a\s[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*>[\s\S]*?<\/a>/g) || [];
    check(wbtn.length === 1 && wbtn[0].includes(b.phone), `${tag}/wp/${p}: exactly one phone button`);
    check(!/gallery\.html/.test(html), `${tag}/wp/${p}: no gallery link`);
    check(html.includes("data-schedule="), `${tag}/wp/${p}: schedule present`);
    check(!html.includes('class="card"'), `${tag}/wp/${p}: no card tiles`);

    // every image/script reference must be a data URI, never a file path
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
    const fileRefs = refs.filter((s) => /\.(jpg|jpeg|png|webp|css|js)(\?|$)/i.test(s));
    check(
      fileRefs.length === 0,
      `${tag}/wp/${p}: ${refs.length} ref(s) inlined${fileRefs.length ? " EXTERNAL " + fileRefs.join(",") : ""}`
    );
    check(!/src=""/.test(html), `${tag}/wp/${p}: no empty src`);
    check(
      !noEmailRe.test(html),
      `${tag}/wp/${p}: no commentary about a missing email`
    );
    if (!b.email) {
      check(!/mailto:/i.test(html), `${tag}/wp/${p}: no email shown when business has none`);
    }
    if (photoCount === 0) {
      const wrefs = [...html.matchAll(/src="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((s) => /\.(jpg|jpeg|png|webp)$/i.test(s));
      check(wrefs.length === 0, `${tag}/wp/${p}: no photo tags when business has none`);
    }
  }

  // shared css must define this business's theme
  check(css.includes(`[data-theme="${b.theme}"]`), `${tag}: theme '${b.theme}' defined in site.css`);
}

// shared assets
check(fs.existsSync(path.join(SITES, "assets", "site.css")), "shared site.css");
check(fs.existsSync(path.join(SITES, "assets", "site.js")), "shared site.js");

// the public landing page must link every business's slug folder
const landing = fs.existsSync(path.join(ROOT, "index.html"))
  ? fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  : "";
for (const b of DATA) {
  check(
    landing.includes(`sites/${b.slug}/index.html`),
    `landing page links sites/${b.slug}/index.html`
  );
}

let o = 0, c = 0;
for (const ch of css) { if (ch === "{") o++; if (ch === "}") c++; }
check(o === c && o > 100, `site.css braces balanced (${o}/${c})`);
// pin-striping / background patterns are gone for good
const patterns = css.match(/--pattern:[^;]+;/g) || [];
check(
  patterns.every((p) => /:\s*none;/.test(p)),
  `site.css has no background patterns (${patterns.length} declared)`
);
check(!/url\(\s*['"]?images\//.test(css), "site.css has no document-relative image urls");

function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

console.log(`passed: ${ok.length}`);
if (fails.length) {
  console.log(`FAILED: ${fails.length}`);
  fails.forEach((f) => console.log("  x " + f));
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
