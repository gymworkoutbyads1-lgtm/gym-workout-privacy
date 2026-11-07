# gym-workout-privacy
Public privacy policy and support information for Gym and Workout by ads.

## Branded password reset

`reset-password.html` is the customer-facing Firebase password-reset handler.
It uses the existing ADS logo and calls Firebase Auth's REST API directly.
Passwords and action codes are never stored in browser storage or analytics.
Only the public Firebase project API key is included; there are no admin credentials.

After deployment, configure Firebase Authentication > Templates > Password reset >
Customize action URL to use:
`https://gymworkoutbyads1-lgtm.github.io/gym-workout-privacy/reset-password.html`

Do not activate the URL until its deployed assets load successfully. Firebase may
apply this handler URL to other email actions: supported verification and recovery
actions are passed back to the project's original Firebase-hosted handler. Arbitrary
continue URLs are ignored. The no-code page explains how to request a reset in-app.

Validation completed locally: invalid/missing links, foreign-key rejection,
password policy and mismatch checks, safe network options, error handling, and a
Firebase Auth emulator reset followed by successful new-password sign-in and
rejection of the old password and reused code. Browser checks cover desktop,
390px mobile layout, empty and mismatched passwords, the success view using a
local-only fixture, and a real Firebase invalid-code response. No real account
passwords were changed by these tests. A customer-email end-to-end check remains
necessary after Firebase accepts the custom action URL.
