# Lead List - Woodburn, Oregon area (within 50 miles)
# Revised October 2026. Full research and source URLs: real-businesses.md

## Summary

6 businesses were researched. **Only 2 are genuine no-website leads.** The other
4 turned out to already run a live website, so they should not receive a
"you don't have a website" pitch.

| Status | Business | Phone | Email |
|--------|----------|-------|-------|
| QUALIFIED | Kings Cupboard | (503) 981-3557 | |
| QUALIFIED | Sasquatch Services LLC | (541) 285-2353 | nic@sasquatchservicesllc.com |
| DISQUALIFIED - has site | Barkley's Jewelry and Pawn | (503) 982-2033 | |
| DISQUALIFIED - has site | Ross Mobile Mechanic, LLC | (503) 442-7907 | allfixx247@gmail.com |
| DISQUALIFIED - has site | Key Home Improvements | (503) 580-6868 | yoursalemhandyman@gmail.com |
| DISQUALIFIED - has site | Trapala Restaurant | (503) 981-3000 | strapala@hotmail.com |

## Why they were disqualified

- **Barkley's Jewelry and Pawn** - barkleyspawn.com resolves and redirects to
  pawncept.com, a live storefront listing the Woodburn store.
- **Ross Mobile Mechanic, LLC** - rossmobilepdx.com is live and shares the same
  contact email and phone line as the Woodburn listing.
- **Key Home Improvements** - guttersforsale.com is live, titled
  "Key Home Improvements LLC", showing CCB 228717 and 503-580-6868.
- **Trapala Restaurant** - trapala.com is live with a full menu and online
  ordering.

## What each folder contains

Every folder under `sites/` has **four pages** plus a WordPress copy, even for
the disqualified leads, so you can preview what a $500 build looks like for
any of them:

- `index.html`, `services.html`, `about.html`, `contact.html`
  - the full multi-page site for GitHub Pages (stylesheet: `../assets/site.css`)
- `images/` - the business's own photos and logo, provenance-checked
- `wordpress/` - the same four pages as self-contained files for a WordPress
  Custom HTML block (CSS, JS and images all inlined)
- `README.md` - verified contact details, hours, website status
- `email.md` - outreach draft ($500 offer)

Rebuild with `node tools/build-sites.cjs`; check with `node tools/verify.cjs`.

## Next step

Find replacements for the 4 disqualified leads so the list is back to 6
qualified no-website businesses in the Woodburn area.
