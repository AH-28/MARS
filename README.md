# MARS — Agency Website

The marketing site for **MARS · Creative Agency for Digital Solutions**.
Dark-first, gold-accented, and built to the MARS Brand Guidelines (Edition 02).

> *From where you are, to where you want to be seen.*

## What's here

A multi-page site — one shared stylesheet and script across every page.

```
WEBSITE/
├── index.html            # Home (hero → marquee → positioning → "What we do")
├── services.html         # Services hub — routes into the three service pages
│   ├── nfc.html          #   Smart NFC Cards (the flagship — full product range)
│   ├── websites.html     #   Websites & Refurbishment (new builds + rescues)
│   └── marketing.html    #   Marketing (scoped by MARS, run with partners)
├── work.html             # Work / selected craft
├── approach.html         # Approach (the launch sequence + signals)
├── why.html              # Why MARS (values + the mission-director story)
├── contact.html          # Contact (enquiry form → email)
├── css/
│   └── styles.css        # Design system + all components (brand tokens at the top)
├── js/
│   └── script.js         # Star-field canvas, scroll reveals, nav + dropdown, contact→email
├── assets/
│   └── logos/            # Real MARS marks (SVG)
└── README.md
```

The top menu links to real pages (not scroll anchors). **Services is a dropdown** — it opens on
hover, on click, and on keyboard focus, closes on Escape or an outside click, and collapses to an
expandable sub-list in the mobile menu. Whenever you're on any of the three service pages, the
"Services" parent lights up gold and the specific page is marked inside the menu. A "Start a
project" button on every page opens the Contact page.

> **Heads up on editing the nav or footer.** They're duplicated verbatim in all nine HTML files —
> there's no build step or templating, so changing a menu item means changing it nine times.
> Keep the blocks byte-identical when you edit them.

## Viewing it

It's a plain static site — no build step, no dependencies.

- **Quickest:** double-click `index.html`.
- **Best (so the fonts, canvas, and mobile menu behave exactly like production):**
  run a local server from this folder and open the address it prints:

  ```bash
  python3 -m http.server 8000
  ```

  then visit `http://localhost:8000`.

## Pages

- **Home** — hero, capability marquee, positioning statement, and a "What we do" overview
  leading with NFC (with a link through to the full Services page).
- **Services** — the hub. Three cards routing into the pages below; NFC is flagged as the
  speciality.
  - **Smart NFC Cards** — the flagship page. How a tap works in three steps, then the full
    range (Metal card, PVC card, Google Review card, Tap Stand, Tags & Keyfobs), then what
    sits behind the tap.
  - **Websites & Refurbishment** — two tracks: new builds, and rescuing a site you already
    have. Plus what every build includes.
  - **Marketing** — scoped by MARS and delivered with campaign partners. See the note below.
- **Work** — selected craft.
- **Approach** — the launch sequence (Brief · Build · Launch · Orbit) and at-a-glance signals.
- **Why MARS** — values and the "mission director" story.
- **Contact** — the enquiry form.

### A note on the Marketing page

NFC and websites are delivered by MARS end to end. Marketing is written as **partner-delivered
and the partner is deliberately not named** — the page says MARS scopes the work, briefs "our
campaign partners", and stays the client's single point of contact. That wording holds up whether
or not a specific partner arrangement is ever signed, and nothing on the site needs unpicking if
the arrangement changes. If a partnership is formalised and you want it credited by name, the
copy to change is the `.partner-note` block in `marketing.html` and the dropdown subtitle in the
nav (nine files).

### The NFC range is a first draft

The five products on `nfc.html` are a proposed line-up, not a confirmed catalogue — names, tiers,
specs and "best for" lines all need your review. The product images are **pure CSS mockups**
(`.card-mock`, `.stand-mock`, `.tag-mock` in `styles.css`), built to be swapped for real
photography once you have it.

## Brand fidelity — how the guidelines map to the code

