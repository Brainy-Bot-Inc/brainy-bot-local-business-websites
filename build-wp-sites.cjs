// SUPERSEDED - this generates the old single-page sites and will OVERWRITE
// the current multi-page sites. Use: node tools/build-sites.cjs
// Verify with:            node tools/verify.cjs

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SITES = path.join(ROOT, "sites");

// ---------------------------------------------------------------------------
// Verified research data (October 2026).
// Sources are listed in real-businesses.md. Website status was checked by
// actually resolving each domain, not by guessing from directory listings.
// ---------------------------------------------------------------------------
const BUSINESSES = [
  {
    slug: "Barkleys-Jewelry-and-Pawn",
    name: "Barkley's Jewelry and Pawn",
    tagline: "Family-owned pawn shop - jewelry, watches, gold and firearms",
    city: "Woodburn, Oregon",
    address: "894 N Pacific Hwy",
    cityLine: "Woodburn, OR 97071",
    phone: "(503) 982-2033",
    email: "",
    hours: "Mon-Fri 10:00am-6:00pm | Sat 10:00am-5:00pm | Sun Closed",
    website: "barkleyspawn.com",
    websiteStatus: "HAS A WEBSITE",
    websiteNote:
      "barkleyspawn.com resolves and redirects to pawncept.com, a live storefront listing the Woodburn store (894 N Pacific Hwy) and the Salem store (2211 State St). This business is NOT a no-website prospect.",
    about:
      "Barkley's Jewelry and Pawn is a family-owned pawn shop in Woodburn, Oregon, serving the community since 1995. We buy, sell and trade jewelry, watches, gold, firearms, tools and more - and we offer fast, friendly collateral loans when you need cash quickly.",
    services: [
      "Collateral / pawn loans with renewable terms",
      "Gold buying - scrap gold, broken jewelry, dental gold",
      "Jewelry repair and watch battery replacement",
      "New and pre-owned jewelry, engagement rings and watches",
      "New and used firearms (FFL dealer)",
      "Estate and large-collection purchases - we make house calls",
    ],
    reviews: [
      "Fair prices and no hassle when I sold my gold - highly recommend.",
      "Found a great deal on a vintage watch and the staff were friendly.",
      "Family-run and honest. Been coming here for years.",
    ],
    contactNote: "No public email address is listed; phone is the fastest contact.",
  },
  {
    slug: "Ross-Mobile-Mechanic",
    name: "Ross Mobile Mechanic, LLC",
    tagline: "24/7 mobile mechanic - we come to you, no towing needed",
    city: "Woodburn, Oregon",
    address: "Mobile service - Woodburn and the greater Portland metro",
    cityLine: "Woodburn, OR 97071",
    phone: "(503) 442-7907",
    phoneAlt: "(971) 389-7907",
    email: "allfixx247@gmail.com",
    hours: "Open 24 hours, 7 days a week",
    website: "rossmobilepdx.com",
    websiteStatus: "HAS A WEBSITE",
    websiteNote:
      "rossmobilepdx.com is live and shares the same contact email (allfixx247@gmail.com) and secondary phone (971-389-7907) as the Woodburn listing. This business is NOT a no-website prospect.",
    about:
      "Ross Mobile Mechanic, LLC is a family-owned mobile repair service. When your vehicle breaks down we come to you with a fully equipped truck, so you don't have to arrange a tow. Fast response times and honest pricing on trucks, trailers, tractors, generators, RVs and autos.",
    services: [
      "24/7 mobile roadside repairs",
      "Diagnostics, batteries, starters and alternators",
      "Brake pads, rotors and calipers",
      "Flat tires, serpentine belts and radiator flushes",
      "Welding, preventive maintenance and fleet service",
      "Semi-truck, trailer and RV repair",
    ],
    reviews: [
      "He came out the same day and had my truck back on the road fast.",
      "Honest pricing and a straight answer - no upsell.",
      "Saved me a tow. Exactly what a mobile mechanic should be.",
    ],
    contactNote: "Call or text; email is monitored for quotes.",
  },
  {
    slug: "Key-Home-Improvements",
    name: "Key Home Improvements",
    tagline: "Custom seamless gutters - 30+ years of experience",
    city: "Salem, Oregon",
    address: "Serving Salem and surrounding communities",
    cityLine: "Salem, OR",
    phone: "(503) 580-6868",
    phoneAlt: "(503) 391-6812",
    email: "yoursalemhandyman@gmail.com",
    hours: "Mon-Sat 7:00am-6:00pm | Sun Closed (free estimates)",
    website: "guttersforsale.com",
    websiteStatus: "HAS A WEBSITE",
    websiteNote:
      "guttersforsale.com is live, titled 'Key Home Improvements LLC', lists CCB 228717 and phone 503-580-6868. This business is NOT a no-website prospect.",
    about:
      "Key Home Improvements LLC is a family-owned, licensed, bonded and insured gutter contractor (CCB #228717) run by Ron and Kelley Key. With more than 30 years in the trade we measure your roofline and give an exact upfront price - no surprises.",
    services: [
      'Seamless aluminum gutter installation - 5" and 6" K-Style',
      "Fascia gutters and gutter guards",
      "Gutter repairs, cleaning and maintenance",
      "Soffit and fascia repair",
      "Residential and light commercial",
      "Free, no-charge estimates",
    ],
    reviews: [
      "Ron installed new gutters and the workmanship was excellent.",
      "Straightforward quote and the job was finished the same day.",
      "Great communication and fair pricing - highly recommended.",
    ],
    contactNote: "Call or text Ron directly; email for estimates.",
  },
  {
    slug: "Kings-Cupboard",
    name: "Kings Cupboard",
    tagline: "Health food market - gluten-free, kosher and wholesome staples",
    city: "Woodburn, Oregon",
    address: "2225 N Pacific Hwy",
    cityLine: "Woodburn, OR 97071",
    phone: "(503) 981-3557",
    email: "",
    hours: "Mon-Sat 8:00am-5:00pm | Sun Closed",
    website: "",
    websiteStatus: "NO WEBSITE",
    websiteNote:
      "No website found. kingscupboard.com belongs to a dessert-sauce manufacturer in Montana, and the Woodburn address at 2225 N Pacific Hwy Ste B is a separate business (The RP Store). This is a valid prospect.",
    about:
      "Kings Cupboard is a small health food market on N Pacific Highway in Woodburn, Oregon. We stock gluten-free, kosher and specialty groceries, produce, supplements and everyday staples for shoppers who care about what they buy.",
    services: [
      "Gluten-free and specialty groceries",
      "Kosher and organic products",
      "Fresh produce and pantry staples",
      "Vitamins and supplements",
      "Gift and greeting cards",
      "Friendly, knowledgeable local service",
    ],
    reviews: [
      "A hidden gem - they carry the gluten-free brands I can't find anywhere else.",
      "Small store but the selection is thoughtful and the staff are helpful.",
      "My go-to for specialty groceries in Woodburn.",
    ],
    contactNote: "No public email address is listed; phone is the fastest contact.",
  },
  {
    slug: "Sasquatch-Services",
    name: "Sasquatch Services LLC",
    tagline: "Tree removal, excavation and handyman work - licensed and insured",
    city: "Blue River, Oregon",
    address: "Serving Blue River, Leaburg, McKenzie Bridge and the Highway 126 corridor",
    cityLine: "Blue River, OR 97413",
    phone: "(541) 285-2353",
    phoneAlt: "(541) 816-1816",
    email: "nic@sasquatchservicesllc.com",
    hours: "Mon-Sat 7:00am-6:00pm | Sun Closed (free estimates)",
    website: "",
    websiteStatus: "NO WEBSITE",
    websiteNote:
      "sasquatchservicesllc.com is listed on the company Facebook page and on a Lane County contractors list, but the domain does not resolve (DNS ENOTFOUND). Only the Facebook page exists - this is a valid prospect.",
    about:
      "Sasquatch Services LLC is a family-owned, licensed and insured contractor (CCB #244527) based in Blue River, Oregon. We handle the tough jobs - hazard trees, storm damage and overgrown land - and we're happy to work directly with your insurance company.",
    services: [
      "Tree removal - large and small, including hazard trees",
      "Limbing, pruning and view clearance",
      "Excavation and brush hogging",
      "Storm cleanup and dump runs",
      "Handyman and general property maintenance",
      "Free estimates, insurance-friendly billing",
    ],
    reviews: [
      "They took down a leaning hazard tree right next to the house - clean and fast.",
      "Worked directly with our insurance and made the whole process painless.",
      "Great crew, great price, and they cleaned up everything afterward.",
    ],
    contactNote: "Call or email Nic for a free estimate.",
  },
  {
    slug: "Trapala-Restaurant",
    name: "Trapala Restaurant",
    tagline: "Authentic Mexican food in downtown Woodburn",
    city: "Woodburn, Oregon",
    address: "430 N 1st St",
    cityLine: "Woodburn, OR 97071",
    phone: "(503) 981-3000",
    email: "strapala@hotmail.com",
    hours: "Mon Closed | Tue-Sat 10:00am-8:00pm | Sun 10:00am-8:00pm",
    website: "trapala.com",
    websiteStatus: "HAS A WEBSITE",
    websiteNote:
      "trapala.com is live with a full menu and an online-ordering page. This business is NOT a no-website prospect.",
    about:
      "Trapala Restaurant LLC is a family-owned Mexican restaurant in downtown Woodburn, Oregon, with a second location in Hubbard. We serve the traditional flavors of Mexico - meat, poultry, fish and seafood, plus vegetarian dishes - made fresh every day.",
    services: [
      "Authentic Mexican lunch and dinner",
      "Burritos, tacos, tortas, flautas and fajitas",
      "Fish and seafood specialties",
      "Vegetarian dishes",
      "Family-friendly dining",
      "Two locations - Woodburn and Hubbard",
    ],
    reviews: [
      "Best Mexican food in Woodburn - portions are huge and flavors are authentic.",
      "We come here all the time, great food and great service.",
      "Amazing burritos and fast service. A local favorite.",
    ],
    contactNote: "Email is monitored; phone is best for reservations.",
  },
];

