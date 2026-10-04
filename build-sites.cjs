// SUPERSEDED - this generates the old single-page sites and will OVERWRITE
// the current multi-page sites. Use: node tools/build-sites.cjs
// Verify with:            node tools/verify.cjs

const fs = require("fs");
const path = require("path");

const SITES_ROOT = __dirname;

// Each business: fill in the %% placeholders for a complete, self-contained website.
const BUSINESSES = {
  "Brighton Bistro": {
    tagline: "Farm-to-table dining in the heart of Scottsdale",
    address: "4821 E Camelback Rd",
    phone: "(480) 555-0147",
    email: "hello@brightonbistro.com",
    city: "Scottsdale",
    about:
      "Brighton Bistro is a locally owned restaurant serving seasonal, farm-to-table breakfast and dinner in the heart of Scottsdale. We source from local Arizona farmers and bakers, and our menu changes with the seasons. Whether you're stopping in for a weekend brunch or a quiet dinner, you'll find warm hospitality and flavorful, honest food made from scratch.",
    services: [
      "Farm-to-table breakfast & brunch",
      "Seasonal dinner plates",
      "Cocktail bar & craft mocktails",
      "Private dining & events",
    ],
    hours: "Mon–Thu: 7am–9pm | Fri–Sat: 7am–10pm | Sun: 8am–9pm",
    testimonials: [
      "The farm-to-table brunch was incredible — fresh, local, and honestly better than anything I've had at a chain.",
      "Gorgeous spot. The staff remembered my favorite dish after the first visit and the food was perfect.",
      "Best brunch in Scottsdale. Very welcoming, great atmosphere, and the coffee was excellent.",
    ],
  },
  "Classic Cars Classic Cars Palace": {
    tagline: "Classic and exotic car restoration in Phoenix",
    address: "3175 W Northern Ave",
    phone: "(602) 555-0189",
    email: "info@classiccarspalace.com",
    city: "Phoenix",
    about:
      "Classic Cars Palace is a family-run car restoration shop specializing in classic, vintage, and exotic vehicles. We restore, polish, and show-room-clean used cars so they look as good as new — or better. From 1960s muscle to modern classics, we take pride in every detail, from the engine bay to the polished chrome.",
    services: [
      "Full car restoration & detailing",
      "Engine tuning & mechanical repair",
      "Exterior polishing & waxing",
      "Pre-purchase inspections",
    ],
    hours: "Mon–Fri: 8am–6pm | Sat: 9am–4pm | Sun: closed",
    testimonials: [
      "They brought my 1967 Mustang back to life. The work is impeccable and the price was fair.",
      "Fast, honest, and thorough. I drove my car off the lot feeling like it was brand new.",
      "Best shop I've used for classic cars. They explained every step and were incredibly transparent.",
    ],
  },
  "EnviroServe": {
    tagline: "Eco-friendly cleaning services throughout Arizona",
    address: "5483 E Indian School Rd",
    phone: "(480) 555-0162",
    email: "book@enviroserve.com",
    city: "Mesa",
    about:
      "EnviroServe provides eco-friendly residential and commercial cleaning services across the Phoenix metro area. We use non-toxic, biodegradable products and meticulous attention to detail to make your home or office spotless — without harsh chemicals. Safe for kids, pets, and the planet.",
    services: [
      "Home cleaning & deep cleaning",
      "Office & commercial cleaning",
      "Move-in / move-out cleaning",
      "Window & carpet cleaning",
    ],
    hours: "Mon–Sat: 7am–7pm | Sun: by appointment",
    testimonials: [
      "Cleaned our whole office with eco-friendly products — the team was professional and the building sparkles.",
      "Best cleaning service we've used. Safe for my kids and pets, and the place stays spotless.",
      "Reliable, friendly, and really thorough. Would definitely hire again.",
    ],
  },
  "GreenTech Recycling": {
    tagline: "Responsible e-waste & scrap metal recycling in Gilbert",
    address: "2845 S Greenfield Rd",
    phone: "(480) 555-0133",
    email: "recycle@greentechrecycling.com",
    city: "Gilbert",
    about:
      "GreenTech Recycling helps homes and businesses responsibly recycle electronics, e-waste, and scrap metal — keeping hazardous materials out of Arizona landfills. We offer pick-up and drop-off, data destruction, and certified recycling for computers, TVs, batteries, and more. Sustainable waste management, done right.",
    services: [
      "E-waste & electronics recycling",
      "Scrap metal recycling",
      "Commercial pick-up services",
      "Data destruction & certified disposal",
    ],
    hours: "Mon–Fri: 8am–5pm | Sat: 9am–3pm | Sun: closed",
    testimonials: [
      "They came out to our office and handled all our old electronics. Super easy and fully compliant.",
      "Recycled a ton of e-waste in one trip. Smooth process and great documentation.",
      "Professional, fast, and genuinely committed to doing it right. Highly recommend.",
    ],
  },
  "Ironclad Locksmith": {
    tagline: "24-Hour locksmith services in Glendale",
    address: "7235 W Thunderbird Rd",
    phone: "(623) 555-0174",
    email: "dispatch@ironcladlocksmith.com",
    city: "Glendale",
    about:
      "Ironclad Locksmith is your trusted, licensed 24-hour locksmith in Glendale and the Phoenix metro area. We specialize in locksmith services, key replication, security system installation, and car lockout assistance. When you're locked out or need a key made, we're just minutes away — no appointment required.",
    services: [
      "24-hour lockout assistance",
      "Lock installation & repair",
      "Key cutting & duplication",
      "Security system & smart lock installation",
    ],
    hours: "24 hours / 7 days (emergency dispatch)",
    testimonials: [
      "Locked out of my car at midnight and they were there in 20 minutes. Highly professional.",
      "Locked a key in the house and they answered immediately. Fair price and very fast.",
      "Best locksmith in the valley. They fixed my faulty locks and gave me a security upgrade.",
    ],
  },
  "Maple Grove Chiropractic": {
    tagline: "Drug-free pain relief & wellness care in Chandler",
    address: "1412 S Gilbert Rd",
    phone: "(480) 555-0121",
    email: "schedule@maplegrovechiro.com",
    city: "Chandler",
    about:
      "Maple Grove Chiropractic provides drug-free, hands-on care for back pain, neck pain, headaches, and overall wellness. Using gentle spinal adjustments and personalized care plans, we help our patients move better, feel better, and stay pain-free — without relying on medication.",
    services: [
      "Spinal adjustments & alignment",
      "Back & neck pain relief",
      "Headache & migraine care",
      "Wellness & posture correction",
    ],
    hours: "Mon–Thu: 8am–6pm | Fri: 8am–12pm | Sat: 9am–1pm",
    testimonials: [
      "I've had back pain for years and this clinic finally helped. The care is gentle and effective.",
      "Great staff, real results, and they explained everything. Walk in, walk out feeling better.",
      "The best chiropractic care I've ever had. Professional and truly caring.",
    ],
  },
  "National Pest Control": {
    tagline: "Comprehensive pest control in Peoria",
    address: "8184 W Peoria Ave",
    phone: "(623) 555-0118",
    email: "service@nationalpestcontrol.com",
    city: "Peoria",
    about:
      "National Pest Control protects Arizona homes and businesses from rats, roaches, termites, scorpions, and more. We provide thorough inspections, eco-friendly treatments, and ongoing prevention plans to keep your property pest-free all year round. Safe, effective, and available when you need us.",
    services: [
      "Home pest control plans",
      "Termite & roof damage inspection",
      "Scorpion & rodent removal",
      "Commercial pest prevention",
    ],
    hours: "Mon–Fri: 8am–6pm | Sat: 9am–4pm | Sun: by appointment",
    testimonials: [
      "We've used them for years and never had a pest issue. Reliably thorough.",
      "Scorpions were a nightmare until they treated our place. Now it's completely gone.",
      "Professional, friendly, and the follow-up care is outstanding.",
    ],
  },
  "Pinnacle Roofing": {
    tagline: "Roofing & gutter installation in Tempe",
    address: "2850 E Apache Trail",
    phone: "(480) 555-0154",
    email: "info@pinnacleroofing.com",
    city: "Tempe",
    about:
      "Pinnacle Roofing installs, repairs, and maintains roofs for homes and businesses across the Phoenix area. We work with a range of materials — asphalt, metal, tile — and are fully licensed and insured. Protect your property from Arizona's intense heat and monsoon storms with a roof built to last.",
    services: [
      "Roof replacement & repair",
      "Gutter installation & clean",
      "Storm damage assessment",
      "Roof inspections & maintenance",
    ],
    hours: "Mon–Fri: 7am–5pm | Sat: 8am–3pm | Sun: closed",
    testimonials: [
      "They replaced our roof quickly and cleaned up after themselves. Great price and fair work.",
      "Excellent communication from start to finish. Pleased with the quality.",
      "Fast, professional, and the team was extremely respectful of our home.",
    ],
  },
  "Sunrise Cleaning Services": {
    tagline: "Residential & commercial cleaning in Scottsdale",
    address: "1250 N 24th St",
    phone: "(480) 555-0105",
    email: "book@sunrisecleaning.com",
    city: "Scottsdale",
    about:
      "Sunrise Cleaning Services is a locally owned cleaning company serving homes and businesses across Scottsdale and the Valley. Our trained, insured team provides thorough, individualized cleaning so you can spend less time cleaning and more time enjoying your space. We're flexible, reliable, and detail-oriented.",
    services: [
      "Residential cleaning",
      "Commercial & office cleaning",
      "Move-in / move-out cleaning",
      "Deep cleaning & organizing",
    ],
    hours: "Mon–Sat: 7am–7pm | Sun: by appointment",
    testimonials: [
      "Straightforward pricing and a clean home every time. Highly recommend.",
      "Friendly team, very reliable, and they left our place spotless.",
      "Great service for a tight budget. Would definitely use them again.",
    ],
  },
  "Valley Auto Repair": {
    tagline: "Honest, affordable auto repair in Avondale",
    address: "4110 W Avondale Blvd",
    phone: "(602) 555-0196",
    email: "info@valleyautorepair.com",
    city: "Avondale",
    about:
      "Valley Auto Repair is a family-owned shop serving drivers throughout the Phoenix metro area. We provide honest, upfront auto repair — from oil changes and brakes to engine diagnostics and full restorations. No high-pressure sales tactics, just clear pricing and quality work you can trust.",
    services: [
      "Oil changes & maintenance",
      "Brakes, tires & suspension",
      "Engine & transmission diagnostics",
      "Foreign & used parts installation",
    ],
    hours: "Mon–Fri: 7:30am–6pm | Sat: 8am–2pm | Sun: closed",
    testimonials: [
      "Finally a shop that's honest. My car is running great and I wasn't upsold on anything.",
      "Fair pricing, friendly staff, and the repair was done right. Would recommend.",
      "Got my car fixed quickly and explained everything in plain English.",
    ],
  },
  "Zenith Accounting & Tax": {
    tagline: "Small business & personal tax accounting in Peoria",
    address: "9442 W Thunderbird Rd",
    phone: "(623) 555-0142",
    email: "info@zenithaccountingtax.com",
    city: "Peoria",
    about:
      "Zenith Accounting & Tax provides straightforward bookkeeping, payroll, and tax preparation for individuals and small businesses across Arizona. Our certified accountants help you stay organized, maximize deductions, and file with confidence — whether you're a growing LLC or a busy family. Clear numbers. Real advice.",
    services: [
      "Tax preparation & filing",
      "Bookkeeping & payroll",
      "Cash flow & financial planning",
      "Business tax consultations",
    ],
    hours: "Mon–Fri: 9am–5pm | Sat: by appointment | Sun: closed",
    testimonials: [
      "Finally someone who explains taxes without jargon. Saved me money and stress.",
      "Clean books, clear advice, and they even caught deductions I'd missed. Worth it.",
      "Highly recommend for both personal and small-business tax needs.",
    ],
  },
  "Zenith Legal Services": {
    tagline: "Business & personal legal services in Phoenix",
    address: "3240 N Central Ave",
    phone: "(602) 555-0129",
    email: "info@zenithlegalservices.com",
    city: "Phoenix",
    about:
      "Zenith Legal Services provides clear, practical legal guidance for businesses and individuals in the Phoenix area. From business formation and contracts to wills, trusts, and everyday legal questions, we aim to make the law accessible — no confusing legalese, just sound advice and solid representation.",
    services: [
      "Business formation & contracts",
      "Estate planning & wills",
      "Real estate assistance",
      "General legal consultations",
    ],
    hours: "Mon–Fri: 9am–5pm | Sat: by appointment | Sun: closed",
    testimonials: [
      "Answered my legal question clearly and quickly. Felt like a genuine partner.",
      "Set up my business properly and the whole process was smooth and transparent.",
      "Friendly, knowledgeable, and much more affordable than I expected. Great value.",
    ],
  },
};

