# Style, type and arrangement research

Notes taken while restyling the six sites (October 2026). Sources: the
businesses' own live sites, plus peer businesses in the same trade.

## Typefaces taken from each business's own site

| Business | Its live site | Typefaces found there | Used as |
|----------|---------------|-----------------------|---------|
| Barkley's Jewelry and Pawn | pawncept.com | Sanchez (slab serif) | display face, "classic" theme |
| Ross Mobile Mechanic | rossmobilepdx.com | Signika Negative + Nunito Sans | display + body, "industrial" |
| Key Home Improvements | guttersforsale.com | Libre Baskerville + Almarai | display + body, "craft" |
| Trapala Restaurant | trapala.com | Barlow + Raleway | display + body, "fiesta" |
| Kings Cupboard | none | - | Fraunces (market/organic serif) + Verdana body, "market" |
| Sasquatch Services | none | - | Archivo Black + system body, "rugged" |

All six load through one Google Fonts link per page (`FONT_QUERY` in
`tools/build-sites.cjs`), with system fallback stacks in `site.css`.

## Peer sites researched for arrangement

- **beverlyloan.com** (collateral lender, peer to Barkley's): hero leads with
  the offer, not the business name; small text links under the hero instead of
  big buttons; all-caps kickers; single-word benefit blocks (Local / Expert /
  Fast / Private); trust numbers ("since 1938, 20,000+ clients").
  Computed: Montserrat uppercase headings (h1 39px/500), system-sans body,
  white page, **zero card boxes on the homepage** (1 boxed element total).
- **yourmechanic.com** (mobile mechanic, peer to Ross): Montserrat for body
  AND headings, white page, conversational h2 copy ("Life's too short to spend
  it at the repair shop", "Our customers say the nicest things"), no cards.
- **marketofchoice.com** (Oregon grocer, peer to Kings Cupboard): "New
  Spirit" serif display at **70px** over a **cream rgb(240,240,223)** page,
  pragmatica body - big warm serif + cream, no boxes.
- **porquenotacos.com** (Portland taqueria, peer to Trapala): Bookmania
  serif headings on **flat bright colour fields** (turquoise rgb(61,208,213)),
  playful copy ("Welcome to ¿Por Que No?!").
- **leaffilter.com** (gutter protection, peer to Key Home): plain system sans,
  pain-point h2 copy ("Cleaning out Gutters is Dirty and Annoying").
- **savatree.com** (peer to Sasquatch): "Perfectly Nineties" rounded retro
  display, warm stewardship copy ("We care for your outdoor haven").
- **Electrified Garage** (via Zarla's auto-repair examples, peer to Ross):
  technical/blueprint aesthetic, credible stats row, section titles written as
  ethos ("Evidence first. Options second.") - copy doing design work.
- **SavATree** (via Zarla's tree-service examples, peer to Sasquatch): leads
  with what the customer values ("We care for what you love"), not the
  equipment; locality routed in the hero.
- Tree-service category pattern: owner/job-photo sections, plain-language
  service lists, estimate-first call to action.
- Restaurant + health-market category pattern: menu/shelf-forward, warm cream
  pages, food-first photography.

**Consensus across all six live peers: nobody ships a grid of white rounded
icon cards.** Services are plain typed lists or two-column rows, stats sit in
borderless strips, headings are large (39-70px). That is what drove the tile
removal: `.svc-list` rows, borderless stat strips, timeline steps, plain value
rows.

## Round 2 - deeper industry reads (second pass)

| Peer | Trade | Type found | Take |
|------|-------|-----------|------|
| pawnamerica.com | pawn | Montserrat 800 headings + Inter body | bold weight, zero boxes |
| wrench.com | mobile mechanic | Eveleth condensed display + Open Sans | condensed retro-athletic headings |
| leafguard.com | gutters | Avenir 800 throughout | one clean sans, big weights |
| newseasonsmarket.com | grocer | custom "NSM" sans, dark-gray page base | brand-promise section copy |
| monstertreeservice.com | tree service | Kanit 600 + Open Sans | benefit-driven h2s, zip-finder hero |
| chipotle.com | Mexican restaurant | Trade Gothic bold **UPPERCASE** + Nunito | uppercase headings + nav, "MENU" label |

Applied from round 2: Trapala's nav/page is relabelled **Menu** (Chipotle uses
MENU), fiesta headings and nav are uppercase Barlow (Trade Gothic stand-in),
and every background `--pattern` (pinstripes, hazard stripes, graph paper,
ridge stripes, diagonal wash, crate dots) was removed for readability.

## Arrangement decisions per theme (implemented in `sites/assets/site.css`)

| Theme | Header | Hero | Section heads | Cards |
|-------|--------|------|---------------|-------|
| classic (Barkley's) | ivory, 3px double rule | centred | centred + gold rule, italic serif quotes | square corners |
| industrial (Ross) | dark, red bottom rule, light nav | left-aligned | left, uppercase stats | top red bar, 3px |
| craft (Key Home) | teal hairline | rounded foot (42px) | centred + pill underline | 16px rounded, dashed quotes |
| market (Kings) | cream, green rule | rounded foot (34px) | centred + green rule | dashed borders |
| rugged (Sasquatch) | dark timber, lime rule, light nav | left-aligned, oversized h1 | left, left-aligned stats | 2px heavy borders |
| fiesta (Trapala) | cream, 4px accent rule | rounded foot (48px) | centred + tri-colour rule | pinata-corner stats |
