# RAJU TELLER - regenerated native core

Rebuilt October 15, 2026 from the currently published web prototype's source and mascot. This is NOT the earlier native ZIP, a store-ready release, or a signed installable app.

## Run

`npm ci`
`npx expo start`
`npx tsc --noEmit`
`npx expo export --platform all`

The approved two-field core is ported to React Native. Type `/answer/` in Call on Raju; the visible petition disguises your input. Type the separate question and press Enter or Tell me, Raju. The answer is supplied by the performer, not an AI or psychic service. Questions and answers stay in screen memory. Reset clears them. Nothing is persisted or uploaded by the app's own core.

Keyboard vendors may process typed data. Device testing is still needed to check slash entry, predictive keyboard leaks, paste/selection, composition and accessibility on both platforms. Reduced motion disables sway and sparkles.

## Verification

TypeScript passed. Eight logic checks passed (capture, ordinary input, deletion, reset, emoji, Hindi, paste, long text). Android/iOS/web JavaScript exports passed. No signed builds, native screenshot/device tests, purchases, ads or store approval have been completed. Web-render screenshots are supporting evidence only, not proof of native-device layout.

Fresh lockfile audit: 22 advisories (7 moderate, 15 high, zero critical). Counts include parent dependency paths, not 22 separate root vulnerabilities. Core roots: braces pattern stack exhaustion, node-forge RSA verification, uuid buffer bounds. Paths run through Expo/RN build/CLI dependencies. Runtime reachability was not fully established. Suggested automated major fixes would downgrade Expo to 44 and RN to 0.72; these were NOT applied. Keep this a production blocker to resolve through compatible upstream updates and retesting.

## Not included

The lost prior monetization scaffold is not silently substituted. This rebuilt project has NO RevenueCat purchases, NO AdMob SDK and NO consent flow. Add them only after price, ad-free entitlement, countries and store account configuration are confirmed. Use `raju_pro` entitlement + non-consumable lifetime product and native store IAP. Use development builds for native IAP/ads, test ad units in development, and actual account-specific IDs in release. Never ship placeholder IDs.

## Production configuration still needed

Set permanent iOS bundle ID and Android package ID, owner Expo/EAS project, signing credentials, actual icons/splash, support/privacy URLs and store records. Do not treat the temporary slug as a confirmed product identifier. EAS profile template is included but does not create credentials, upload, spend money, submit or release.

CLAUDE.md is project guidance only. No plugin or external agent integration has been installed. No repository has been created or pushed. Review all changes through PRs, with manual merge and release.