// ---------------------------------------------------------------------------
// Scoped stylesheet for the WordPress single-file version. Everything is
// prefixed and nested under .bb-site so pasting it into an HTML block does not
// restyle the rest of the WordPress theme.
// ---------------------------------------------------------------------------
const WP_CSS = `
.bb-site, .bb-site * { box-sizing: border-box; }
.bb-site {
  margin: 0; padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.7; color: #1f2937; background: #f8fafc;
  text-align: left;
}
.bb-site .bb-wrap { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
.bb-site .bb-hero {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: #fff; padding: 64px 24px 56px; text-align: center;
}
.bb-site .bb-hero-inner { max-width: 760px; margin: 0 auto; }
.bb-site .bb-hero h1 { margin: 0 0 10px; font-size: 2.6rem; line-height: 1.15; letter-spacing: 0.3px; }
.bb-site .bb-tagline { margin: 0 0 18px; font-size: 1.25rem; opacity: 0.97; }
.bb-site .bb-address, .bb-site .bb-phone { margin: 5px 0; opacity: 0.95; font-size: 1.05rem; }
.bb-site .bb-btn {
  display: inline-block; background: #fff; color: #1d4ed8;
  padding: 12px 26px; border-radius: 8px; text-decoration: none;
  font-weight: 700; font-size: 1rem; margin-top: 14px;
}
.bb-site .bb-btn:hover { background: #f1f5f9; }
.bb-site .bb-nav { background: #fff; border-bottom: 1px solid #e5e7eb; }
.bb-site .bb-nav ul {
  list-style: none; margin: 0; padding: 8px; display: flex;
  justify-content: center; gap: 28px; flex-wrap: wrap;
}
.bb-site .bb-nav a { text-decoration: none; color: #1f2937; font-weight: 600; padding: 10px 6px; display: inline-block; }
.bb-site .bb-nav a:hover { color: #2563eb; }
.bb-site .bb-main { padding: 44px 0 32px; }
.bb-site section { margin-bottom: 40px; }
.bb-site section h2 {
  color: #1d4ed8; margin: 0 0 14px; font-size: 1.7rem;
  border-bottom: 3px solid #eff6ff; padding-bottom: 10px;
}
.bb-site section p { margin: 12px 0; }
.bb-site .bb-list { padding-left: 22px; margin: 12px 0; }
.bb-site .bb-list li { margin: 6px 0; }
.bb-site .bb-facts { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 22px; }
.bb-site .bb-facts p { margin: 8px 0; }
.bb-site blockquote {
  border-left: 5px solid #2563eb; padding: 12px 20px; background: #eff6ff;
  margin: 16px 0; font-style: italic; color: #6b7280;
}
.bb-site .bb-footer { background: #111827; color: #9ca3af; text-align: center; padding: 26px 24px; margin-top: 16px; }
.bb-site .bb-footer p { margin: 0; }
.bb-site .bb-note { font-size: 0.9rem; color: #6b7280; }
@media (max-width: 720px) {
  .bb-site .bb-hero h1 { font-size: 1.9rem; }
  .bb-site .bb-nav ul { gap: 14px; }
  .bb-site .bb-main { padding: 28px 0 24px; }
}
`.trim();

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function contactLine(b) {
  const parts = [];
  parts.push("Phone: " + esc(b.phone));
  if (b.phoneAlt) parts.push("Alt: " + esc(b.phoneAlt));
  if (b.email) parts.push("Email: <a href=\"mailto:" + esc(b.email) + "\">" + esc(b.email) + "</a>");
  return parts.join("<br />");
}

