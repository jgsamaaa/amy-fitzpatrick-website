# Amy FitzPatrick Real Estate — HTML prototype

A responsive, multi-page redesign concept based on the public content and official imagery available on Amy FitzPatrick’s current website.

## Review locally

From this directory:

```bash
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Pages

- `index.html` — homepage
- `services.html` — buyer/seller journeys, consultations, preferred-date calendar
- `properties.html` — property search/IDX design and verified featured listing
- `property.html` — River Reach Way property-detail template
- `portfolio.html` — filterable listings/renovations/stays portfolio
- `project.html` — project-detail system
- `stays.html` — four stays and interactive availability-request calendar
- `stay-carolina-house.html` — complete Carolina House stay detail with nine-photo expandable gallery
- `stay-carolina-north.html` — North Side nine-photo gallery, description and calendar
- `stay-carolina-south.html` — South Side nine-photo gallery, description and calendar
- `stay-charleston.html` — Charleston House nine-photo gallery and calendar
- `meet.html` — Amy’s biography and experience
- `contact.html` — inquiry form and consultation calendar

Shared files:

- `styles.css` — complete responsive design system
- `site.js` — mobile navigation, filters, calendars, selectors and prototype-form behavior
- `assets/` — selected official site imagery

## Calendar status

The stay and consultation calendars are functional HTML prototypes:

- month navigation works;
- check-in/check-out selection works;
- stay selection works;
- chosen property and dates pass into the contact URL;
- consultation-date selection works;
- dates are explicitly shown as pending rather than falsely labeled available.

**Live Airbnb availability is not connected**, because the public website did not expose the four Airbnb iCal export URLs. See `docs/airbnb-calendar-integration.md` and `calendar-feeds.example.json` for the production handoff.

## Production facts to confirm

1. Correct public phone number. The current site displays `843-813-9505`, while an underlying telephone link previously resolved differently.
2. Buyer/seller consultation prices, duration and cancellation rules.
3. Purpose and audience of the current “Open House” appointment.
4. Current title/role claims and association memberships.
5. Airbnb listing URLs, policies, capacities and four private iCal export URLs.
6. MLS/IDX provider and credentials. The current public property link is invalid.
7. Approved form destination: email, CRM or booking service.

## QA

`qa_site.py` runs the full automated browser audit. The latest verified report is `renders/site-qa.json`.

Validated at 1440px desktop and 390px mobile across all thirteen pages, including local links, images, console errors, duplicate IDs, horizontal overflow, menu behavior, portfolio filtering and calendar interactions.
