# Release checklist - October 15, 2026

Status: engineering candidate, NOT production-ready. Native SDK code has not run on a physical device or completed a purchase/consent transaction. No signed binary, store submission, release or public web deployment has been made.

## Workflow

Plan a bounded change, implement, test/type-check/export, review the code and visible UI, then capture reusable lessons in docs/solutions. CLAUDE.md describes project constraints. This is an implemented project workflow, not an installed Compound Engineering plugin or linked Claude account. Owner must separately choose Claude Code/chat and grant repository access.

## Local checks

In native: `npm ci && npm run check`, `npx expo-doctor`, `npx expo export --platform all`, `npm audit`. In web: `npm ci && npm run build`, `npm audit`. Audit failures remain failures; do not suppress them in CI. No cloud Actions workflow is installed.

## Configuration

Use native/.env.example for PUBLIC SDK keys and non-secret IDs. RevenueCat public SDK keys are not server API secrets. Never put RevenueCat secret API keys, service-account JSON, private signing keys, passwords or tokens into EXPO_PUBLIC variables or Git. Obtain credentials through account tools, not repository files.

Production EAS config intentionally fails if required IDs/keys/privacy/support are absent or known test IDs are used. Native development uses Google sample app IDs and test banners, never live ads. This guard reduces mistakes; it is not a replacement for reviewing actual dashboard/product configuration. User still chooses permanent iOS/Android IDs, price, countries and legal developer identity. Test store-localized pricing before release.

## RevenueCat and store setup

Create one non-consumable remove-ads product in each store. In RevenueCat Android product MUST be non-consumable (otherwise it may be consumed and re-bought). Map both to entitlement `raju_pro`, current offering's lifetime package. Purchase/restore grants nothing locally: active entitlement must be returned by RevenueCat. Unknown purchase status keeps banners off. Cancellation shows no unlock. Refresh on foreground and customer updates handles entitlement changes; validate refund/revocation latency with actual store/RevenueCat configuration.

Test real sandbox/store accounts: buy, cancel, ask-to-buy/pending, interrupted network, refund/revoke, reinstall/restore, new device with same store account, wrong store account, unavailable offering, offline startup and duplicate taps. No cross-store entitlement transfer is promised without app-user account design.

## AdMob and consent

Configure each real app ID and banner unit, supported store listing, account approval, public developer site/app-ads.txt, app verification and readiness review. Configure AdMob Privacy & messaging UMP GDPR/US-state messages and iOS IDFA/ATT flow as appropriate. SDK app measurement is delayed. First-use guide precedes SDK requests. UMP runs only after customer status is known and no unlock is active. Banner requires canRequestAds, known non-pro status and onboarding. Privacy choices are in Settings. Errors fail closed (no ads); core gameplay remains usable. Declining tracking must never gate gameplay.

ATT is delegated to the dashboard-configured UMP flow; validate that configuration on actual iPhone. Do not claim UMP alone handles every country's law. Determine launch countries, age audience and final data practices with legal review. Current code caps ad content rating at PG but is NOT a child-directed implementation. Do not list as designed for children without a separate policy/code review. Test banner failure, no fill, consent required/not required/denied, changed choices and tracking denied. Never click your own live ads.

## Privacy/support and review

Drafts in docs/store are NOT legal advice or published policies. Fill developer identity/contact, exact SDK data flows, countries/age audience, retention and rights handling; publish the final policy on a stable public HTTPS URL and set it in app and stores. Complete Apple App Privacy and Google Data safety including SDK data. Do not send secret answers/questions to logging, analytics or crash metadata. Keyboard providers and deployment logs need their own review. Do not publish placeholder support details.

The performance screen keeps the trick private, but first-use buyer guide and reviewer notes explain it honestly. Apple false-feature and minimum-functionality policies and Google's deceptive/limited-functionality rules remain release risks. Do not advertise supernatural predictions or guarantees, disguise functionality from reviewers, or assume an entertainment disclaimer guarantees approval.

## Owner-controlled release gates

Apple enrolment/identity/US$99 annual regional checkout, Google US$25 registration and verification, Expo account/signing, banking/tax/agreements and final price/country decisions. India Apple enrolment uses the Apple Developer app. New Google personal accounts (after Nov 13 2023) require 12 continuously opted-in closed-test users for 14 days before applying for production access. Review can still refuse access. Recruit actual testers, inspect feedback, and do not claim automated tests satisfy it.

Replace default Expo icons and splash with approved assets. Inspect phone/tablet layouts, safe areas, keyboards, Hindi IME, paste/selection, large fonts, reduced motion, screen-reader focus and answer announcement on real iOS/Android. Run billing/ads/consent tests in signed development/store test builds, not Expo Go or web. Perform a final secret/dependency scan, owner review of screenshots/listing/privacy, staged release and crash/commerce monitoring. No release until every applicable gate is verified.

## Dependency blocker

Current native audit after adding SDKs: 24 entries (7 moderate, 17 high, 0 critical), including multiple parent paths. Three root advisories enter through Expo CLI/Metro/signing/xcode tooling: braces <=3.0.3, node-forge <=1.4.0, uuid <11.1.1. Registry latest braces 3.0.3 and node-forge 1.4.0 remain affected at this check. uuid is major-version-incompatible with the xcode dependency; an untested override is not a safe fix. Do not force npm audit fix --force, which proposes old framework downgrades. Build/signing/CI exposure matters even if the runtime bundle does not call these libraries. Keep dev servers local, avoid untrusted glob input/certificates, and require upstream patched compatible versions or a security-reviewed replacement before production. No vulnerability is being declared harmless or fixed here.

Sources: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm ; https://github.com/advisories/GHSA-86w9-cpqp-85rv ; https://github.com/advisories/GHSA-w5hq-g745-h8pq ; https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent ; https://www.revenuecat.com/docs/getting-started/installation/expo ; https://www.revenuecat.com/docs/getting-started/entitlements/android-products ; https://developer.apple.com/app-store/review/guidelines/ ; https://support.google.com/googleplay/android-developer/answer/14151465
