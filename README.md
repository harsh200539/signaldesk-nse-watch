# SignalDesk for Vercel

An independent family dashboard for selected NSE companies. The Next.js UI uses Supabase email magic links and row level security. A scheduled Supabase Edge Function ingests NSE's official corporate RSS feeds, labels source evidence for Groq analysis, and sends material positive/negative findings through Telegram and email when configured.

## Current deployment state

- Supabase tables and owner `hpatil1704@gmail.com` exist in project `pnbqofhyczvpjxpstrin`.
- `sd-monitor` Edge Function is deployed, but the one-minute job is **paused**. NSE RSS fetches failed from Supabase's edge network (HTTP/2 stream error; HTTP/1 timeout). Do not enable alerts until a feed fetch from the final runtime succeeds.
- The Vercel CLI in this workspace is not authenticated, and the connected Vercel deploy action is unavailable. This code is build verified locally but **not deployed** to a public Vercel URL.
- Groq, Telegram, and Resend keys have not been supplied. Document analysis and outbound alerts are inactive.

## Deploy and configure

1. Sign into Vercel and deploy this directory as a Next.js project. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `.env.example` in Vercel project settings. Do not place backend secrets in `NEXT_PUBLIC_` variables.
2. Add the final Vercel URL to the Supabase Auth redirect URL allowlist for project `pnbqofhyczvpjxpstrin`. Email sign-in links must redirect to that URL.
3. Add `GROQ_API_KEY`, `TELEGRAM_BOT_TOKEN`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` to the Supabase `sd-monitor` Edge Function secrets. Verify the Resend sender domain and start the Telegram bot before enabling outbound delivery.
4. Set `SD_FEED_PROXY_TOKEN` in Vercel to the existing private cron token stored in Supabase Vault/config. Set `public.sd_config` key `feed_proxy_base` to the final Vercel origin. The worker first requests NSE directly, then retries through Vercel's fixed allowlist proxy. Test all four feeds through this path, add a company, verify a matched filing, verify PDF/XML evidence extraction, and test one email and one Telegram delivery. Only then reschedule `sd-monitor-every-minute` in Supabase Cron using the existing Vault settings.
5. Invite your father by email from the dashboard. He signs in with his own magic link; no ChatGPT login is involved.

The source feed is a polling feed. It does not provide licensed exchange tick prices or guaranteed instant publication. Each filing displays its original NSE link, published timestamp, evidence scope, and feed health. Groq's notes are research summaries, not personalized investment recommendations.

## Local verification

```bash
npm ci
cp .env.example .env.local
# Fill in the publishable Supabase key.
npm run build
npm run dev
```

SQL schema: `supabase/schema.sql`; worker: `supabase/functions/sd-monitor/index.ts`.