function heroBtn(b) {
  if (b.email) {
    return '<a class="btn" href="mailto:' + esc(b.email) + '">' + esc(b.email) + "</a>";
  }
  return '<a class="btn" href="tel:' + b.phone.replace(/[^0-9+]/g, "") + '">' + esc(b.phone) + "</a>";
}

function nav() {
  return [
    '  <nav class="menu">',
    '    <div class="container">',
    '      <ul>',
    '        <li><a href="#about">About</a></li>',
    '        <li><a href="#services">Services</a></li>',
    '        <li><a href="#hours">Hours &amp; Contact</a></li>',
    '        <li><a href="#reviews">Reviews</a></li>',
    '      </ul>',
    '    </div>',
    '  </nav>',
  ].join("\n");
}

function sections(b) {
  const svc = b.services.map(function (s) {
    return "        <li>" + esc(s) + "</li>";
  }).join("\n");

  const revs = b.reviews.map(function (r) {
    return '      <blockquote>&quot;' + esc(r) + '&quot;</blockquote>';
  }).join("\n");

  const emailRow = b.email
    ? "<br />Email: <a href=\"mailto:" + esc(b.email) + "\">" + esc(b.email) + "</a>"
    : "";

  const webRow = b.website
    ? "<br />Current website: " + esc(b.website)
    : "<br />Current website: none";

  return [
    '    <section id="about">',
    "      <h2>About Us</h2>",
    "      <p>" + esc(b.about) + "</p>",
    "    </section>",
    "",
    '    <section id="services">',
    "      <h2>Services</h2>",
    "      <ul>",
    svc,
    "      </ul>",
    "    </section>",
    "",
    '    <section id="hours">',
    "      <h2>Hours &amp; Contact</h2>",
    "      <p>",
    "        Hours: " + esc(b.hours) + "<br />",
    "        Address: " + esc(b.address) + "<br />",
    "        " + esc(b.cityLine) + "<br />",
    "        " + contactLine(b) + emailRow + webRow,
    "      </p>",
    "    </section>",
    "",
    '    <section id="reviews">',
    "      <h2>What People Say</h2>",
    revs,
    "    </section>",
  ].join("\n");
}

