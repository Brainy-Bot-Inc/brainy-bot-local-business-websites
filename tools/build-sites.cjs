"use strict";

// ---------------------------------------------------------------------------
// Builds the multi-page sites: 4 pages per business, plus a self-contained
// copy of each page for pasting into a WordPress Custom HTML block.
//
//   node tools/build-sites.cjs
//
// Output
//   sites/<Business>/            index, services, about, contact
//   sites/<Business>/images/     curated photos + the business's own logo
//   sites/<Business>/wordpress/  one self-contained HTML file per page
//
// Images come from assets/<Business>/raw (photos) and assets/<Business>/logo.*
// (the business's real logo, when one could be found) and are assigned to
// roles (hero / feature). In the WordPress build they are inlined as data
// URIs so each file carries everything it needs.
// ---------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const DATA = require("./data.cjs");

const ROOT = path.join(__dirname, "..");
const SITES = path.join(ROOT, "sites");
const ASSETS = path.join(ROOT, "assets");

const SITE_CSS = fs.readFileSync(path.join(SITES, "assets", "site.css"), "utf8");
const SITE_JS = fs.readFileSync(path.join(SITES, "assets", "site.js"), "utf8");

const PAGES = [
  ["index", "Home"],
  ["services", "Services"],
  ["about", "About"],
  ["contact", "Contact"],
];

// Photo assignment per business: index into the harvested set. If a business
// has fewer photos than a slot needs, the list wraps - nothing breaks.
// `services` feeds the photo band on the services page, `contact` the banner
// on the contact page (the old about-page photo strip was dissolved into
// these slots).
const ROLES = {
  "Barkley's Jewelry and Pawn": { hero: 7, feature: 0, services: [14, 15], contact: 3 },
  "Ross Mobile Mechanic, LLC": { hero: 0, feature: 4, services: [1, 2], contact: 6 },
  "Key Home Improvements": { hero: 10, feature: 0, services: [1, 2], contact: 4 },
  "Kings Cupboard": { hero: 0, feature: 1, services: [2, 3], contact: null },
  "Sasquatch Services LLC": { hero: 0, feature: 1, services: [2, 0], contact: 2 },
  "Trapala Restaurant": { hero: 0, feature: 3, services: [8, 9], contact: 6 },
};

// Google Fonts per theme - the typefaces each business already uses on its
// own live site (or the closest fit for the trade). Offline, the system
// stacks declared in site.css take over.
const FONT_QUERY = {
  classic: "family=Sanchez",
  industrial: "family=Signika+Negative:wght@600;700&family=Nunito+Sans:wght@400;600;700",
  craft: "family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Almarai:wght@400;700",
  market: "family=Fraunces:opsz,wght@9..144,600;9..144,700",
  rugged: "family=Archivo+Black",
  fiesta: "family=Barlow:wght@500;700;800&family=Raleway:wght@400;600",
};

/* ----------------------------------------------------------------- hours -- */
const DAY_START = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };

function daysOf(label) {
  const day = (s) => DAY_START[s.toLowerCase().slice(0, 3)];
  const range = label.match(
    /^\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*-\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*$/i
  );
  if (range) {
    const a = day(range[1]);
    const z = day(range[2]);
    const out = [];
    for (let i = a; out.length <= 7; i = (i + 1) % 7) {
      out.push(i);
      if (i === z) break;
    }
    return out;
  }
  const single = label.match(/^\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*$/i);
  return single ? [day(single[1])] : null;
}

function timesOf(val) {
  if (/24\s*hours/i.test(val)) return { o: "00:00", c: "24:00" };
  const m = val.match(
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[-\u2013]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i
  );
  if (!m) return null;
  const to24 = (h, mm, ap) => {
    h = parseInt(h, 10);
    const p = ap.toLowerCase();
    if (p === "pm" && h !== 12) h += 12;
    if (p === "am" && h === 12) h = 0;
    return String(h).padStart(2, "0") + ":" + (mm || "00");
  };
  return { o: to24(m[1], m[2], m[3]), c: to24(m[4], m[5], m[6]) };
}

