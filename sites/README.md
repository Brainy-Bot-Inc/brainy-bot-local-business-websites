# Local Business Websites — Woodburn, Oregon Area

Full **multi-page** websites for six real local businesses in the Woodburn, Oregon
area, built from direct research. Phone numbers, emails and website status were
verified in October 2026 by resolving each domain and reading the destination page.

## Businesses included (6)

| Business | Website status |
|----------|----------------|
| [Barkley's Jewelry and Pawn](Barkley's%20Jewelry%20and%20Pawn/) | HAS WEBSITE (barkleyspawn.com) |
| [Ross Mobile Mechanic, LLC](Ross%20Mobile%20Mechanic,%20LLC/) | HAS WEBSITE (rossmobilepdx.com) |
| [Key Home Improvements](Key%20Home%20Improvements/) | HAS WEBSITE (guttersforsale.com) |
| [Kings Cupboard](Kings%20Cupboard/) | **NO WEBSITE - qualified lead** |
| [Sasquatch Services LLC](Sasquatch%20Services%20LLC/) | **NO LIVE SITE - qualified lead** |
| [Trapala Restaurant](Trapala%20Restaurant/) | HAS WEBSITE (trapala.com) |

Only **Kings Cupboard** and **Sasquatch Services LLC** are genuine no-website
prospects. See `../business-leads.md` for why the other four were disqualified.

## Structure

Every business folder contains **four pages**, not one:

| File | Contents |
|------|----------|
| `index.html` | Home - hero, stats, service preview, image split, reviews, FAQ |
| `services.html` | Full service list, process, photos, FAQ (labelled **Menu** on Trapala) |
| `about.html` | Story and values |
| `contact.html` | Contact details, photo banner, opening hours, enquiry form, FAQ |
| `images/` | The business's photos and logo |
| `wordpress/` | The same four pages as **self-contained files** |
| `README.md` | Verified contact details, hours, website status |
| `email.md` | Outreach email draft ($500 offer) |

Shared by all six: `assets/site.css` and `assets/site.js`.

Each site has its own accent colour, typeface, header treatment, page texture
and layout personality (six `data-theme` blocks at the end of
`assets/site.css`), plus the business's real logo in the upper-left header
where one could be found. There is exactly **one button per page**, and it
shows the phone number.

## Publishing to WordPress (HTML block)

1. Open the business's `wordpress/<page>.html` in any text editor.
2. Select all, copy, paste into a WordPress **Custom HTML** block.
3. Repeat for each of the four pages.

Nothing else needs uploading: CSS, JavaScript and every image are inlined as
data URIs inside the file, and every selector is namespaced so it will not
restyle your theme.

## Publishing on GitHub Pages

1. Repo: `Brainy-Bot-Inc/brainy-bot-local-business-websites`
2. Settings > Pages > Source: "Deploy from a branch" > `main` > Save.
3. Each site: `https://brainy-bot-inc.github.io/brainy-bot-local-business-websites/<folder>/`

## Rebuilding

```
node tools/build-sites.cjs    # regenerate all 48 pages
node tools/verify.cjs         # provenance + structure checks; exits non-zero on any failure
```

`tools/data.cjs` holds every business's verified details, accent colour and
hours - edit it there and rerun the build.

Photo sourcing lives in `tools/harvest.cjs`:

```
node tools/harvest.cjs "<Business>" listing <mapquest-url>   # that listing's own Yelp photos
node tools/harvest.cjs "<Business>" site    <own-site-url>   # photos on the business's own site
node tools/fetch-photos.cjs                                # phone-matched photos (Key Home, Sasquatch)
```

## Image sourcing - every photo is that business

Google and Yelp block automated access (HTTP 403), so:

| Business | Photos | Source |
|----------|--------|--------|
| Barkley's Jewelry and Pawn | 9 | Its own Yelp photos + product shots from pawncept.com |
| Key Home Improvements | 10 | Its own Yelp photos (listing telephone matches) + one photo from guttersforsale.com |
| Kings Cupboard | 4 | Its own Yelp photos |
| Ross Mobile Mechanic, LLC | 7 | Its own Yelp photos |
| Sasquatch Services LLC | 3 | Its own old site (phone link matches), via the Wayback Machine |
| Trapala Restaurant | 12 | Its own Yelp photos + trapala.com |

The Yelp photos come through the feed that MapQuest mirrors on each listing;
the JSON-LD record isolates that business's photos from the nearby businesses
and editorial images the same page also embeds.

**No stock, third-party or representative photography is used anywhere.** A
photo whose provenance is not the business itself is deleted rather than
substituted - which is why the four Wikimedia-sourced images once attached to
Kings Cupboard (including a Whole Foods in Duluth, Minnesota), twelve
Commons gutter photos on Key Home Improvements, sixteen Commons tree photos
on Sasquatch Services and two stock images on Ross are all gone.

### Sasquatch Services: photos from its own old site

Its photos sit behind Facebook login and it has no map listing, so its three
photos come from sasquatchservicesllc.com itself - the Wayback Machine's
capture of that site, whose phone link (541 285 2353) matches the business.
The domain still does not resolve today. No other company's tree work is ever
substituted.

## Research

Full notes, corrections and source URLs are in `../real-businesses.md`.

**Important:** business details came from public directories and should be
confirmed with the owner before publishing or sending outreach.

## Legacy generators

`build-sites.cjs`, `build-sites.py`, `build-real-sites.cjs` and
`build-wp-sites.cjs` in the parent folder produced the original single-page
sites. They are **superseded by `tools/build-sites.cjs`** - do not run them,
they will overwrite these multi-page sites with the old flat versions.
