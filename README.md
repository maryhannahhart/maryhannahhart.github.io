# Portfolio site — setup and editing

Your portfolio as a single self-contained file. Everything (styles, charts,
fonts) is inside `index.html`, so there is nothing to install and nothing to
build. Upload it, and it works.

---

## Publishing it (about 10 minutes, once)

1. **Create a free account** at https://github.com/signup
   Pick your username carefully — it becomes part of your web address.
   Something like `maryhannahhart` is ideal.

2. **Create a new repository** at https://github.com/new
   - Repository name: **`<your-username>.github.io`** — type your own username,
     exactly as you registered it, followed by `.github.io`.
     (This exact name is what gives you the clean address below. Any other name
     works too, but the URL becomes `username.github.io/repo-name`.)
   - Set it to **Public**. Private repositories can't publish a free site.
   - Click **Create repository**.

3. **Upload `index.html`**
   On the new repository page, click **uploading an existing file**, drag
   `index.html` in, and click **Commit changes**.

4. **Turn on Pages**
   Go to **Settings → Pages** (left sidebar).
   Under *Build and deployment*, set Source to **Deploy from a branch**,
   branch **main**, folder **/ (root)**, and click **Save**.

5. **Wait about a minute**, then visit:
   `https://<your-username>.github.io`
   The first publish is the slow one. Later edits appear in under a minute.

---

## Editing it later

1. Open your repository and click `index.html`.
2. Click the **pencil icon** (top right) to edit in the browser.
3. Make your change.
4. Click **Commit changes** — the live site updates within about a minute.

### Where things are

| What you want to change | Where to look |
|---|---|
| Any sentence on the page | Between `<body>` and `<script>`. Search for the text. |
| The four headline stats | Search for `class="strip"` near the top. |
| Numbers inside a chart | The `<script>` block at the bottom — arrays like `var data = [372,341,...]`. Change a value and the chart redraws. |
| Colors | The `:root { }` block at the very top of `<style>`. |
| Force light mode always | Change `<html lang="en">` to `<html lang="en" data-theme="light">`. |

**Tip:** before a big edit, download a copy of `index.html` as a backup. If an
edit goes wrong, GitHub keeps every previous version under the **History**
button, and you can restore any of them.

---

## A custom domain (optional)

If you ever buy a domain (around $12/year), you can point it at this site in
**Settings → Pages → Custom domain**. `maryhannahhart.com` reads better on an
application than a `github.io` address, but it is not required.

---

## Before you send the link

- Open it on your phone as well as a laptop.
- Check the note about synthetic figures still reads the way you want.
- Make sure the email and LinkedIn links work.