- **Palette** — Deep Space `#050505`, Solar Gold `#C9A87E`, Moon Dust `#F3EEEA`,
  Mars Terracotta `#A6472B`, Dust Orange `#DC714D` and the gold gradient are all CSS
  variables at the top of `styles.css`. Rough ratio held to ~80% dark canvas / ~15% gold / ~5% terracotta.
- **Type** — Marcellus for display headlines, Montserrat for body / eyebrows (SemiBold caps,
  Terracotta, wide tracking). Marcellus is never used for paragraphs.
- **Accessibility** — light (Moon Dust) sections use **Ink + Terracotta only**, never gold —
  matching the WCAG note that gold-on-Moon-Dust fails contrast. Tap targets ≥ 44px, body ≥ 16px.
- **Patterns** — one pattern per surface: the **star field** sits behind the hero and contact
  (covers), the **orbit rings** live on the Approach section. They never share a surface, and
  the four-point star is used only as the signature.
- **Logo** — the real SVG marks are used throughout (gold lockup in the hero, wordmark in the
  nav/footer, icon as favicon). The tagline is dropped below the minimum lockup size, per spec.
- **Motion** respects `prefers-reduced-motion`.

## The contact form

The form posts to **Formspree**, which forwards each enquiry to `infomarsdigital@gmail.com`.

**One-time setup — the form will not deliver until this is done.** In `contact.html`, the form's
`action` is currently a placeholder:

```html
<form ... action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Create a form at [formspree.io](https://formspree.io) pointed at `infomarsdigital@gmail.com`, copy
the endpoint it gives you, and replace `YOUR_FORM_ID` with the real ID. Then confirm the
verification email Formspree sends on the first submission.

Until that's done the form **falls back to opening the visitor's email app** (`mailto:`) rather
than erroring, so the site is never visibly broken — but you'll only receive enquiries from
people who have a mail client set up. That is the exact gap Formspree closes.

Other details worth knowing:

- A honeypot field (`_gotcha`, hidden off-canvas in `.hp`) silently drops most bot spam.
- `_subject` sets the subject line of the email you receive.
- Because the visitor's address is in a field named `email`, you can hit Reply directly.
- Free tier is 50 submissions/month. Formspree emails you when you approach it.

## Things to update before going live

1. **Formspree endpoint** — see above. Nothing reaches your inbox from webmail users until
   `YOUR_FORM_ID` is replaced.
2. **The NFC range** — review the five products on `nfc.html` (see above) and swap the CSS
   mockups for real photography.
3. **Social links** — Instagram / LinkedIn in the footer point to `#`. Add the real URLs.
4. **Phone number** — the guidelines list a placeholder (`+974 XXXX XXXX`); add the real one
   if you want it on the site (currently only the email address is shown).
5. **Social preview image** — `og:image` on the home page points at an SVG, which Facebook,
   LinkedIn and WhatsApp all reject. Needs a 1200×630 PNG. The interior pages have no OG tags
   at all yet.
6. **`work.html` still shows abstract mockups**, not real projects — the three builds in
   `MARS/CLIENTS/` (Origami, Fifteen by Faubourg, Artist Cafe) are the obvious candidates.

## House style

The copy contains **no hyphens or em dashes** — not in body text, headings, meta descriptions,
`alt` text or `aria-label`s. Compound words are spelled open (`tap to connect`, `world class`,
`laser etched`) or reworded where splitting them would read badly (`Ecommerce`, `Extras` rather
than `Add-on`). Sentences that would have leaned on an em dash are restructured with a comma,
colon or full stop rather than just swapping the character. Page titles use the brand middot:
`Services · MARS`.

Keep to this when adding copy. CSS class names, HTML attributes and URLs obviously still use
hyphens — the rule is about what a reader sees.

## Deploying

Drag the `WEBSITE` folder onto **Netlify**, **Vercel**, or **Cloudflare Pages** — or push to
GitHub Pages. No configuration needed; it's fully static.
