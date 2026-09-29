# SignalDesk for Vercel

An independent family dashboard for selected NSE companies. The Next.js UI uses Supabase email magic links and row level security. A scheduled Supabase Edge Function ingests NSE's official corporate RSS feeds, labels source evidence for Groq analysis, and sends material positive/negative findings through Telegram and email when configured.

## Current deployment state

- Supabase tables and owner `hpatil1704@gmail.com` exist in project `pnbqofhyczvpjxpstrin`.
- The website is deployed at `https://signaldesk-nse-watch.vercel.app/` from the private `harsh200539/signaldesk-nse-watch` GitHub repository.
- `sd-monitor` is scheduled every minute through Supabase Cron. NSE RSS fetches failed from Supabase's edge network, so the worker requests the four fixed feeds through the Vercel Node route. On the first end-to-end check, 3/4 feeds succeeded with 19 current items. The board meeting feed returned zero items. Monitor the dashboard health timestamp and status.
- Supabase Auth must allowlist `https://signaldesk-nse-watch.vercel.app/**` for email magic links. This setting requires Supabase dashboard access; sign-in has not yet been tested end to end.
- Groq, Telegram, and Resend keys have not been supplied. Document analysis and outbound alerts are inactive.

## Deploy and configure

1. The Vercel project already has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not place backend secrets in `NEXT_PUBLIC_` variables.
2. Add `https://signaldesk-nse-watch.vercel.app/**` to Supabase Auth redirect URLs for project `pnbqofhyczvpjxpstrin`. Email sign-in links must redirect to that URL.
3. Add `GROQ_API_KEY`, `TELEGRAM_BOT_TOKEN`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` to the Supabase `sd-monitor` Edge Function secrets. Verify the Resend sender domain and start the Telegram bot before enabling outbound delivery.
4. `public.sd_config` has `feed_proxy_base` set to the Vercel origin and the one-minute schedule is active. Add a company, verify a matched filing, verify PDF/XML evidence extraction, and test one email and one Telegram delivery before relying on alerts.
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
