# Production Airbnb calendar integration

## What the HTML prototype already does

The `stays.html` calendar and `site.js` provide the final interaction model: property selection, month navigation, check-in/check-out range selection, and transfer of those selections to the inquiry form.

The UI intentionally treats future dates as **pending confirmation**. It does not invent live availability.

## Inputs required from Amy

For each of the four stays, obtain:

1. the public Airbnb listing URL;
2. the private Airbnb **Export calendar** URL ending in `.ics`;
3. verified guest capacity, bedrooms, beds and bathrooms;
4. minimum-night and booking-window rules;
5. any direct-booking or inquiry policy.

Populate a protected production configuration based on `calendar-feeds.example.json`. Do not publish private feed URLs in client-side JavaScript or commit real URLs to a public repository.

## Recommended implementation

1. Add a server-side or serverless endpoint, e.g. `/api/availability?property=carolina-house&from=...&to=...`.
2. Store iCal URLs in environment variables or a managed secret store.
3. Fetch each `.ics` feed server-side.
4. Parse `VEVENT` start/end ranges and normalize them to the property timezone.
5. Cache results for 10–30 minutes to avoid hitting Airbnb on every page view.
6. Return only normalized blocked ranges, never the private source URL or guest details.
7. Replace the prototype’s `pending` state with `available`, `blocked`, and `pending/error` states.
8. If a feed is stale or unreachable, fail closed: show “availability needs confirmation,” not “available.”
9. Keep the final reservation on Airbnb unless Amy adopts an approved direct-booking platform.

## On-site consultation calendar

The consultation calendar in `services.html` and `contact.html` should connect to Amy’s approved booking system or calendar API. Recommended production flow:

1. retrieve bookable slots server-side;
2. display only verified open times;
3. collect the inquiry;
4. create a tentative booking or redirect to the approved scheduler;
5. send confirmation only after the booking provider returns success.

The HTML prototype does not send forms or create reservations; it says so clearly in the interface.