// Machine-readable weekly schedule for the live open/closed indicator.
// Non-day rows ("Estimates", "Holidays") are skipped.
function scheduleOf(b) {
  const out = [];
  for (const [label, val] of b.hours) {
    const days = daysOf(label);
    const t = days && timesOf(val);
    if (days && t) out.push({ d: days, o: t.o, c: t.c });
  }
  return out;
}

// No-JS fallback in the hero: the plain weekly summary, never a false "open".
function hoursSummary(b) {
  return b.hours
    .filter(([label]) => daysOf(label))
    .map(([label, val]) => label.replace(/([A-Za-z])[a-z]+/g, "$1") + " " + val)
    .join(", ");
}

/* ------------------------------------------------------------------ icons -- */
const ICON = {
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
  mail:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  wrench:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0 5 5l-9 9a2.8 2.8 0 0 1-4-4l9-9a4 4 0 0 0-1-1Z"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.6 7 .9-5 4.9 1.2 7L12 18l-6.2 3.4L7 14.4 2 9.5l7-.9Z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  chat:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z"/></svg>',
};
const SERVICE_ICONS = null; // icons now live only in the contact list

/* ------------------------------------------------------------------ utils -- */
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const pick = (list, i) => (list.length ? list[((i % list.length) + list.length) % list.length] : null);

const mimeOf = (p) =>
  /\.png$/i.test(p) ? "image/png" : /\.webp$/i.test(p) ? "image/webp" : "image/jpeg";

function dataUri(p) {
  return "data:" + mimeOf(p) + ";base64," + fs.readFileSync(p).toString("base64");
}

function collectPhotos(folder) {
  const dir = path.join(ASSETS, folder, "raw");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^img\d+\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))
    .map((f) => path.join(dir, f));
}

/* -------------------------------------------------------------- fragments -- */
function navBlock(b, current) {
  const links = PAGES.map(([slug, label]) => {
    const href = slug === "index" ? "index.html" : slug + ".html";
    const cur = slug === current ? ' aria-current="page"' : "";
    // a restaurant's "Services" page is its menu
    const text = slug === "services" ? b.servicesNavLabel || label : label;
    return `          <li><a href="${href}"${cur}>${text}</a></li>`;
  }).join("\n");
  return `
      <nav id="site-nav" class="site-nav" aria-label="Main">
        <ul>
${links}
        </ul>
      </nav>`;
}

function headerBlock(b, current) {
  const brandText = `
        <span class="brand-text">
          <strong>${esc(b.short)}</strong>
          <small>${esc(b.kind)}</small>
        </span>`;
  // The business's own logo when one was found; a styled monogram otherwise.
  const brand = b.logo
    ? `<img class="brand-logo" src="{{LOGO}}" alt="${esc(b.name)} logo">` +
      (b.logoStyle === "wordmark" ? "" : brandText)
    : `<span class="brand-mark" aria-hidden="true">${esc(b.monogram)}</span>` + brandText;
  return `
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="index.html">${brand}
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>${navBlock(b, current)}
    </div>
  </header>`;
}

