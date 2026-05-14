# AI Writing Assistant — Chrome Extension

A production-ready AI grammar and writing assistant that works across **Slack, Gmail, LinkedIn, Notion**, and any browser-based text input. Powered by Claude (Anthropic), backed by Supabase, built with Plasmo + React + TypeScript.

---

## Features

| Feature | Description |
|---|---|
| **Floating trigger** | Highlight any text — an AI Rewrite button appears instantly |
| **12 rewrite modes** | Fix Grammar, Professional, Friendly, Concise, Executive, Recruiter, Follow-Up, Persuasive, Expand, Shorten, More Human, Custom |
| **Streaming responses** | Real-time token streaming from Claude |
| **One-click insert** | Rewritten text replaces the original in-place |
| **Keyboard shortcut** | `⌘⇧G` (Mac) / `Ctrl+Shift+G` (Windows) |
| **Platform detection** | Auto-detects Slack, Gmail, LinkedIn, Notion |
| **Rewrite history** | Session and cloud history with one-click reuse |
| **Custom prompts** | Write your own rewrite instruction |
| **User preferences** | Tone, style, industry, conciseness, dark/light mode |
| **Supabase auth** | Google OAuth — sync history across devices |
| **Secure API** | Claude API key lives only in Supabase edge functions |

---

## Architecture

```
extension/                  # Chrome extension (Plasmo + React + TS)
  src/
    contents/               # Content scripts (injected into every page)
      text-selection.tsx    # Main content script — floating UI
    components/             # React UI components
      AssistantModal.tsx    # Main rewrite modal
      FloatingTrigger.tsx   # Floating "AI Rewrite" button
      ActionGrid.tsx        # 12-action selector grid
      StreamingText.tsx     # Streaming response display
      CustomPromptInput.tsx # Custom prompt textarea
      RewriteHistory.tsx    # History panel
      ui/                   # Primitives: Button, Badge, Spinner
    hooks/
      useTextSelection.ts   # Selection detection
      useRewrite.ts         # AI rewrite + streaming logic
      useKeyboardShortcut.ts # ⌘⇧G handler
      useTheme.ts           # Dark/light mode
    store/
      assistant.ts          # Zustand — modal + rewrite state
      settings.ts           # Zustand — persisted user preferences
    lib/
      supabase.ts           # Supabase client
      api.ts                # Edge function calls + DB helpers
    types/index.ts          # All shared TypeScript types
    utils/
      cn.ts                 # clsx + tailwind-merge helper
      platform.ts           # Platform detection + text injection
      prompts.ts            # System prompt + action prompt templates
    styles/global.css       # Tailwind CSS (shadow DOM)
    popup.tsx               # Extension popup
    options.tsx             # Settings page
    background.ts           # Service worker

supabase/
  migrations/
    001_initial_schema.sql  # Full DB schema with RLS
  functions/
    rewrite/
      index.ts              # Edge function — calls Claude API, streams SSE
```

---

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A [Supabase](https://supabase.com) account
- An [Anthropic](https://console.anthropic.com) API key
- Chrome 88+

---

## Local Development

### 1. Clone & install

```bash
git clone https://github.com/lufadulm/basewebapp.git
cd basewebapp/extension
pnpm install   # or npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PLASMO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start dev server

```bash
pnpm dev
```

Plasmo watches for changes and hot-reloads the extension.

### 4. Load in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `extension/build/chrome-mv3-dev`

### 5. Test it

- Navigate to Gmail, Slack, LinkedIn, or any website
- Highlight text → click **✨ AI Rewrite**
- Or press `⌘⇧G` / `Ctrl+Shift+G`

---

## Supabase Setup

### 1. Create a project

Go to [supabase.com](https://supabase.com), create a new project.

### 2. Run migrations

```bash
cd supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or paste `migrations/001_initial_schema.sql` into the Supabase SQL editor.

### 3. Enable Google OAuth (optional, for history sync)

In Supabase dashboard → **Authentication → Providers → Google**:
- Add your Chrome extension as a redirect URL:
  `https://<extension-id>.chromiumapp.org/`

### 4. Deploy the edge function

```bash
# From repo root
supabase functions deploy rewrite --project-ref YOUR_PROJECT_REF
```

Set the secret in Supabase:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Get your project URL and anon key

In the Supabase dashboard → **Project Settings → API**. Add them to your `.env`.

---

## Production Build

```bash
cd extension
pnpm build
```

Output: `extension/build/chrome-mv3-prod/`

### Package for Chrome Web Store

```bash
pnpm package
```

Output: `extension/build/chrome-mv3-prod.zip`

---

## Chrome Web Store Deployment

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the $5 one-time developer fee
3. Click **Add new item** → upload `chrome-mv3-prod.zip`
4. Fill in:
   - Name: "AI Writing Assistant"
   - Description: Copy from this README
   - Screenshots (1280×800 or 640×400)
   - Promo tile (440×280)
5. Submit for review (~1–3 business days)

---

## Environment Variables

| Variable | Description |
|---|---|
| `PLASMO_PUBLIC_SUPABASE_URL` | Your Supabase project URL (public) |
| `PLASMO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public, safe for browser) |
| `ANTHROPIC_API_KEY` | Anthropic API key — **Supabase edge function secret only, never in frontend** |

---

## Supported Platforms

| Platform | Detection | Text Injection |
|---|---|---|
| Gmail | `mail.google.com` | contenteditable |
| Slack | `app.slack.com` | contenteditable |
| LinkedIn | `linkedin.com` | textarea + contenteditable |
| Notion | `notion.so` | contenteditable |
| Any site | fallback | textarea + contenteditable |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘⇧G` / `Ctrl+Shift+G` | Open assistant (uses selected text if any) |
| `Esc` | Close assistant |
| `⌘↵` / `Ctrl+Enter` | Submit custom prompt |

---

## Database Schema

```sql
rewrites          -- Every rewrite: original, rewritten, action, platform
user_preferences  -- Per-user: tone, style, industry, theme, conciseness
prompt_templates  -- Saved custom prompts per user
usage_tracking    -- Aggregatable usage events
```

All tables use Supabase Row Level Security (RLS) — users can only access their own data.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Extension framework | [Plasmo](https://plasmo.com) 0.89 |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS 3 (shadow DOM) |
| State | Zustand 4 |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| AI | Anthropic Claude API (streaming) |
| Icons | Lucide React |
| Build | Vite (via Plasmo) |

---

## Security

- **API keys are never in the frontend.** The Anthropic key lives exclusively as a Supabase edge function secret.
- All DB access uses Supabase RLS — users can only read/write their own rows.
- Content Security Policy is configured in the extension manifest.
- The edge function validates the request body and optionally verifies the Supabase JWT.

---

## Contributing

PRs welcome. Run `pnpm type-check` before submitting.
