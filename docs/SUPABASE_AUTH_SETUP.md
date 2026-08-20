# Supabase Auth Setup — Step by Step

This is a one-time, manual dashboard walkthrough to turn on Google sign-in for Neural Bridge, restricted to the `doctorgenius.com` Google Workspace domain. None of this is code — it's configuration in the Supabase dashboard and Google Cloud Console. See [AUTHENTICATION_CHANGES.md](./AUTHENTICATION_CHANGES.md) for what changed in the app itself.

Do these in order — later steps depend on values created in earlier ones.

## 1. Confirm your Supabase project URL

The app reads `REACT_APP_SUPABASE_URL` from `.env.local`. Before anything else, confirm that value actually points at a live project:

1. Go to [app.supabase.com](https://app.supabase.com) and open the project for Neural Bridge.
2. **Settings → General → Project ID** (or **Settings → API → Project URL**) — copy the `https://<ref>.supabase.co` value.
3. Make sure `.env.local` has that exact URL in `REACT_APP_SUPABASE_URL`.

> If the browser shows "This site can't be reached" when you try to sign in, this is almost always the cause — a stale/wrong project ref in `.env.local` that no longer resolves. Fix the URL and restart `npm start` before continuing.

## 2. Disable the Email/password provider

The app has no password-login UI and never will — Google is the only way in.

1. Supabase dashboard → **Authentication → Providers → Email**.
2. Turn off **"Allow new users to sign up"** (or disable the Email provider entirely).

This blocks the password signup path at the API level, not just in the UI.

## 3. Create the Google Cloud OAuth client

1. Go to [Google Cloud Console](https://console.cloud.google.com) and select (or create) the GCP project you want to use for this app.
2. **APIs & Services → OAuth consent screen**:
   - Set **User Type** to **Internal**.
   - This option is only available if the GCP project belongs to the `doctorgenius.com` Google Workspace organization. If "Internal" isn't selectable, the project is under a personal/non-Workspace account — confirm with whoever manages the Workspace org before proceeding, since without Internal mode, domain enforcement falls back entirely to the app-side check (still active, but not as strong as Google refusing the consent screen outright).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: add `http://localhost:3000` and your production deployment URL.
   - **Authorized redirect URIs**: add `https://<project-ref>.supabase.co/auth/v1/callback` (use the same project ref from step 1).
   - Save, then copy the generated **Client ID** and **Client Secret** — you'll need them in the next step.

## 4. Enable the Google provider in Supabase

1. Supabase dashboard → **Authentication → Providers → Google**.
2. Toggle the provider **on**.
3. Paste in the **Client ID** and **Client Secret** from step 3.
4. Save.
5. Separately, confirm Supabase's global **"Allow new user signups"** setting (Authentication → Settings, or the top-level signups toggle) is **on** — this needs to stay on so a first-time Google sign-in can auto-create an `auth.users` row. It's the Email provider's own signup toggle (step 2) that blocks the password path specifically, not this global one.

> If you skip this step, clicking "Sign in with Google" will redirect to a Supabase URL that returns a JSON error instead of the Google account chooser:
> ```json
> {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
> ```
> That's the exact signal that this step hasn't been done yet (or the toggle didn't save).

## 5. Set Site URL and redirect URLs

1. Supabase dashboard → **Authentication → URL Configuration**.
2. **Site URL**: set to your production deployment URL.
3. **Redirect URLs**: add `http://localhost:3000`. Add your production URL here too if it isn't covered by the Site URL already.

Without this, `signInWithOAuth` will fail (or redirect somewhere unexpected) when testing locally.

## 6. Apply the RLS policy update

The repo's `supabase/schema.sql` was updated on this branch to scope `project_configs` access to `@doctorgenius.com` accounts, but that file only takes effect once you run it — Supabase doesn't watch the repo.

1. Supabase dashboard → **SQL Editor → New Query**.
2. Paste the full contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Run it. It's idempotent — the `drop policy if exists` / `create policy` pattern means re-running it is safe.

## 7. Verify end-to-end

With all of the above done:

1. `npm start`, open `http://localhost:3000`.
2. Click **Sign in with Google**. You should land on an actual Google account chooser (pre-filtered toward `doctorgenius.com` accounts via the `hd` hint), not an error page.
3. Sign in with a `@doctorgenius.com` account — you should land back in the app, signed in, with your email visible in the header next to a "Sign out" button.
4. If you have a non-corporate Google account handy, try signing in with it — it should either be rejected by Google directly (if Internal mode is active) or bounce you back to the login screen with an "Only doctorgenius.com accounts can access this app" message (the app-side fallback).
5. In the **Project Config** tab, confirm you can still create/edit/delete a config while signed in.
6. Open an incognito window (no session) and confirm you get no data / a permission error if you try to hit `project_configs` directly (e.g. via the Supabase client in devtools) — this confirms RLS is actually enforcing the new policy rather than being a no-op.

## Troubleshooting quick reference

| Symptom | Likely cause |
|---|---|
| "This site can't be reached" when clicking Sign in with Google | `REACT_APP_SUPABASE_URL` in `.env.local` is stale or wrong — see step 1 |
| `{"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}` | Google provider not enabled in Supabase, or Client ID/Secret not saved — see step 4 |
| Redirected to Google, but any Google account (not just `doctorgenius.com`) can sign in | OAuth consent screen is set to **External**, not **Internal** — see step 3. The app-side domain check should still force-sign-out and reject non-corporate accounts, but Internal mode is the stronger enforcement layer |
| Signed in successfully but Project Config tab shows no data / errors on save | RLS policy in `supabase/schema.sql` hasn't been applied yet — see step 6 |
| `signInWithOAuth` fails immediately, no redirect at all | Redirect URL not allow-listed in Supabase — see step 5 |