function footerBlock(b) {
  const svcLabel = b.servicesNavLabel || "Services";
  const hours = b.hours
    .map(([d, h]) => `            <li><span>${esc(d)}</span> &nbsp;${esc(h)}</li>`)
    .join("\n");
  // No email on file? Then simply show none - no note about its absence.
  const emailRow = b.email
    ? `            <li><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></li>`
    : "";
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="footer-brand" href="index.html">
            <span class="brand-mark" aria-hidden="true">${esc(b.monogram)}</span>
            <strong>${esc(b.short)}</strong>
          </a>
          <p>${esc(b.tagline)}</p>
        </div>
        <div>
          <h4>Visit us</h4>
          <ul>
            <li>${esc(b.address)}</li>
            <li>${esc(b.cityLine)}</li>
            <li><a href="${b.phoneHref}">${esc(b.phone)}</a></li>
${emailRow}
          </ul>
        </div>
        <div>
          <h4>Opening hours</h4>
          <ul>
${hours}
          </ul>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="services.html">${svcLabel}</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} ${esc(b.name)}. All rights reserved.</span>
        <span>${esc(b.city)}</span>
      </div>
    </div>
  </footer>`;
}

// Exactly one button on the page: the primary call button in the hero,
// showing the phone number and nothing else.
function heroBlock(b, o) {
  const opts = Object.assign(
    { compact: false, title: null, lead: null, eyebrow: null, meta: true, actions: true },
    o || {}
  );
  const meta = opts.meta
    ? `
        <ul class="hero-meta">
          <li>${ICON.pin}<span>${esc(b.address)}, ${esc(b.cityLine)}</span></li>
          <li class="hours-live" data-hours-status>${ICON.clock}<span class="hours-live-text">${esc(hoursSummary(b))}</span></li>
        </ul>`
    : "";
  const actions = opts.actions
    ? `
        <div class="hero-actions">
          <a class="btn btn-primary" href="${b.phoneHref}">${ICON.phone}<span>${esc(b.phone)}</span></a>
        </div>`
    : "";
  return `
    <section class="hero${opts.compact ? " compact" : ""}">
      {{HERO_BG}}
      <div class="wrap">
        <span class="eyebrow">${esc(opts.eyebrow || b.kind)}</span>
        <h1>${esc(opts.title || b.name)}</h1>
        <p class="lead">${esc(opts.lead || b.tagline)}</p>${actions}${meta}
      </div>
    </section>`;
}

function sectionHead(kicker, title, text, left) {
  return `<div class="section-head${left ? " left" : ""}">
          <span class="kicker">${esc(kicker)}</span>
          <h2>${esc(title)}</h2>
          ${text ? `<p>${esc(text)}</p>` : ""}
        </div>`;
}

const faqBlock = (b) =>
  `        <div class="faq">\n` +
  b.faqs
    .map(([q, a]) => `          <details>\n            <summary>${esc(q)}</summary>\n            <p>${esc(a)}</p>\n          </details>`)
    .join("\n") +
  `\n        </div>`;

/* ------------------------------------------------------------------ pages -- */
function pageHome(b) {
  const stats = b.highlights
    .map(([v, l]) => `          <div class="stat"><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`)
    .join("\n");

  const services = b.services
    .slice(0, 6)
    .map(
      ([t, d]) =>
        `          <div class="svc-row">\n            <h3>${esc(t)}</h3>\n            <p>${esc(d)}</p>\n          </div>`
    )
    .join("\n");

  // Real reviews with real names, exactly as published by the customers.
  const quotes = b.reviews
    .map(([q, who, stars]) => {
      const n = stars == null ? 0 : Math.max(0, Math.min(5, stars));
      const starRow = n
        ? `            <div class="stars" aria-label="${n} out of 5 stars">${"&#9733;".repeat(n)}${"&#9734;".repeat(5 - n)}</div>\n`
        : "";
      return `          <figure class="quote">\n${starRow}            <blockquote>${esc(q)}</blockquote>\n            <figcaption>${esc(who)}</figcaption>\n          </figure>`;
    })
    .join("\n");

  const checks = b.services
    .slice(0, 4)
    .map(([t]) => `              <li>${ICON.check}<span>${esc(t)}</span></li>`)
    .join("\n");

  return {
    title: b.name,
    desc: `${b.name} - ${b.tagline}. Located in ${b.city}.`,
    body: `${heroBlock(b, {})}
    <section class="section alt">
      <div class="wrap">
        <div class="stats">
${stats}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        ${sectionHead("What we do", b.servicesTitle, b.servicesIntro)}
        <div class="svc-list">
${services}
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="wrap">
        <div class="split${b.reverseSplit ? " reverse" : ""}">
          {{FEATURE_FIGURE}}
          <div>
            <span class="kicker">About ${esc(b.short)}</span>
            <h2>${esc(b.tagline)}</h2>
            <p>${esc(b.about)}</p>
            <ul class="check-list">
