# Neural Bridge

A React-based application that converts design discussions into structured development requirements using simple keyword matching. Project configurations are persisted to a Supabase (PostgreSQL) database.

## What It Does

**Input:** Natural conversation about web components and features
```
"I need a responsive header with login and search functionality"
```

**Output:** Structured requirements categorized by type and priority
```json
{
  "functional": ["Implement login functionality", "Implement search functionality"],
  "ui-ux": ["Design and implement header component"],
  "technical": ["Implement responsive design pattern"],
  "techStack": ["React", "Tailwind CSS", "CSS"]
}
```

## Features

- **Chat Interface** - Discuss design ideas naturally
- **Keyword Analysis** - Detects components, functionality, and design patterns
- **Project Templates** - Create reusable configurations with custom rules
- **Structured Output** - Requirements organized by category and priority
- **Export/Import** - Save and share project configurations as JSON
- **Supabase Database** - Project configs persist across browsers and devices

---

## Developer Setup

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://app.supabase.com) account (free tier is sufficient)

---

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd neural-bridge
npm install
```

---

### 2. Create a Supabase project

1. Go to [app.supabase.com](https://app.supabase.com) and sign in
2. Click **New Project**, give it a name (e.g. `neural-bridge`), choose a region, set a database password
3. Wait for the project to finish provisioning (~1 minute)

---

### 3. Run the database schema

1. In your Supabase project, go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it in
4. Click **Run**

This creates the `project_configs` table, sets up Row Level Security, and adds an `updated_at` auto-update trigger.

> You only need to run this once. The SQL is idempotent — running it again will not cause errors.

---

### 4. Get your Supabase credentials

1. In your Supabase project go to **Settings**
2. Copy the following:
   - **Project URL** — found in **Settings → General → Project ID**, formatted as `https://<ref>.supabase.co`
   - **Publishable key** — found in **Settings → API Keys → Publishable key** the `sb_publishable_...` key (safe for frontend use — do not use the Secret key)

---

### 5. Configure environment variables

Create `.env.local` and fill in your credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_your-key-here
```

> `.env.local` is gitignored and will never be committed. Never commit real credentials.

---

### 6. Authentication Setup

Neural Bridge gates access behind Google sign-in, restricted to the corporate `doctorgenius.com` Google Workspace domain. Set this up once against your Supabase project:

1. **Leave/confirm Email signups disabled** — Supabase dashboard → **Authentication → Providers → Email** → turn off "Allow new users to sign up" (or disable the Email provider entirely). The app has no password-login UI, so the only way in is Google OAuth.
2. **Create the Google Cloud OAuth client as an Internal app**, under the `doctorgenius.com` Workspace org:
   - Google Cloud Console → **APIs & Services → OAuth consent screen** → set **User Type** to **Internal**. This is only selectable if the GCP project belongs to the `doctorgenius.com` Workspace organization — if it doesn't, "Internal" won't be available and enforcement falls back entirely to the app-side domain check (still active — see below).
   - Google Cloud Console → **Credentials** → create an **OAuth 2.0 Web client**:
     - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
     - Authorized JS origins: `http://localhost:3000` + your production deployment URL
   - Paste the Client ID/Secret into Supabase → **Authentication → Providers → Google**, with new-user sign-in allowed.
   - Confirm Supabase's global "Allow new user signups" setting stays **on** so Google sign-ins can auto-create `auth.users` rows — the Email provider's own signup toggle (step 1) is what blocks the password path specifically.
3. **Set Site URL / Redirect URLs** — Supabase → **Authentication → URL Configuration** → Site URL = your production URL; add `http://localhost:3000` to allowed redirect URLs, otherwise `signInWithOAuth` fails locally.
4. **App-side domain check** — `REACT_APP_ALLOWED_EMAIL_DOMAIN` (default `doctorgenius.com`) is checked on every sign-in as defense-in-depth: if a session comes back for a non-matching domain (e.g. because the OAuth client is "External" rather than "Internal"), the app immediately signs the session out and shows an "unauthorized domain" message. The login screen also passes `hd=doctorgenius.com` as a UX hint to pre-filter the Google account chooser, but that's not a security boundary on its own — the Internal consent screen (step 2) and this app-side check are the real enforcement.

