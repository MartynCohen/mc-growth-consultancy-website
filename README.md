# mc-growth-consultancy-website
MC Growth Consultancy Website

## Jobs board and businesses for sale pages

Two standalone pages, added on the `jobs-and-businesses-for-sale` branch for review. Author: Martyn Cohen.

- `jobs.html` is the flooring jobs board: browse and filter roles, apply, register a CV, post a job.
- `businesses-for-sale.html` holds anonymised listings, buyer registration and a seller enquiry form.
- `assets/listings-data.js` holds every job and business listing. It is the only file to edit when a listing changes, and the notes at the top explain how.
- `assets/pages.css` and `assets/pages.js` are shared by both pages.

### Before these go live

- Listings without `"real": true` are placeholders and show a Sample tag. Set `showSamples` to `false` in `assets/listings-data.js` to hide them all.
- Prices shown as `£XX + VAT` are still to be set.
- The forms are written for Netlify Forms. On a Netlify site with form detection switched on, submissions arrive in the Netlify dashboard and can be forwarded by email. On any other host they will show a "didn't send" message until a form handler is added.
- Opened straight from a folder, the pages work as a preview and send nothing.
- Nothing publishes itself. A job goes live when it is added to `assets/listings-data.js`.
