# RAJU TELLER

Performer-controlled party trick. The performer supplies the answer secretly in the petition field; this is not AI or a psychic service.

## Projects

- `native/`: regenerated Expo/React Native prototype for iOS and Android. Run `npm ci`, `npm test`, `npx tsc --noEmit`, then `npx expo start` there.
- `web/`: portable React/Vite version, without proprietary hosted-page dependencies. Run `npm ci`, `npm run dev` or `npm run build` there. It can later be deployed from this subdirectory, but no deployment is configured or authorized by this package.
- `CLAUDE.md`: coding guidance. Does not connect Claude, install a plugin or authorize automatic changes.
- `docs/solutions/`: reusable project lessons.

## Current limits

Native now includes gated RevenueCat purchase/restore, AdMob/UMP, first-use guide and private Settings. No native service flow or physical device has been verified. No production identities, signing or payment credentials included. Store policies and dependency findings must be addressed before launch. Do not treat JavaScript export or web screenshot checks as physical-device tests.

Native dependency audit on October 15, 2026: 24 advisory entries after SDK integration, including parent paths (7 moderate, 17 high, none critical). Do not apply forced framework downgrades automatically. Review root advisories and compatible upstream patches, then retest. Package dependencies and disclosure forms must be reviewed again when monetization is added.

No analytics or backend in the app core. Entered answers/questions remain in screen memory, but browser extensions, keyboards and hosting access logs may have separate data practices. A public privacy policy must describe the final deployment and SDKs, not just this prototype.

This repository is not a live deployment. Review all changes and approve merge/release manually. Do not expose the trick code publicly without an explicit audience decision.

Engineering/release gates and local checks: [docs/PRODUCTION.md](docs/PRODUCTION.md). Privacy, support and store texts in docs/store are incomplete drafts, not published legal policies. The standalone web version remains core-only, without web billing/ads.
