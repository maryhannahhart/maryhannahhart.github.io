# Conventions

Where things are defined, and the rules for adding more. The point of this
file is that six months from now you don't have to reverse-engineer your own
decisions.

```
index.html          markup only — no styles, no logic
css/tokens.css      colors (the design system)
css/base.css        reset, page frame, typography
css/components.css  buttons, nav, cards, figures, tables
js/charts.js        chart rendering + chart data
js/site.js          page behavior (link targets, UI)
js/consent.js       consent banner (defaults are inline in index.html)
js/analytics.js     dataLayer events — the measurement contract
```

Load order matters in two places. `tokens.css` must come before the other two,
because they consume its variables. `charts.js` must come before `analytics.js`,
because chart interaction tracking binds to rendered figures. And the inline
consent defaults must come before the GTM snippet — see Consent below.

---

## Colors

Every color is a CSS variable in `tokens.css`. Nothing else should contain a
hex value — if you find one in `components.css`, it's a bug.

| Token | Role |
|---|---|
| `--paper` | page background |
| `--panel` | raised surfaces (cards, figures) |
| `--sunk` | recessed surfaces (chips, table headers) |
| `--ink` | primary text |
| `--muted` | secondary text |
| `--faint` | labels, axis text |
| `--rule` / `--rule-hi` | borders, hairlines |
| `--s1` `--s2` `--s3` | chart series 1, 2, 3 |
| `--q1`…`--q6` | sequential ramp, light to dark |
| `--d1`…`--d5` | diverging ramp, through a neutral middle |

**The one rule that matters:** tokens are defined three times — plain `:root`
for light, a `prefers-color-scheme: dark` block for system dark, and a
`[data-theme="dark"]` block for an explicit choice. Add a token to one and you
must add it to all three, or the page renders one theme's text on the other
theme's background.

The three series colors were checked for colorblind separation against both
backgrounds. If you swap them, re-check rather than eyeballing it.

## Fonts

Three faces, three jobs. Loaded in `index.html`, applied in `base.css`.

| Face | Used for |
|---|---|
| Fraunces | headings, the name, big numbers |
| Karla | body text |
| JetBrains Mono | labels, data, chart axes, eyebrows |

Mono is doing real work here, not decoration — it marks anything that is a
value or a label rather than prose. Keep that distinction.

## Buttons and links

`.btn` is the base. `.btn.primary` is the filled variant. One primary per view;
if two things are both primary, neither is.

```html
<a class="btn primary"
   id="cta-email-hero"
   data-btn-location="hero"
   href="mailto:...">maryhannahhart12@gmail.com</a>
```

**Attribute rules:**

- `id` — unique across the whole page. Pattern: `cta-<what>-<where>` or
  `nav-<target>`. Two buttons doing the same job in different places get
  different ids (`cta-email-hero`, `cta-email-footer`), never the same one.
- `data-btn-location` — which region of the page it sits in. Custom attributes
  must carry the `data-` prefix: anything else is invalid HTML and won't appear
  in `element.dataset`.
- No `target="_blank"` in the markup. `site.js` applies it to external links
  automatically, so a link added later is covered without you remembering.

## Event naming

Defined once in `js/analytics.js`, in the `EVENTS` and `PARAMS` objects. GTM
triggers are built against those exact strings, so renaming one without
updating the container breaks the tag silently.

**Events** are `lower_snake_case`, object then verb: `section_view`,
`chart_interact`, `outbound_click`. Not `clickResumeButton`.

**Parameters** are `lower_snake_case` nouns. Reuse before inventing — every new
parameter costs a custom dimension registration in GA4, and unregistered
parameters show as `(not set)` with no backfill.

| Event | Fires when | Parameters |
|---|---|---|
| `portfolio_ready` | page load | `color_scheme`, `viewport_bucket` |
| `section_view` | a section crosses mid-viewport | `section_name` |
| `chart_interact` | first hover on a chart | `chart_id`, `chart_name` |
| `scroll_depth` | 25 / 50 / 75 / 100% | `percent_scrolled` |
| `cta_click` | a non-nav, non-external link | `cta_id`, `btn_location`, `link_text` |
| `outbound_click` | link to another domain | `link_url`, `link_domain`, + above |
| `nav_click` | in-page anchor | `cta_id`, `btn_location`, `link_text` |

**Never send:** email addresses, phone numbers, anything a visitor typed, or
anything that identifies a person. This is a public page; assume anything you
send could be read back to you.

### Adding an event

1. Add the name to `EVENTS` in `analytics.js`, don't inline a string.
2. Push it with the `push()` helper so shape stays consistent.
3. Build the Custom Event trigger and GA4 Event tag in GTM.
4. Register any new parameter as a custom dimension in GA4 **before** you need
   the data — it does not backfill.

### Two implementation notes worth keeping

`section_view` uses a middle-band `rootMargin` rather than an intersection
threshold. A tall section — the Work section is four case studies — never has
40% of itself on screen at once, so a threshold-based observer never fires for
it. This was a real bug, not a hypothetical one.

Click tracking reads attributes via `.closest("a")`, not `event.target`. The
thing physically clicked is often a child of the link, so reading straight off
the target misses roughly half of real clicks and looks random rather than
broken.

---

## Consent

Analytics is off until a visitor agrees. Three pieces, in three places:

| Piece | Lives in | Why there |
|---|---|---|
| Consent Mode v2 defaults | inline in `index.html` `<head>` | must execute **before** the GTM snippet |
| Banner markup | `index.html`, end of `<body>` | in the DOM at load, so it cannot flash in |
| Banner styling | `css/components.css` | `.consent`, `.cbtn`, `.consent-link` |
| Banner logic | `js/consent.js` | show, decide, store, withdraw |

**The ordering rule.** The defaults block must stay inline and must stay above
the GTM snippet. Move it into an external file, or below the container, and
tags fire once before the visitor has chosen — which is the exact thing the
banner exists to prevent. It is the only inline script on the page, and the
comment above it says so.

Everything defaults to `denied` except `functionality_storage` and
`security_storage`. `wait_for_update: 500` gives the visitor half a second of
grace before GTM stops holding tags.

The choice is stored in `localStorage` under `mhh_consent`. That key appears in
two files — the inline block and `consent.js` — so change both together.

**Withdrawal.** The "Cookie settings" button in the footer clears the stored
choice and brings the banner back. Under GDPR, withdrawing consent has to be as
easy as giving it, so this is a requirement rather than a courtesy.

**In GTM:** turn on Admin → Container Settings → *Enable consent overview*,
then set every tag's Advanced Settings → Consent Settings → *Require additional
consent* to `analytics_storage`. Without that, the defaults hold tags but
nothing enforces it per tag.

**Testing it.** Use an incognito window, or delete the `mhh_consent` key in
DevTools → Application → Local Storage. On decline, confirm in the Network tab
that no request reaches `google-analytics.com/g/collect`.

## Local development

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Use a server rather than opening the file directly. On `file://`,
`location.hostname` is empty so external-link detection misfires, and GTM
Preview will not attach.
