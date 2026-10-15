# Input behaviour and release checks

Keep the secret answer in the petition field, with a separate question field. `/answer/` disguises typed text with the fixed petition. Closing slash completes the petition, and Enter or the button reveals immediately. Deletion must update the secret state. Test paste, replacement, emoji and Hindi composition rather than assuming keydown events cover every keyboard.

Use reduced motion to suppress sway and sparkles. Review narrow screens and long answers. Never log the secret answer or send it to analytics. On actual iOS and Android, check keyboard prediction and composing text before release.

Each change: write a short plan, implement, run tests and type checks, review visual output if UI changed, record reusable findings here. Keep Claude integration and credentials outside source control.

## Commerce gate review

Unknown entitlement is not free-user proof: keep banners off until current customer info is known. Only an active RevenueCat raju_pro entitlement removes ads. Do not simulate purchases, cache a local premium boolean as authority or unlock on a payment-button tap. Serialise purchase/restore, refresh on foreground/customer updates, and test pending/refund/network states on actual devices.

Delay advertising measurement and initialise only after UMP canRequestAds; keep privacy choices accessible. Do not show ads to already-known pro users. Use test banner units in development. Missing dashboard configuration must block production instead of falling back to sample IDs. SDK compilation is not native runtime verification.
