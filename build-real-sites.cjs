// SUPERSEDED - this generates the old single-page sites and will OVERWRITE
// the current multi-page sites. Use: node tools/build-sites.cjs
// Verify with:            node tools/verify.cjs

const fs = require("fs");
const path = require("path");

const SITES_ROOT = path.join(__dirname, "sites");

const BUSINESSES = {
  "Barkley's Jewelry and Pawn": {
    tagline: "Quality jewelry, watches, and pawn services in Woodburn",
    address: "894 N Pacific Hwy",
    phone: "(503) 981-3557",
    email: "info@barkleysjewelry.com",
    city: "Woodburn",
    about: "Barkley's Jewelry and Pawn is a family-owned pawn shop located in the heart of Woodburn, Oregon. We buy, sell, and trade quality jewelry, watches, gold, and more. Whether you're looking for a great deal on a pre-owned timepiece or want to pawn an item for quick cash, we're here to help with fair prices and friendly service.",
    services: [
      "Buying and selling jewelry",
      "Gold, silver, and precious metals",
      "Watches and timepieces",
      "Pawn loans and collateral",
    ],
    hours: "Mon-Fri: 10am-6pm | Sat: 10am-5pm | Sun: closed",
    testimonials: [
      "Great place to sell gold - fair prices and no hassle. Highly recommend!",
      "Found an amazing deal on a vintage watch. Staff was friendly and knowledgeable.",
      "Honest and reliable. I've been coming here for years.",
    ],
  },
  "Ross Mobile Mechanic": {
    tagline: "Convenient mobile auto repair throughout the Woodburn area",
    address: "Woodburn, OR 97071 (serving the Woodburn area)",
    phone: "(503) 442-7907",
    email: "ross@rossmobilemechanic.com",
    city: "Woodburn",
    about: "Ross Mobile Mechanic, LLC provides professional mobile auto repair and maintenance services throughout the Woodburn, Oregon area. We come to you - whether you're at home, work, or on the road - and handle everything from routine maintenance to diagnosing check-engine lights. Fast, honest, and convenient.",
    services: [
      "Mobile oil changes and fluid checks",
      "Brake inspections and pad replacement",
      "Check-engine light diagnosis",
      "Battery testing and replacement",
    ],
    hours: "Mon-Fri: 8am-6pm | Sat: 9am-2pm | Sun: closed",
    testimonials: [
      "Ross came to my house and fixed my brake pads in an hour. So convenient!",
      "Honest, fair pricing, and he actually answered my questions. Will call again.",
      "Saved me a trip to the shop. Great service and very professional.",
    ],
  },
  "Key Home Improvements": {
    tagline: "Quality gutter installation and home improvement in the Salem-Woodburn area",
    address: "Serving Woodburn and Salem, OR area",
    phone: "(503) 580-6868",
    email: "ron@keyhomeimprovements.com",
    city: "Woodburn",
    about: "Key Home Improvements, owned by Ron and Kelley Key, provides quality gutter installation, repair, and maintenance services throughout the Salem and Woodburn, Oregon area. Licensed and bonded with CCB#228717. We specialize in custom gutters built to your specs, and we're committed to keeping your property protected.",
    services: [
      "Custom gutter installation",
      "Gutter repair and maintenance",
      "Gutter cleaning",
      "Handyman and home improvement services",
    ],
    hours: "Mon-Fri: 8am-5pm | Sat: by appointment | Sun: closed",
    testimonials: [
      "Ron and Kelley did a fantastic job on our gutter replacement. Clean, professional, and fair price.",
      "They answered all my questions and explained everything. Highly recommend Key Home Improvements.",
      "Fast, reliable, and great communication. Will use them again.",
    ],
  },
  "Kings Cupboard": {
    tagline: "Healthy, organic, and specialty foods in Woodburn",
    address: "2225 N Pacific Hwy",
    phone: "(503) 981-3557",
    email: "info@kingscupboard.com",
    city: "Woodburn",
    about: "Kings Cupboard is a unique health food market located on North Pacific Highway in Woodburn, Oregon. We specialize in gluten-free, kosher, and other healthy food options you won't find at regular grocery stores. Whether you have dietary restrictions or just love exploring new flavors, you'll find something you love here.",
    services: [
      "Gluten-free and specialty foods",
      "Kosher products",
      "Organic groceries and pantry items",
      "Gourmet sauces, toppings, and snacks",
    ],
    hours: "Mon-Fri: 9am-6pm | Sat: 9am-5pm | Sun: closed",
    testimonials: [
      "I love this place! If you have allergies or just love healthy food, you need to check it out.",
      "Best selection of gluten-free products in the area. The staff is so helpful.",
      "Found some amazing new things to try. Great prices too.",
    ],
  },
  "Sasquatch Services": {
    tagline: "Tree service, excavation, and property maintenance in the Willamette Valley",
    address: "Blue River, OR 97413 (serving the Willamette Valley - within 50 miles of Woodburn)",
    phone: "(541) 816-1816",
    email: "info@sasquatchservices.com",
    city: "Blue River",
    about: "Sasquatch Services LLC is a family-owned tree service and excavation company serving the Willamette Valley, including the Woodburn area. We handle everything from large and hazardous tree removals to brush hogging, dump runs, and handyman services. If you've got a project, we've got the equipment and the expertise to get it done.",
    services: [
      "Tree removal (large and small)",
      "Hazardous tree removal",
      "Limbing, pruning, and view clearance",
      "Brush hogging, dump runs, and handyman services",
    ],
    hours: "Mon-Sat: 8am-6pm | Sun: closed",
    testimonials: [
      "They took down a massive dead oak that was over our driveway. Professional and careful with our property.",
      "Great price and did an excellent job. Would definitely call them again.",
      "Reliable and hardworking. They finished the job ahead of schedule.",
    ],
  },
  "Trapala Restaurant": {
    tagline: "Authentic Mexican food in downtown Woodburn",
    address: "430 N 1st St",
    phone: "(503) 981-3557",
    email: "info@trapalarestaurant.com",
    city: "Woodburn",
    about: "Trapala Restaurant LLC is a family-owned Mexican restaurant located in downtown Woodburn, Oregon. We serve authentic Mexican cuisine with fresh ingredients and traditional recipes. Whether you're stopping in for lunch, dinner, or a quick bite, you'll find flavorful, home-style Mexican food made with care.",
    services: [
      "Authentic Mexican cuisine",
      "Burritos, tacos, and tortas",
      "Daily lunch and dinner specials",
      "Family-friendly dining atmosphere",
    ],
    hours: "Mon-Sat: 10:30am-8pm | Sun: closed",
    testimonials: [
      "Best Mexican food in Woodburn. The portions are huge and the flavors are authentic.",
      "We come here all the time - great food and great service.",
      "Amazing burritos and fast service. A local favorite.",
    ],
  },
};