${checks}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        ${sectionHead("Reviews", b.reviewsTitle)}
        <div class="quotes">
${quotes}
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="wrap">
        ${sectionHead("Questions", "Good to know")}
${faqBlock(b)}
      </div>
    </section>`,
  };
}

function pageServices(b) {
  const services = b.services
    .map(
      ([t, d]) =>
        `          <div class="svc-row">\n            <h3>${esc(t)}</h3>\n            <p>${esc(d)}</p>\n          </div>`
    )
    .join("\n");

  const steps = b.process.steps
    .map(([t, d]) => `          <div class="step">\n            <h3>${esc(t)}</h3>\n            <p>${esc(d)}</p>\n          </div>`)
    .join("\n");

  return {
    title: `${b.servicesNavLabel || "Services"} - ${b.name}`,
    desc: `${b.name} ${(b.servicesNavLabel || "Services").toLowerCase()} in ${b.city}. ${b.tagline}.`,
    body: `${heroBlock(b, { compact: true, title: b.servicesPageTitle || "Our services", lead: b.servicesLead, meta: false })}
    <section class="section">
      <div class="wrap">
        <div class="svc-list">
${services}
        </div>
      </div>
    </section>

{{PHOTO_BAND}}
    <section class="section alt">
      <div class="wrap">
        ${sectionHead("How it works", b.process.title, b.process.text)}
        <div class="steps">
${steps}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        ${sectionHead("FAQ", "Common questions")}
${faqBlock(b)}
      </div>
    </section>`,
  };
}

function pageAbout(b) {
  const values = b.values
    .map(
      ([t, d]) =>
        `          <article class="value">\n            <h3>${esc(t)}</h3>\n            <p>${esc(d)}</p>\n          </article>`
    )
    .join("\n");

  return {
    title: `About - ${b.name}`,
    desc: `About ${b.name} - ${b.tagline}.`,
    body: `${heroBlock(b, { compact: true, title: "About us", meta: false })}
    <section class="section">
      <div class="wrap">
        <div class="split reverse">
          {{FEATURE_FIGURE}}
          <div>
            <span class="kicker">Our story</span>
            <h2>${esc(b.storyTitle)}</h2>
            <p>${esc(b.about)}</p>
            <p>${esc(b.contactNote)}</p>
            <ul class="check-list">
              <li>${ICON.check}<span>${esc(b.hours[0][0])}: ${esc(b.hours[0][1])}</span></li>
              <li>${ICON.check}<span>${esc(b.address)}, ${esc(b.cityLine)}</span></li>
              <li>${ICON.check}<span>${esc(b.phone)}${b.phoneAlt ? " / " + esc(b.phoneAlt) : ""}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="wrap">
        ${sectionHead("What we stand for", "The way we do business")}
        <div class="values-list">
${values}
        </div>
      </div>
    </section>`,
  };
}

function pageContact(b) {
  const hours = b.hours
    .map(([d, h]) => `                <tr><th scope="row">${esc(d)}</th><td>${esc(h)}</td></tr>`)
    .join("\n");

  const emailLi = b.email
    ? `
              <li>
                <span class="icon-badge">${ICON.mail}</span>
                <div><strong>Email</strong><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></div>
              </li>`
    : "";

  const altPhone = b.phoneAlt
    ? `<div style="font-size:.9rem;color:var(--muted)">Alt: <a href="tel:${b.phoneAlt.replace(/[^0-9+]/g, "")}">${esc(b.phoneAlt)}</a></div>`
    : "";

  return {
    title: `Contact - ${b.name}`,
    desc: `Contact ${b.name} - ${b.address}, ${b.cityLine}. Phone ${b.phone}.`,
    body: `${heroBlock(b, { compact: true, title: b.contactTitle, meta: false })}
    <section class="section">
      <div class="wrap">
{{CONTACT_FIG}}
        <div class="contact-grid">
          <div class="panel">
            <h2 style="font-size:1.35rem">Contact details</h2>
            <ul class="contact-list">
              <li>
                <span class="icon-badge">${ICON.phone}</span>
                <div><strong>Phone</strong><a href="${b.phoneHref}">${esc(b.phone)}</a>${altPhone}</div>
              </li>
              <li>
                <span class="icon-badge">${ICON.pin}</span>
                <div><strong>Address</strong><span class="val">${esc(b.address)}<br>${esc(b.cityLine)}</span></div>
              </li>${emailLi}
            </ul>
            <div class="notice" style="margin-top:22px">${ICON.info}<p>${esc(b.contactNote)}</p></div>
          </div>

          <div class="panel">
            <h2 style="font-size:1.35rem">Opening hours</h2>
            <table class="hours">
              <tbody>
