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

## Layout

The page is a fixed rail plus a scrolling panel: `.shell` is a flex row,
`.rail` is `position: sticky; height: 100vh`, and `.panel` takes the rest.
Below 860px the rail folds into a bar above the content.

Selected work is a two-up card grid. **The grid lives on `#work` itself** —
there is no inner wrapper element, and `.sechead` spans both columns with
`grid-column: 1 / -1`. Below 1000px it collapses to one column.

Every `1fr` grid track here is written `minmax(0, 1fr)`. A bare `1fr` floors at
min-content, which let the résumé grid push the page 324px wider than the
viewport on a phone. If you add a grid, use `minmax(0, 1fr)`.

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

**Attribute rules.** Every `nav-*` and `cta-*` link carries all four:

```html
<a class="btn primary"
   id="cta-email-hero"
   data-btn-location="hero"
   data-event-label="email"
   data-trigger="button_click"
   href="mailto:...">Email</a>
```

- `id` — unique across the page. `cta-<what>-<where>` or `nav-<target>`. The
  same action in two places gets two ids (`cta-email-hero`, `cta-email-footer`).
- `data-btn-location` — which region it sits in: `rail`, `hero`, `footer`, `cv`.
- `data-event-label` — what is being clicked, one lower_snake_case word from the
  fixed list below. Not the visible text, which changes; the label should not.
- `data-trigger` — always `button_click`. It is what the GTM trigger matches on,
  so a new button is tracked the moment it carries the attribute, with no
  container change.

Everything is `data-` prefixed. A bare `eventlabel` or `trigger` is invalid HTML
and never appears in `element.dataset`.

**The label vocabulary** — reuse these, don't invent near-duplicates:

`work` · `skills` · `visualizations` · `method` · `resume` · `certifications` ·
`contact` · `email` · `linkedin` · `github` · `cv_download` · `resume_request`

**Contact order is fixed everywhere**: email, then LinkedIn, then GitHub. Rail,
hero and footer all follow it, so the page never reorders itself on a visitor.

**The CV** is `Mary_Hannah_Hart_CV.pdf` at the site root, linked with the
`download` attribute from the rail and the footer. Replacing it means dropping a
new PDF at that exact filename — no markup change.

**No `target="_blank"` in the markup.** `site.js` applies it to external links,
so anything added later is covered.

### The GTM trigger for all of this

One Click trigger covers every button: **Click → All Elements**, fire on *Some
Clicks*, where `Click Element` **matches CSS selector**
`[data-trigger="button_click"], [data-trigger="button_click"] *`.

The trailing ` *` is not optional — the element physically clicked is often a
child of the link (the SVG inside Download CV, for instance), and matching only
the attribute drops those clicks silently.

Read the label with a Custom JavaScript variable, not an Auto-Event Variable:

```javascript
function() {
  var el = {{Click Element}};
  if (!el || !el.closest) return undefined;
  var t = el.closest('[data-event-label]');
  return t ? t.getAttribute('data-event-label') : undefined;
}
```

Same shape for `data-btn-location`. Auto-Event Variables read only the clicked
element and miss the child case.

## Event naming

The page pushes **one** event: `chart_interact`. Everything else is triggered
in GTM from the DOM, which is why the markup carries `id` and
`data-btn-location` attributes.

**The dividing line:** if GTM can see it in the DOM, GTM triggers it. If it
needs something only the page knows — a hover, an element's own title, internal
state — the page pushes it. Duplicating a GTM-triggerable event in code means a
deploy every time a trigger changes, which is the thing GTM exists to avoid.

| Signal | Where it's handled |
|---|---|
| `chart_interact` | `js/analytics.js` — no hover trigger exists in GTM |
| `consent_update` | `js/consent.js` |
| Page view | GTM — Google Tag on Initialization / All Pages |
| Scroll depth | GTM — built-in Scroll Depth trigger, 25/50/75/100 |
| Button clicks | GTM — Click trigger on `{{Click ID}}` or `data-btn-location` |
| Outbound links | GTM — Just Links, Click URL doesn't contain the hostname |
| Nav clicks | GTM — Just Links, Click URL contains `#` |

### Naming rules

**Events** are `lower_snake_case`, object then verb: `chart_interact`, not
`hoverChartEvent`. **Parameters** are `lower_snake_case` nouns. Reuse an
existing parameter before inventing one — each new one costs a custom dimension
registration in GA4, and unregistered parameters report as `(not set)` with no
backfill.

`chart_interact` sends `chart_id` (the svg's id, e.g. `c3`) and `chart_name`
(the figure's visible title). It fires once per chart per page: the useful
signal is whether a chart was engaged with at all, not how many times the
pointer crossed it.

**Never send:** email addresses, phone numbers, anything a visitor typed, or
anything identifying a person. This is a public page.

### Adding an event

First ask whether GTM can trigger it from the DOM. If it can, build it there
and add whatever `id` or `data-` attribute the trigger needs to the markup. Only
if it genuinely can't — hover, timing, internal state — add it to
`analytics.js`, then build the Custom Event trigger and register any new
parameter as a GA4 custom dimension **before** you need the data.

### One implementation note worth keeping

Click tracking — wherever it lives — must resolve the link with `.closest("a")`
rather than reading `event.target`. The element physically clicked is often a
child of the link, so reading straight off the target misses roughly half of
real clicks and looks random rather than broken. In GTM this is the reason to
match the CSS selector `[data-btn-location], [data-btn-location] *` rather than
the attribute alone.

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
