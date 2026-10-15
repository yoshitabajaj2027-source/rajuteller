# Input behaviour and release checks

Keep the secret answer in the petition field, with a separate question field. `/answer/` disguises typed text with the fixed petition. Closing slash completes the petition, and Enter or the button reveals immediately. Deletion must update the secret state. Test paste, replacement, emoji and Hindi composition rather than assuming keydown events cover every keyboard.

Use reduced motion to suppress sway and sparkles. Review narrow screens and long answers. Never log the secret answer or send it to analytics. On actual iOS and Android, check keyboard prediction and composing text before release.

Each change: write a short plan, implement, run tests and type checks, review visual output if UI changed, record reusable findings here. Keep Claude integration and credentials outside source control.