${hours}
              </tbody>
            </table>
          </div>

          <div class="panel">
            <h2 style="font-size:1.35rem">Send a message</h2>
            <form data-contact-form>
              <div class="field">
                <label for="cf-name">Your name</label>
                <input id="cf-name" name="name" type="text" autocomplete="name" required>
              </div>
              <div class="field">
                <label for="cf-contact">Phone or email</label>
                <input id="cf-contact" name="contact" type="text" autocomplete="tel" required>
              </div>
              <div class="field">
                <label for="cf-msg">How can we help?</label>
                <textarea id="cf-msg" name="message" required></textarea>
              </div>
              <button class="btn btn-primary btn-block" type="submit">Send message</button>
              <p class="form-note" data-form-status tabindex="-1" hidden></p>
              <p class="form-note">Prefer to talk? Call <a href="${b.phoneHref}">${esc(b.phone)}</a>.</p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="wrap">
        ${sectionHead("FAQ", "Before you call")}
${faqBlock(b)}
      </div>
    </section>`,
  };
}

/* --------------------------------------------------------------- assembly -- */
function render(b, page, photos, mode) {
  const builder = {
    index: pageHome,
    services: pageServices,
    about: pageAbout,
    contact: pageContact,
  }[page];

  const outPage = builder(b);

  const roles = ROLES[b.name] || {};
  const heroPath = photos.length ? pick(photos, roles.hero || 0) : null;
  const featurePath = photos.length ? pick(photos, roles.feature == null ? 1 : roles.feature) : null;
  const svcPaths = ((roles.services || []).map((i) => pick(photos, i))).filter(Boolean);
  const contactPath = roles.contact == null ? null : pick(photos, roles.contact);

  const urlOf = (p) => (mode === "wp" ? dataUri(p) : "images/" + path.basename(p));

  let doc = `${headerBlock(b, page)}
  <main id="main">
${outPage.body}
  </main>