**Security note:** access is scoped to the whole `doctorgenius.com` domain, not one specific person — any employee with a corporate Google account gets full read/write access to `project_configs`. That's a deliberate, reasonable blast radius for an internal tool.

---

### 7. Start the app

```bash
npm start
```

Open [localhost:3000](http://localhost:3000). The status indicator in the header turns **green** when the database connection is successful.

---

## Verifying the connection

1. Go to the **Project Config** tab
2. Click **New Project** and save a configuration
3. In your Supabase dashboard go to **Table Editor → project_configs**
4. Refresh — the new row should appear with all fields populated

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL (`https://<ref>.supabase.co`) |
| `REACT_APP_SUPABASE_ANON_KEY` | Publishable (anon) API key — safe for browser use |
| `REACT_APP_ALLOWED_EMAIL_DOMAIN` | Google Workspace domain allowed to sign in (default `doctorgenius.com`) |

---

## File Structure

```
neural-bridge/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthGate.jsx                  # Shows LoginScreen or the app based on auth state
│   │   │   └── LoginScreen.jsx                # Google-only sign-in screen
│   │   ├── web-design-requirements-app.jsx   # Root component, Supabase state management
│   │   ├── design-requirements-chatbot.jsx   # Chat interface and keyword analysis
│   │   └── project-config-manager.jsx        # Project template CRUD
│   ├── contexts/
│   │   └── AuthContext.jsx                   # AuthProvider + useAuth() session state
│   ├── lib/
│   │   ├── supabase.js                       # Supabase client initialization
│   │   ├── authConfig.js                     # isCorporateAccount() domain check
│   │   └── projectConfigService.js           # DB operations (fetch, upsert, delete)
│   └── ...
├── supabase/
│   └── schema.sql                            # Database schema — run once in Supabase
├── .env.example                              # Environment variable template
└── .env.local                               # Your local credentials (gitignored)
```

---

## How the Database Layer Works

All project configurations are stored in the `project_configs` table. Row Level Security restricts access to signed-in users whose email ends in `@doctorgenius.com` (see [Authentication Setup](#6-authentication-setup)) — it's gated by corporate domain, not a specific identity, so any employee with a `doctorgenius.com` Google account has full read/write access.

### Table schema

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Auto-generated primary key |
| `name` | text | Project name (unique) |
| `rules` | text[] | List of project rules |
| `blockers` | text[] | List of blockers/constraints |
| `notes` | text | Free-form notes |
| `tech_stack` | text[] | Technologies used |
| `custom_prompts` | jsonb | Custom prompt overrides per category |
| `created_at` | timestamptz | Auto-set on insert |
| `updated_at` | timestamptz | Auto-updated on every change |

### Service layer (`src/lib/projectConfigService.js`)

| Function | Description |
|---|---|
| `fetchAllConfigs()` | Loads all rows on app mount |
| `upsertConfig(name, config)` | Inserts or updates a config by name |
| `deleteConfig(name)` | Deletes a config by name |

---

## How It Works — Keyword Detection

The app uses **basic string matching** (no AI or NLP) to identify components and features:

```javascript
const componentKeywords = ['header', 'footer', 'navbar', 'modal', 'form'];
const funcKeywords     = ['login', 'search', 'filter', 'upload', 'payment'];
const designKeywords   = ['responsive', 'mobile', 'dark mode', 'animation'];
```

**Limitations:**
- Only catches exact keyword matches
- No synonyms (`"nav bar"` won't match if only `"navbar"` is defined)
- No context understanding or complex sentence parsing

---

**Simple, effective requirement generation through structured conversations.**
