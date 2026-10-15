# Native engineering candidate

Expo SDK 57 / React Native core plus RevenueCat purchase/restore and AdMob/UMP code. NOT production-ready. No signed device build or real store transaction/consent flow verified. See ../docs/PRODUCTION.md for full gates.

Run `npm ci`, `npm run check`, `npx expo-doctor`, `npx expo export --platform all`. For native commerce/ads use a development build with expo-dev-client, not Expo Go. Configure public keys/IDs through environment values listed in .env.example. Production EAS configuration intentionally fails without required settings and rejects known sample IDs/test keys.

First use shows the honest performer guide. The performance screen has a Settings entry, not trick instructions. Settings has guide, remove-ads purchase with store-localised price, restore, privacy choices, policy/support links and animation toggle. No fake transaction succeeds when configuration is missing. Ads require confirmed non-pro customer status, onboarding and UMP eligibility. Missing service or consent keeps ads off, never blocks gameplay.

Current audit: 24 entries, 7 moderate/17 high/0 critical, includes repeated parent dependency paths. No forced downgrade or unreviewed cryptography patch applied. Defaults still include Expo placeholder app icons/splash, to replace before release. User account/signing/configuration, policy completion and real-device QA remain mandatory.