${footerBlock(b)}`;

  // The business's own logo: a real file in pages mode, a data URI in the
  // self-contained WordPress copy.
  if (b.logo) {
    const logoPath = path.join(SITES, b.name, "images", b.logo);
    doc = doc.replace("{{LOGO}}", urlOf(logoPath));
  }
  doc = doc.replace(/\{\{LOGO\}\}/g, "");

  // Feature photo. A business with no usable photos simply gets no figure -
  // never an empty <img>, and never a photo belonging to somebody else.
  if (featurePath) {
    doc = doc.replace(
      "{{FEATURE_FIGURE}}",
      `<figure><img src="${urlOf(featurePath)}" alt="${esc(b.name)} in ${esc(
        b.city
      )}" width="1200" height="800"></figure>`
    );
  }
  doc = doc.replace(/\{\{FEATURE_FIGURE\}\}/g, "").replace(/\{\{FEATURE\}\}/g, "");

  // Photos moved off the old about-page strip: a band on the services page
  // and a banner on the contact page.
  const bandFigs = svcPaths
    .map(
      (p) =>
        `          <figure><img src="${urlOf(p)}" alt="${esc(b.name)}, ${esc(
          b.city
        )}" loading="lazy" width="1200" height="800"></figure>`
    )
    .join("\n");
  const band = svcPaths.length
    ? `    <section class="section tight">\n      <div class="wrap">\n        <div class="photo-band">\n${bandFigs}\n        </div>\n      </div>\n    </section>`
    : "";
  doc = doc.replace(/\{\{PHOTO_BAND\}\}\s*/g, band);

  const contactFig = contactPath
    ? `        <figure class="contact-photo">\n          <img src="${urlOf(
        contactPath
      )}" alt="${esc(b.name)}, ${esc(b.city)}" loading="lazy" width="1200" height="800">\n        </figure>\n\n`
    : "";
  doc = doc.replace(/\{\{CONTACT_FIG\}\}\s*/g, contactFig);

  doc = doc.replace(/\{\{G(\d+)\}\}/g, (m, i) => {
    const p = photos[parseInt(i, 10)];
    return p ? urlOf(p) : "";
  });
  doc = doc.replace(/\{\{F(\d+)\}\}/g, (m, i) => {
    const p = photos[parseInt(i, 10)];
    return p ? urlOf(p) : "";
  });

  if (heroPath) {
    doc = doc.replace(
      "{{HERO_BG}}",
      `<div class="hero-bg" style="background-image:url('${urlOf(heroPath)}')"></div>`
    );
  } else {
    doc = doc.replace(/\{\{HERO_BG\}\}\s*/g, "");
  }

  const css =
    mode === "wp" ? `<style>\n${SITE_CSS}\n</style>` : `<link rel="stylesheet" href="../assets/site.css">`;
  const js =
    mode === "wp" ? `<script>\n${SITE_JS}\n</script>` : `<script src="../assets/site.js" defer></script>`;
  // Researched typefaces for this theme (system stacks take over offline).
  const fontLink =
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?${FONT_QUERY[b.theme]}&display=swap">`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(outPage.title === b.name ? b.name : outPage.title + " | " + b.short)}</title>
  <meta name="description" content="${esc(outPage.desc)}">
  ${css}
${fontLink}
</head>
<body data-theme="${b.theme}" data-logo="${b.logoStyle || "mark"}" data-tz="America/Los_Angeles" data-schedule="${esc(JSON.stringify(scheduleOf(b)))}" style="--accent:${b.accent};--accent-dark:${b.accentDark}">
${doc}
  ${js}
</body>
</html>
`;
}

/* ------------------------------------------------------------ docs (md) --- */
function readmeMd(b) {
  const rows = [
    "| Category | " + b.tagline + " |",
    "| Location | " + b.address + ", " + b.cityLine + " |",
    "| Phone | " + b.phone + (b.phoneAlt ? " / " + b.phoneAlt : "") + " |",
    ...(b.email ? ["| Email | " + b.email + " |"] : []),
    "| Hours | " + b.hours.map(([d, h]) => d + ": " + h).join("; ").replace(/\|/g, "\\|") + " |",
    "| Website status | **" + b.websiteStatus + "** |",
    "| Website | " + (b.website || "_none_") + " |",
  ];
  return [
    "# " + b.name,
    "",
    "| Field | Value |",
    "| --- | --- |",
    ...rows,
    "",
    "## Pages",
    "",
    "| File | Purpose |",
    "| --- | --- |",
    "| `index.html` | Home - hero, highlights, services, reviews, FAQ |",
    "| `services.html` | " + (b.servicesNavLabel || "Services") + " - full list, process, photos, FAQ |",
    "| `about.html` | Story and values |",
    "| `contact.html` | Contact details, photo, hours, enquiry form |",
    "",
    "Shared: `images/` (photos and logo), `../assets/site.css`, `../assets/site.js`.",
    "",
    "## WordPress",
    "",
    "`wordpress/` holds the same four pages as **self-contained files** - CSS, JS and",
    "images all inlined as data URIs. Open one, copy everything, paste into a",
    "WordPress **Custom HTML** block. Nothing else needs uploading.",
    "",
    "## Website status",
    "",
    b.websiteNote,
    "",
    "## Contact notes",
    "",
    b.contactNote,
    "",
    "## About",
    "",
    b.about,
    "",
    "## Services",
    "",
    ...b.services.map(([t, d]) => "- **" + t + "** - " + d),
    "",
    "## Rebuild",
    "",
    "```",
    "node tools/build-sites.cjs",
    "```",
    "",
    "Research and source URLs: `../real-businesses.md`. Business details came from",
    "public directories and should be confirmed with the owner before publishing.",
    "",
  ].join("\n");
}