function build() {
  for (const [name, data] of Object.entries(BUSINESSES)) {
    const folder = path.join(SITES_ROOT, name);
    fs.mkdirSync(folder, { recursive: true });

    const servicesBody = data.services
      .map((s) => `        <li>${s}</li>`)
      .join("\n");
    const aboutBody = data.about.replace(/\n/g, "\n    ");
    const servicesBodyIndented = servicesBody.replace(/\n/g, "\n    ");

    const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | ${data.tagline}</title>
  <link rel="stylesheet" href="../styles.css" />
  <meta name="description" content="${name} — ${data.tagline}. ${name} is a locally owned business in ${data.city}. Service you can trust, right in your neighborhood." />
</head>
<body>
  <header class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>${name}</h1>
        <p class="tagline">${data.tagline}</p>
        <p class="address">${data.address} · ${data.city}, AZ</p>
        <p class="phone">${data.phone}</p>
        <a class="btn" href="mailto:${data.email}">${data.email}</a>
      </div>
    </div>
  </header>

  <nav class="menu">
    <div class="container">
      <ul>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#hours">Hours &amp; Contact</a></li>
        <li><a href="#testimonials">Testimonials</a></li>
      </ul>
    </div>
  </nav>

  <main class="container">
    <section id="about">
      <h2>About Us</h2>
      <p>${aboutBody}</p>
    </section>

    <section id="services">
      <h2>Services</h2>
      <ul>
${servicesBodyIndented}
      </ul>
    </section>

    <section id="hours">
      <h2>Hours &amp; Contact</h2>
      <p>
        Hours: ${data.hours}<br />
        Address: ${data.address}<br />
        Phone: ${data.phone}<br />
        Email: <a href="mailto:${data.email}">${data.email}</a>
      </p>
    </section>

    <section id="testimonials">
      <h2>What Our Customers Say</h2>
      <blockquote>"${data.testimonials[0]}"</blockquote>
      <blockquote>"${data.testimonials[1]}"</blockquote>
      <blockquote>"${data.testimonials[2]}"</blockquote>
    </section>
  </main>

  <footer class="container">
    <p>&copy; 2026 ${name}. All rights reserved.</p>
  </footer>
</body>
</html>
`;

    fs.writeFileSync(path.join(folder, "index.html"), page, "utf-8");

    const readme = `# ${name}

Complete website for **${name}** — a locally owned business in ${data.city}, AZ.

## Pages
- \`index.html\` — the complete homepage

## What's already filled in
- Business name, tagline, address, phone, email
- About section, services list, hours & contact, customer testimonials

## What still needs to be done
- Replace placeholder content with verified facts (real address, phone, hours, photos)
- Add real photos of your team, location, or work
- Review the copy for accuracy before publishing

## How to edit
Open \`index.html\` in any text editor. The layout follows a simple structure, so changing
text, adding a service, or swapping a phone number is straightforward.

## Publish for free
1. Create a free GitHub account.
2. Create a new repository.
3. Upload this \`index.html\` (and the shared \`../styles.css\` in the parent \`sites/\` folder).
4. In repo Settings → Pages → Source: "Deploy from a branch" → \`main\` → Save.
5. Your live site will be \`https://<username>.github.io/<repo>/\`.
`;

    fs.writeFileSync(path.join(folder, "README.md"), readme, "utf-8");

    console.log(`Built: ${folder}/index.html`);
  }
}

build();
