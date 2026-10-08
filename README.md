# MC Growth Consultancy website

The full rebuild of mcgrowthconsultancy.co.uk. Author: Martyn Cohen.

This branch (`site-rebuild`) holds the new site. Nothing here is live until it is published, and `main` has not been touched.

## What is in here

| Folder or file | What it is |
| --- | --- |
| `site/` | The finished website, ready to publish. Never edit this by hand, it is rebuilt every time. |
| `src/pages/` | The pages: home, recruitment, business sales, growth, systems and AI, jobs board, businesses for sale, about, contact, privacy, terms. |
| `src/blog/` | The 21 articles carried over from the old site, plus `posts.json` (titles, dates, summaries, topics). |
| `src/testimonials.json` | Every recommendation used on the site, in one place. |
| `src/js/listings-data.js` | The jobs and the businesses for sale. Edit this to add, change or remove a listing. |
| `src/site.json` | Phone, email, Calendly link, Google Analytics ID, VAT number and trading address. |
| `src/css/site.css` | The look of the site. |
| `build.py` | Turns `src/` into `site/`. Run it after any change. |
| `netlify.toml` | Tells Netlify how to build and publish the site. |

The loose image files and `index.html.txt` in the top folder are from before the rebuild and are not used by the new site.

## Making a change

1. Edit the file in `src/`.
2. Run `python3 build.py` (add `--preview` to also make a click-through copy in `preview/` that sends nothing).
3. Open `site/index.html` in a browser to check it.
4. Commit and push.

## Publishing

The site is plain HTML, so there are two ways to put it live on Netlify:

- Connect this repository to the Netlify site. Netlify runs `python3 build.py` and publishes `site/` on every push.
- Or drag the `site` folder onto the Netlify site's Deploys page.

The old blog addresses are kept (`/blog/blog-...`), so existing links and search results carry on working.

### Forms

The enquiry, recruitment brief, seller, buyer, job posting and job application forms use Netlify Forms. After the first deploy:

1. In Netlify, open Forms and check each form has appeared.
2. Add an email notification to Martyn@MCGrowthConsultancy.co.uk for each one.
3. Send a test through each form on the live site.

Forms only work once the site is on Netlify. Opened from a folder or in the preview they show the thank-you message without sending anything.

## Before it goes live

- [ ] Add the VAT number and trading address to `src/site.json` (they appear in the footer).
- [ ] Remove the sample jobs and sample businesses in `src/js/listings-data.js`, or set `showSamples` to `false`.
- [ ] Read the "How I Charge" sections on the recruitment and business sales pages and confirm they match the current terms.
- [ ] Confirm each client is happy to be quoted (see `src/testimonials.json`).
- [ ] Have the privacy notice and website terms checked, in particular the retention periods in the privacy notice.
- [ ] Re-read the older articles. They are in the "we" voice of the old site, and the business sale article had its fee paragraph updated to match the current three-stage model.
- [ ] Check the Calendly link and Google Analytics ID in `src/site.json`.

## What changed from the old site

- One long page became a proper site with a page for each service, so each can be found in search and linked to directly.
- Recruitment and business sales now have their own pages, with enquiry forms.
- New flooring jobs board with a job description builder, and a businesses for sale page.
- All 21 articles carried over at their existing addresses, with topics, a filter and related articles.
- Fresh client recommendations added.
- Analytics now only loads if the visitor agrees. Privacy notice and terms are real pages.
- Search basics added: page titles and descriptions, canonical addresses, sitemap, RSS feed and structured data.
