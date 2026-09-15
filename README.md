# Umesh Joshi — Portfolio

Next.js App Router, TypeScript, Tailwind CSS, Motion, Three.js, and Radix/shadcn-style UI primitives. Responsive project gallery, accessible dialogs, reflective 3D hero, and reduced-motion support.

## Run

Lenis smooths desktop wheel scrolling and section links while preserving native touch scrolling. Reduced-motion preferences disable Lenis. Project dialogs stop page smoothing and keep an independent native scroll area. The toolkit groups frontend, backend, database, AI/3D, and development/deployment technologies from the featured projects.

`npm ci` then `npm run dev`. Build with `npm run build`; run production with `npm start`.

## Content

Project data and biography: `app/page.tsx`. Theme: `app/globals.css` and `app/personal.css`. Metadata: `app/layout.tsx`.

The hero's Download my resume button serves `public/Umesh-Joshi-Resume.pdf`, exported from the Google Docs resume supplied by Umesh. This is a saved copy; replace the PDF when the resume changes. It does not auto-sync from Google Docs.

Project descriptions are based on public repository READMEs. RoleLens screenshots and Fold Studio concept imagery load from the supplied public repositories. Shortlist and Zuperior use the owner's supplied screenshots, saved in `public/shortlist-preview.png` and `public/zuperior-preview.png`. The same images appear in project cards and dialogs without cropping. Zuperior's contribution details and implementation stack await the owner's input.

The interactive hero supports solid/wireframe materials, lime/ice accents, explicit rotation, and pause/play. Rendering pauses offscreen and in background tabs; reduced-motion preferences disable automatic rotation. A WebGL fallback preserves access to the page if 3D is unavailable. Projects have spring-based pointer tilt and hover highlights. The headline animates in, and a progress bar tracks the page.

## Contact form

Enquiries go to `umeshjoshi.dev@gmail.com`. Without email configuration, the validated form prepares a mailto draft with a copy fallback. It never claims an email was sent in this mode. Nothing is stored in a database or browser storage.

To enable Resend, set these server-only values in ignored `.env.local` or the hosting provider's environment settings:

- `RESEND_API_KEY`: your Resend API key; never paste it into chat or commit it.
- `CONTACT_FROM_EMAIL`: an authorized sender. `Umesh Portfolio <onboarding@resend.dev>` can be used for Resend testing to the account owner's email; use a verified domain sender for general production use.
- `CONTACT_ALLOWED_ORIGIN`: the exact portfolio origin, without a trailing slash (local: `http://127.0.0.1:3016`). Update this for Vercel.

Refresh the page after saving local settings. The form switches to Send message when all three values are populated. Sending uses the fixed recipient and the visitor's email as reply-to. The endpoint checks origin, payload size, required fields, and a honeypot, and applies a bounded per-process email rate limit. For a public site receiving significant traffic, configure shared rate limiting at the hosting edge. Provider errors are not exposed to visitors. Provider acceptance is not a guarantee of inbox delivery.

Validation: `node --test tests/contact.test.mjs` runs the real input validation and endpoint with a mocked email provider; no real emails are sent by tests. A real delivery test is still needed once credentials are saved.

## Vercel

Import this directory as a Next.js project, or run `vercel` while signed in. Default build settings apply. Set the optional Resend environment variables above for direct email delivery. The local preview is not a public deployment.