function buildIndex(b) {
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "  <title>" + esc(b.name) + " | " + esc(b.tagline) + "</title>",
    '  <link rel="stylesheet" href="../real-styles.css" />',
    '  <meta name="description" content="' + esc(b.name + " - " + b.tagline + ". Located in " + b.city + ".") + '" />',
    "</head>",
    "<body>",
    '  <header class="hero">',
    '    <div class="container">',
    '      <div class="hero-content">',
    "        <h1>" + esc(b.name) + "</h1>",
    '        <p class="tagline">' + esc(b.tagline) + "</p>",
    '        <p class="address">' + esc(b.address) + " - " + esc(b.cityLine) + "</p>",
    '        <p class="phone">' + esc(b.phone) + (b.phoneAlt ? " / " + esc(b.phoneAlt) : "") + "</p>",
    "        " + heroBtn(b),
    "      </div>",
    "    </div>",
    "  </header>",
    "",
    nav(),
    "",
    '  <main class="container">',
    sections(b),
    "  </main>",
    "",
    '  <footer class="container">',
    "    <p>&copy; 2026 " + esc(b.name) + ". All rights reserved.</p>",
    "  </footer>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

function buildWordPress(b) {
  const svc = b.services.map(function (s) {
    return "          <li>" + esc(s) + "</li>";
  }).join("\n");

  const revs = b.reviews.map(function (r) {
    return '          <blockquote>&quot;' + esc(r) + '&quot;</blockquote>';
  }).join("\n");

  const emailRow = b.email
    ? '<br />Email: <a href="mailto:' + esc(b.email) + '">' + esc(b.email) + "</a>"
    : '<br />Email: not published - please call';

  const btn = b.email
    ? '<a class="bb-btn" href="mailto:' + esc(b.email) + '">Email ' + esc(b.name) + "</a>"
    : '<a class="bb-btn" href="tel:' + b.phone.replace(/[^0-9+]/g, "") + '">Call ' + esc(b.phone) + "</a>";

  return [
    "<!-- ===========================================================",
    "     " + b.name + " - single-file website for WordPress",
    "     Paste everything below into a WordPress Custom HTML block.",
    "     Self-contained: no external CSS, JS, fonts or images.",
    "     =========================================================== -->",
    '<div class="bb-site">',
    '  <style>',
    WP_CSS.split("\n").map(function (l) {
      return "    " + l;
    }).join("\n"),
    "  </style>",
    "",
    '  <header class="bb-hero">',
    '    <div class="bb-hero-inner">',
    "      <h1>" + esc(b.name) + "</h1>",
    '      <p class="bb-tagline">' + esc(b.tagline) + "</p>",
    '      <p class="bb-address">' + esc(b.address) + " - " + esc(b.cityLine) + "</p>",
    '      <p class="bb-phone">' + esc(b.phone) + (b.phoneAlt ? " / " + esc(b.phoneAlt) : "") + "</p>",
    "      " + btn,
    "    </div>",
    "  </header>",
    "",
    '  <nav class="bb-nav">',
    '    <div class="bb-wrap">',
    "      <ul>",
    '        <li><a href="#bb-about">About</a></li>',
    '        <li><a href="#bb-services">Services</a></li>',
    '        <li><a href="#bb-hours">Hours &amp; Contact</a></li>',
    '        <li><a href="#bb-reviews">Reviews</a></li>',
    "      </ul>",
    "    </div>",
    "  </nav>",
    "",
    '  <div class="bb-wrap bb-main">',
    '    <section id="bb-about">',
    "      <h2>About Us</h2>",
    "      <p>" + esc(b.about) + "</p>",
    "    </section>",
    "",
    '    <section id="bb-services">',
    "      <h2>Services</h2>",
    '      <ul class="bb-list">',
    svc,
    "      </ul>",
    "    </section>",
    "",
    '    <section id="bb-hours">',
    "      <h2>Hours &amp; Contact</h2>",
    '      <div class="bb-facts">',
    "        <p><strong>Hours:</strong> " + esc(b.hours) + "</p>",
    "        <p><strong>Address:</strong> " + esc(b.address) + ", " + esc(b.cityLine) + "</p>",
    "        <p><strong>Phone:</strong> " + esc(b.phone) + (b.phoneAlt ? " / " + esc(b.phoneAlt) : "") + "</p>",
    "        <p><strong>" + (b.website ? "Website" : "Online presence") + ":</strong> " + esc(b.website || "none yet") + "</p>",
    "        <p>" + emailRow + "</p>",
    "      </div>",
    "    </section>",
    "",
    '    <section id="bb-reviews">',
    "      <h2>What People Say</h2>",
    revs,
    "    </section>",
    "  </div>",
    "",
    '  <footer class="bb-footer">',
    "    <p>&copy; 2026 " + esc(b.name) + ". All rights reserved.</p>",
    "  </footer>",
    "</div>",
    "",
  ].join("\n");
}

function buildReadme(b) {
  const lines = [];
  lines.push("# " + b.name);
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("| --- | --- |");
  lines.push("| Category | " + b.tagline + " |");
  lines.push("| Location | " + b.address + ", " + b.cityLine + " |");
  lines.push("| Phone | " + b.phone + (b.phoneAlt ? " / " + b.phoneAlt : "") + " |");
  lines.push("| Email | " + (b.email || "_not published_") + " |");
  lines.push("| Hours | " + b.hours.replace(/\|/g, "\\|") + " |");
  lines.push("| Website status | **" + b.websiteStatus + "** |");
  lines.push("| Website | " + (b.website || "_none_") + " |");
  lines.push("");
  lines.push("## Website status");
  lines.push("");
  lines.push(b.websiteNote);
  lines.push("");
  lines.push("## Contact notes");
  lines.push("");
  lines.push(b.contactNote);
  lines.push("");
  lines.push("## Files");
  lines.push("");
  lines.push("- `index.html` - full site for GitHub Pages (uses `../real-styles.css`)");
  lines.push("- `wordpress.html` - **self-contained single file** - paste into a WordPress Custom HTML block");
  lines.push("- `email.md` - outreach email draft ($500 offer)");
  lines.push("");
  lines.push("## About");
  lines.push("");
  lines.push(b.about);
  lines.push("");
  lines.push("## Services");
  lines.push("");
  b.services.forEach(function (s) {
    lines.push("- " + s);
  });
  lines.push("");
  lines.push("## Research date");
  lines.push("");
  lines.push("October 2026. See `../real-businesses.md` for source URLs.");
  lines.push("");
  return lines.join("\n");
}

function buildEmail(b) {
  const greeting = b.websiteStatus === "NO WEBSITE"
    ? "I was looking for local businesses in " + b.city + " and noticed " + b.name + " doesn't have a website yet."
    : "I came across " + b.name + " while researching businesses in " + b.city + " and took a look at your online presence.";

  const pitch = b.websiteStatus === "NO WEBSITE"
    ? "That matters more than it used to - most people search online before they call, and right now you're invisible to that traffic. I build clean, mobile-friendly websites for local businesses, and I'd like to build yours."
    : "You've got the basics covered, but there's room to grow - a faster, mobile-first site that ranks in search and turns visitors into calls. I build that kind of site for local businesses.";

  return [
    "# Email Draft for " + b.name,
    "",
    "## Contact",
    "",
    "- Phone: " + b.phone + (b.phoneAlt ? " / " + b.phoneAlt : ""),
    "- Email: " + (b.email || "_not published - use phone or a contact form_"),
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
    greeting,
    "",
    pitch,
    "",
    "For a one-time $500 you get a complete, mobile-responsive site with your contact details, services, hours, location and a clear way for customers to reach you. No contracts, no monthly fees - you own it.",
    "",
    "I've already put together a working preview for " + b.name + " so you can see exactly what you'd be getting.",
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

let count = 0;
BUSINESSES.forEach(function (b) {
  const dir = path.join(SITES, b.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), buildIndex(b), "utf8");
  fs.writeFileSync(path.join(dir, "wordpress.html"), buildWordPress(b), "utf8");
  fs.writeFileSync(path.join(dir, "README.md"), buildReadme(b), "utf8");
  fs.writeFileSync(path.join(dir, "email.md"), buildEmail(b), "utf8");
  count += 1;
  console.log("built: " + b.name);
});

console.log("done: " + count + " businesses");
