# Authentication Feature — Branch Changes

Branch: `feature/DGW-4250-implement-authentication-and-login-ai-chatbot`

Summary of what changed to add a Google sign-in gate to Neural Bridge. For the plan this was built from, see [objective-as-a-developer-validated-parnas.md](./objective-as-a-developer-validated-parnas.md). For dashboard setup steps, see [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md).

## What this adds

Neural Bridge was previously fully open — anyone with the deployed URL could use the app and read/write every row in `project_configs`. This branch adds a login gate:

- **Google sign-in only** — no email/password form, no captcha.
- **Restricted to the `doctorgenius.com` Google Workspace domain** — any `@doctorgenius.com` account is accepted; everyone else is rejected. Enforced in two layers: Google's own OAuth consent screen (once configured as an Internal app under the Workspace org — a dashboard step, see the setup guide) and an app-side domain check as defense-in-depth.
- **Database access matches the same domain restriction** — Row Level Security on `project_configs` now checks the signed-in user's email domain instead of being wide open.

No new npm packages were added — this uses `@supabase/supabase-js`, which was already a dependency, since identity is stored in Supabase Auth (`auth.users`) rather than a hand-rolled table.

## New files

| File | Purpose |
|---|---|
| [`src/lib/authConfig.js`](./src/lib/authConfig.js) | `isCorporateAccount(email)` — pure helper checking the email ends with `@${REACT_APP_ALLOWED_EMAIL_DOMAIN}` (defaults to `doctorgenius.com`) |
| [`src/contexts/AuthContext.jsx`](./src/contexts/AuthContext.jsx) | `AuthProvider` + `useAuth()`. Tracks `{ session, user, authorized, loading, error }` via `supabase.auth.getSession()` and `onAuthStateChange`. If a session comes back for a non-corporate domain, it immediately signs the session out and sets `error: 'unauthorized-domain'` |
| [`src/components/auth/AuthGate.jsx`](./src/components/auth/AuthGate.jsx) | Shows a loading spinner while auth state resolves, `LoginScreen` when there's no authorized session, otherwise renders the app |
| [`src/components/auth/LoginScreen.jsx`](./src/components/auth/LoginScreen.jsx) | Single "Sign in with Google" button, styled to match the existing app; shows inline errors for OAuth failures and the "unauthorized domain" case |

## Modified files

| File | Change |
|---|---|
| [`src/App.js`](./src/App.js) | Wraps `WebDesignRequirementsApp` in `AuthProvider` + `AuthGate` |
| [`src/components/web-design-requirements-app.jsx`](./src/components/web-design-requirements-app.jsx) | Adds the signed-in user's email and a "Sign out" control to the header |
| [`supabase/schema.sql`](./supabase/schema.sql) | Replaces the `using (true) with check (true)` policy on `project_configs` with `auth.jwt() ->> 'email' like '%@doctorgenius.com'` |
| [`.env.example`](./.env.example) | Adds `REACT_APP_ALLOWED_EMAIL_DOMAIN=doctorgenius.com` |
| [`README.md`](./README.md) | New "Authentication Setup" section, updated file structure and RLS description |
| `package.json` | No changes — no new dependencies required |

## New environment variable

```
REACT_APP_ALLOWED_EMAIL_DOMAIN=doctorgenius.com
```

Set in `.env.local`. Defaults to `doctorgenius.com` in code if unset, but should be set explicitly.

## What still needs manual setup

Code changes alone don't turn this on — the Supabase project and Google Cloud project need dashboard configuration before sign-in works. See [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) for the full walkthrough. In short:

1. Enable the Google provider in Supabase (Authentication → Providers → Google) with a Client ID/Secret from Google Cloud.
2. Set the Google Cloud OAuth consent screen to **Internal** under the `doctorgenius.com` Workspace org.
3. Apply the updated `supabase/schema.sql` RLS policy to the live database via the SQL Editor (it isn't run automatically).
4. Add `http://localhost:3000` (and the production URL) to Supabase's allowed redirect URLs.

## Verified so far

- Local dev server renders the login gate correctly for an unauthenticated visitor (Google-only button, no password/captcha UI, domain messaging).
- Clicking "Sign in with Google" correctly redirects to Supabase's `/auth/v1/authorize` endpoint with the right `provider`, `redirect_to`, and `hd` query params.
- No console/build errors from the new code.

## Not yet verified (blocked on dashboard setup)

- End-to-end sign-in with a real `@doctorgenius.com` account.
- Rejection of a non-corporate Google account (both at the Google consent screen and via the app-side domain check/force sign-out).
- RLS enforcement after the new policy is applied to the live database (corporate user can still CRUD `project_configs`; anonymous/incognito session gets zero rows).
- Sign-out control clearing the session and returning to the login screen.

These map to the "Verification" section of the original plan and should be run through once the Supabase/Google dashboard setup below is complete.