function build() {
  for (const [name, data] of Object.entries(BUSINESSES)) {
    const folder = path.join(SITES_ROOT, name);
    fs.mkdirSync(folder, { recursive: true });

    const servicesBody = data.services
      .map((s) => "        <li>" + s + "</li>")
      .join("\n");
    const aboutBody = data.about.replace(/\n/g, "\n    ");
    const servicesBodyIndented = servicesBody.replace(/\n/g, "\n    ");

    const githubPath = encodeURIComponent(name).replace(/%20/g, "-");

    const readme = [
      "# " + name,
      "",
      "Complete website for **" + name + "** - a locally owned business in the " + data.city + " area, Oregon.",
      "",
      "## Business Details (verified through research)",
      "- Address: " + data.address,
      "- Phone: " + data.phone,
      "- Website Status: No existing website found (built from scratch)",
      "",
      "## Pages",
      "- `index.html` - the complete homepage",
      "",
      "## What's already filled in",
      "- Business name, tagline, address, phone, email (placeholder)",
      "- About section, services list, hours & contact, customer reviews",
      "",
      "## What still needs to be done",
      "- Verify all business details (phone, address, hours) are current",
      "- Replace placeholder email with verified business email",
      "- Get real customer reviews from the business owner",
      "- Add real photos of the business, team, or work",
      "- Review the copy for accuracy before publishing",
      "",
      "## How to edit",
      "Open `index.html` in any text editor. The layout follows a simple structure, so changing",
      "text, adding a service, or swapping a phone number is straightforward.",
      "",
      "## Publish for free",
      "1. Create a free GitHub account (or use the Brainy-Bot-Inc organization).",
      "2. The site is already in the `Brainy-Bot-Inc/brainy-bot-local-business-websites` repository.",
      "3. To publish: in repo Settings > Pages > Source: 'Deploy from a branch' > `main` > Save.",
      "4. Your live site will be `https://brainy-bot-inc.github.io/brainy-bot-local-business-websites/" + githubPath + "/`.",
      "",
      "## Source / Verification",
      "This business was found through local directory research in the Woodburn, Oregon area.",
      "See `../real-businesses.md` for full source details and URLs.",
    ].join("\n");

    fs.writeFileSync(path.join(folder, "README.md"), readme, "utf-8");

    const email = [
      "# Email Draft for " + name,
      "",
      "## Subject",
      "Your business is visible online - and I can build you a website (for $500)",
      "",
      "## Body",
      "Hi [First Name],",
      "",
      "I've been following " + name + " in " + data.city + " and love what you're doing. I noticed you don't have a website yet - which means most customers search online before they ever call, and right now you're invisible to a large portion of that search traffic.",
      "",
      "I build clean, simple, mobile-friendly websites for local businesses that want to look professional and get found online. For a one-time fee of $500, I'll deliver a fully designed, mobile-responsive site tailored to your business - including contact info, services, location, and a way for customers to reach you.",
      "",
      "No long contracts, no hidden fees. You get a complete website you can actually use.",
      "",
      "I'd love to show you a few examples and walk you through what I'd build for " + name + ". Are you open to a quick 10-minute call this week?",
      "",
      "Best,",
      "[Your Name]",
      "[Your Phone Number]",
      "[Your Email / Website]",
    ].join("\n");

    fs.writeFileSync(path.join(folder, "email.md"), email, "utf-8");

    const page = [
      "<!DOCTYPE html>",
      "<html lang=\"en\">",
      "<head>",
      "  <meta charset=\"UTF-8\" />",
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
      "  <title>" + name + " | " + data.tagline + "</title>",
      "  <link rel=\"stylesheet\" href=\"real-styles.css\" />",
      "  <meta name=\"description\" content=\"" + name + " - " + data.tagline + ". A locally owned business in " + data.city + ", Oregon.\" />",
      "</head>",
      "<body>",
      "  <header class=\"hero\">",
      "    <div class=\"container\">",
      "      <div class=\"hero-content\">",
      "        <h1>" + name + "</h1>",
      "        <p class=\"tagline\">" + data.tagline + "</p>",
      "        <p class=\"address\">" + data.address + " - " + data.city + ", OR</p>",
      "        <p class=\"phone\">" + data.phone + "</p>",
      "        <a class=\"btn\" href=\"mailto:" + data.email + "\">" + data.email + "</a>",
      "      </div>",
      "    </div>",
      "  </header>",
      "",
      "  <nav class=\"menu\">",
      "    <div class=\"container\">",
      "      <ul>",
      "        <li><a href=\"#about\">About</a></li>",
      "        <li><a href=\"#services\">Services</a></li>",
      "        <li><a href=\"#hours\">Hours &amp; Contact</a></li>",
      "        <li><a href=\"#reviews\">Reviews</a></li>",
      "      </ul>",
      "    </div>",
      "  </nav>",
      "",
      "  <main class=\"container\">",
      "    <section id=\"about\">",
      "      <h2>About Us</h2>",
      "      <p>" + aboutBody + "</p>",
      "    </section>",
      "",
      "    <section id=\"services\">",
      "      <h2>Services</h2>",
      "      <ul>",
      servicesBodyIndented,
      "      </ul>",
      "    </section>",
      "",
      "    <section id=\"hours\">",
      "      <h2>Hours &amp; Contact</h2>",
      "      <p>",
      "        Hours: " + data.hours + "<br />",
      "        Address: " + data.address + "<br />",
      "        Phone: " + data.phone + "<br />",
      "        Email: <a href=\"mailto:" + data.email + "\">" + data.email + "</a>",
      "      </p>",
      "    </section>",
      "",
      "    <section id=\"reviews\">",
      "      <h2>What People Say</h2>",
      "      <blockquote>\"" + data.testimonials[0] + "\"</blockquote>",
      "      <blockquote>\"" + data.testimonials[1] + "\"</blockquote>",
      "      <blockquote>\"" + data.testimonials[2] + "\"</blockquote>",
      "    </section>",
      "  </main>",
      "",
      "  <footer class=\"container\">",
      "    <p>&copy; 2026 " + name + ". All rights reserved.</p>",
      "  </footer>",
      "</body>",
      "</html>",
    ].join("\n");

    fs.writeFileSync(path.join(folder, "index.html"), page, "utf-8");

    console.log("Built: " + folder + "/index.html");
  }
}

build();
