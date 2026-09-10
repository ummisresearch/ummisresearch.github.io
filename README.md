# IMASS website

A complete, six-page research website for the Institute for Minimal Access Surgical Sciences. Designed for **https://ummisresearch.github.io/**.

## Quick start

Install Node.js 22 or later, then run these commands from this folder:

```sh
node scripts/build.mjs
node scripts/check.mjs
```

There are **no npm dependencies to install**. The optional aliases `npm run build` and `npm run check` run the same commands. The finished website is in `dist/`.

To view it locally, serve **dist**, not the repository root. If Python is installed:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000/. Do not double-click an HTML file: root-relative links require an HTTP server.

## Deploy to ummisresearch.github.io

1. Sign in to GitHub as an authorized user. Create a new public repository under **ummisresearch** named **ummisresearch.github.io**. Leave the initial README, license, and .gitignore options unchecked because this project supplies its own files. If that repository already exists, review its contents and back it up before migrating; do not overwrite it blindly.
2. Unzip this package. Open a terminal **inside the extracted imass folder**, where this README and `package.json` live.
3. Run the following commands (skip `git init` if using the included initialized working repository rather than the ZIP):

```sh
git init -b main
git add .
git commit -m "Build IMASS research website"
git remote add origin https://github.com/ummisresearch/ummisresearch.github.io.git
git push -u origin main
```

4. On GitHub, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Do not select deployment from the repository root: the published website lives in `dist/`.
5. Open **Actions → Deploy IMASS to GitHub Pages**. If the first run failed because Pages was not enabled yet, select **Run workflow** on `main` (or rerun the failed workflow).
6. Wait for the build and deployment jobs to succeed. Visit **https://ummisresearch.github.io/**. GitHub may take a few minutes to make the first deployment available.

Every future push to `main` rebuilds, checks, and deploys the site automatically. 
<!-- Organization policy may require an administrator to allow Actions or approve the `github-pages` environment. Do not disable organization protections; ask your administrator if needed. -->

<!-- **No deployment has been performed on your behalf.** This package does not contain GitHub credentials or claim ownership of the GitHub organization. Creating the remote repository and enabling Pages are your steps. -->

### Upload through the GitHub website instead

Create the repository as above, then use **Add file → Upload files** to upload the *contents* of this folder, not the outer `imass` folder. Make sure `.github/workflows/deploy.yml` is included (some file pickers hide dot-folders). If needed, use **Add file → Create new file**, name it `.github/workflows/deploy.yml`, and paste the supplied workflow. Select GitHub Actions in Pages settings and run the workflow.

## Update content without changing the design

Most updates require editing only a JSON file under `content/`. You can edit these files directly on GitHub using the pencil icon and commit the change; the workflow does the rest. Use double quotes, place commas between items, and do not add a trailing comma after the final item.

| What to change | File |
| --- | --- |
| Homepage title, introduction, research-area summaries, contact details, social links | `content/site.json` |
| Team names, roles, dates, biographies, groups and portrait filenames | `content/team.json` |
| Project titles, categories, images and optional descriptions | `content/projects.json` |
| Publication citations, years and paper links | `content/publications.json` |
| Funding award records | `content/funding.json` |
| About Us paragraphs and research-focus text | `content/source-snapshot.json` → `about-us` |
| Logo, cover, portraits and project images | `dist/assets/` |
| Colours, typography, layout and mobile breakpoints | `dist/assets/styles.css` |
| Shared header/footer and page structure | `scripts/build.mjs` |
| Menu and publication filter interactions | `dist/assets/main.js` |

Do not edit `dist/index.html` or other generated HTML: the next build replaces those files. **The CSS, JavaScript, and images in `dist/assets/` are authored source files and must remain tracked. Do not delete `dist/` to clean the project.** Only HTML, sitemap, robots.txt, and .nojekyll are regenerated.

### Add a person

Add an object to the appropriate location in `content/team.json`:

```json
{
  "name": "Full Name",
  "role": "Research Assistant",
  "dates": "Fall 2026–Current",
  "group": "Research team",
  "bio": ["First paragraph.", "Second paragraph."],
  "image": "full-name.jpg"
}
```

Copy the corresponding photograph to `dist/assets/full-name.jpg`. Use an empty string for `image` when no photograph is available; the layout uses a clean text card instead of a made-up avatar. Use an empty array `[]` if no biography is available. Move alumni by changing `group` to `Previous members`. Names create section links, so renaming someone changes their anchor.

### Add a project

```json
{
  "title": "Your project title",
  "category": "Surgical Simulation",
  "description": "An optional, approved project summary.",
  "images": ["project-image.jpg"]
}
```

Existing categories are Clinical Trials, Surgical Simulation, Research with Indigenous Communities, and Other Projects. Use `images: []` if there is no image. Images are displayed in full with contain-style fitting; selecting an image opens the full-resolution asset. When changing categories, also update homepage research-area anchors in `site.json`.

### Add a publication

Insert a record at the top of `content/publications.json`:

```json
{
  "citation": "Authors. Article title. Journal. 2026;volume:pages.",
  "year": 2026,
  "url": "https://doi.org/your-verified-doi"
}
```

The year menu is generated automatically. Use `url: ""` when no verified DOI or publication link is available. The search matches all entered words and combines with the selected year. Publication order follows the JSON order.

## Architecture

This is a dependency-free static site generator written in standard Node.js, not a React application or WordPress theme. This choice keeps deployment and long-term maintenance simple for a public research website. All pages are rendered to real HTML at build time. Content and navigation remain available without JavaScript; JavaScript only enhances the mobile menu and publication filters. Biographies and funding records use native HTML disclosure elements.

`scripts/build.mjs` centralizes shared layout and escapes content before rendering. `scripts/check.mjs` verifies routes, local images, anchors, basic HTML accessibility structure, content shapes, and menu/filter behaviour using an offline DOM stub. The check is not a full accessibility audit or browser visual test. No browser visual QA was performed in this delivery.

The `.openai/hosting.json` file declares a static output folder for compatible tooling. It has no Site ID, creates no hosted resource, and is not needed by GitHub Pages. It can remain in the repository.

## Domain changes

This version uses root-relative links and is intended for an organization/user root site or custom domain. It is **not** configured for a project subdirectory such as `username.github.io/imass/`. For a custom domain, update `url` in `content/site.json`, configure the domain and DNS in GitHub Pages settings, and rebuild. See GitHub’s official documentation below.

<!-- ## Before launch

Read [CONTENT_REVIEW.md](CONTENT_REVIEW.md) for the few source ambiguities requiring lab review. Verify the supplied images are cleared for public use, particularly any images containing people or clinical settings. No analytics, third-party font requests, tracking scripts, Instagram embeds, or contact-form data collection are included. -->

## Official GitHub guides

- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Configuring the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Using custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