function emailMd(b) {
  const hasSite = b.websiteStatus !== "NO WEBSITE" && b.websiteStatus !== "NO LIVE SITE";
  const opening = hasSite
    ? `I came across ${b.name} while researching businesses in ${b.city} and took a look at your online presence.`
    : `I was looking for local businesses in ${b.city} and noticed ${b.name} does not have a website yet.`;
  const pitch = hasSite
    ? "You have the basics covered, but there is room to grow - a faster, mobile-first site that ranks in search and turns visitors into calls. I build that kind of site for local businesses."
    : "That matters more than it used to - most people search online before they call, and right now you are invisible to that traffic. I build clean, mobile-friendly websites for local businesses, and I would like to build yours.";
  return [
    "# Email Draft for " + b.name,
    "",
    "## Contact",
    "",
    "- Phone: " + b.phone + (b.phoneAlt ? " / " + b.phoneAlt : ""),
    ...(b.email ? ["- Email: " + b.email] : []),
    "- Website status: **" + b.websiteStatus + "**",
    b.website ? "- Current site: " + b.website : "- Current site: none",
    "",
    "## Subject",
    "",
    "A website for " + b.name + " - $500, done in a week",
    "",
    "## Body",
    "",
    "Hi [First Name],",
    "",
    opening,
    "",
    pitch,
    "",
    "For a one-time $500 you get a complete, mobile-responsive site with your contact details, services, hours, location and a clear way for customers to reach you. No contracts, no monthly fees - you own it.",
    "",
    "I have already put together a working preview for " + b.name + " so you can see exactly what you would be getting.",
    "",
    "Worth a 10-minute call this week?",
    "",
    "Best,",
    "[Your Name]",
    "[Your Phone Number]",
    "[Your Email / Website]",
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ main --- */
function main() {
  let built = 0;

  for (const b of DATA) {
    const outDir = path.join(SITES, b.name);
    const imgDir = path.join(outDir, "images");
    const wpDir = path.join(outDir, "wordpress");

    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(imgDir, { recursive: true });
    fs.mkdirSync(wpDir, { recursive: true });

    const photos = collectPhotos(b.name).map((src, i) => {
      const dest = path.join(imgDir, `photo-${String(i).padStart(2, "0")}${path.extname(src).toLowerCase()}`);
      fs.copyFileSync(src, dest);
      return dest;
    });

    // The business's real logo, when one was found.
    if (b.logo) {
      const logoSrc = path.join(ASSETS, b.name, b.logo);
      if (!fs.existsSync(logoSrc)) {
        throw new Error(`missing logo for ${b.name}: ${logoSrc}`);
      }
      fs.copyFileSync(logoSrc, path.join(imgDir, b.logo));
    }

    for (const [page] of PAGES) {
      fs.writeFileSync(path.join(outDir, page + ".html"), render(b, page, photos, "pages"), "utf8");
      fs.writeFileSync(path.join(wpDir, page + ".html"), render(b, page, photos, "wp"), "utf8");
      built += 2;
    }
    fs.writeFileSync(path.join(outDir, "README.md"), readmeMd(b), "utf8");
    fs.writeFileSync(path.join(outDir, "email.md"), emailMd(b), "utf8");
    console.log(`  ${b.name}: ${photos.length} photos, 4 pages (x2)${b.logo ? ", logo" : ""}`);
  }

  console.log(`built ${built} pages`);
}

main();
