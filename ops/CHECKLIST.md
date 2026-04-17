# Ringbridge — Operator Checklist

**You do this list. I take over the moment it's done.**

Goal: get me everything I need to run an AI voice receptionist business for Colorado HVAC shops. When you finish this list, I can build, deploy, prospect, sell, and operate autonomously. Until then, I'm blocked on credentials only you can create.

---

## TL;DR — what you're signing up for

| | |
|---|---|
| Hands-on time | ~90 min at the keyboard, spread over 1–3 days (some steps require approval waits) |
| Upfront cash | ~$75 (domain $12 + Colorado LLC $50 + Anthropic API deposit $10) |
| Recurring | ~$25–30/mo until you have 3+ clients; free tiers cover most services |
| Total against your $500 budget | You'll have ~$410 in reserve after Phase 1–2 |
| Wait time you can't shortcut | LLC approval (1–3 business days), EIN (same day), Mercury bank (2–5 days, optional) |

---

## How to hand off credentials to me

1. On your Mac mini, clone the repo and `cd` into it.
2. Copy the template: `cp ops/.env.example ops/.env`
3. Fill `ops/.env` as you work through this list. Every step below tells you which variable to paste into.
4. `ops/.env` is gitignored — it will **not** be pushed. That's intentional.
5. When you're done (or done-enough, with green checkmarks on every **[REQUIRED]** item below), start a new Claude Code session in this repo and say **"creds ready, take off."**

I'll read `ops/.env`, verify every service responds, build, deploy, and start prospecting.

---

## Phase 1 — Identity & legal (30 min hands-on, 1–3 day wait)

Do these in order — later steps depend on earlier ones.

### ☐ 1. Personal Gmail for operator comms `[REQUIRED]`
- **URL:** https://accounts.google.com/signup
- **Why:** This is the email every vendor emails you, every 2FA code hits, and where I'll send you daily digests.
- **Suggested handle:** `ringbridge.ops@gmail.com` (or whatever's available)
- **Paste into `ops/.env`:** `OPERATOR_EMAIL=`
- **Cost:** free

### ☐ 2. Domain `[REQUIRED]`
- **URL:** https://porkbun.com or https://www.cloudflare.com/products/registrar/
- **First choice:** `ringbridge.ai` (~$13/yr on Porkbun, ~$10/yr on Cloudflare)
- **Backups if taken:** `ringbridge.co`, `getringbridge.com`, `useringbridge.com`, `ringbridgehq.com`, `callringbridge.com`
- **Paste into `ops/.env`:** `RINGBRIDGE_DOMAIN=ringbridge.ai` (or whatever you bought)
- **Cost:** ~$10–15/yr
- **Notes:** Cloudflare Registrar sells at cost (no markup). Porkbun is slightly cheaper on `.ai`. Either is fine. Skip GoDaddy.

### ☐ 3. Colorado LLC filing `[REQUIRED]`
- **URL:** https://www.sos.state.co.us/biz/FileBusinessDocument.do (Articles of Organization for a Limited Liability Company)
- **Cost:** $50 exactly. Pay with your personal card.
- **Name to file:** Ringbridge LLC (if taken, try Ringbridge AI LLC, then Ringbridge Services LLC — check availability on the same site first at https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do)
- **Principal office address:** your home address is fine for a single-member LLC in Colorado.
- **Registered agent:** you can be your own — check "Individual" and enter your own name + address. Saves $100–200/yr vs. a service.
- **Management:** Member-managed. Single member (you).
- **Organizer:** you.
- **Paste into `ops/.env` once approved:**
  - `LLC_NAME=Ringbridge LLC`
  - `LLC_ID=` (the CO business ID they assign, e.g. 20261234567)
- **Wait:** usually approved same-day online, occasionally 1–3 business days. You'll get a PDF confirmation emailed.

### ☐ 4. EIN (federal tax ID) `[REQUIRED]`
- **URL:** https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
- **Do this AFTER the LLC is approved.** You'll need the CO business ID.
- **Cost:** free. Never pay a service for this.
- **Entity type:** Limited Liability Company → single-member → taxed as disregarded entity (default).
- **Paste into `ops/.env`:** `EIN=XX-XXXXXXX`
- **Time:** 10 min. You get the EIN on-screen immediately — save the PDF.

---

## Phase 2 — API & infra accounts (45 min, one sitting)

All free-tier or pay-as-you-go. Do these back-to-back while waiting on the LLC.

### ☐ 5. Anthropic API `[REQUIRED]`
- **URL:** https://console.anthropic.com/
- **Step:** Create account → Settings → Billing → add $10 credit. Then API Keys → Create key. Name it `ringbridge-prod`.
- **Paste into `ops/.env`:** `ANTHROPIC_API_KEY=sk-ant-...`
- **Cost:** $10 deposit, burns ~$0.003 per customer call. $10 lasts weeks.

### ☐ 6. Twilio `[REQUIRED]`
- **URL:** https://www.twilio.com/try-twilio
- **Step 1:** Create account, verify your phone, verify email.
- **Step 2:** Console → Phone Numbers → Buy a number → **Colorado local area code (303, 720, 719, or 970)** → pick one with Voice + SMS enabled (~$1.15/mo).
- **Step 3:** Console top-right → copy Account SID and Auth Token.
- **Paste into `ops/.env`:**
  - `TWILIO_ACCOUNT_SID=AC...`
  - `TWILIO_AUTH_TOKEN=...`
  - `TWILIO_PHONE_NUMBER=+1720XXXXXXX`
- **Cost:** $1.15/mo + ~$0.013/min. Add $20 trial balance when they ask.

### ☐ 7. LiveKit Cloud `[REQUIRED]`
- **URL:** https://cloud.livekit.io/
- **Step:** Sign up → create a project called `ringbridge` → Settings → Keys → create API key.
- **Paste into `ops/.env`:**
  - `LIVEKIT_URL=wss://ringbridge-xxxx.livekit.cloud`
  - `LIVEKIT_API_KEY=API...`
  - `LIVEKIT_API_SECRET=...`
- **Cost:** free tier covers ~5,000 participant-minutes/mo. We're under that until ~15 clients.

### ☐ 8. Deepgram (speech-to-text) `[REQUIRED]`
- **URL:** https://console.deepgram.com/signup
- **Step:** Sign up → you get $200 free credit. API Keys → create key.
- **Paste into `ops/.env`:** `DEEPGRAM_API_KEY=...`
- **Cost:** free $200 credit ≈ ~40,000 minutes of transcription.

### ☐ 9. Cartesia (text-to-speech) `[REQUIRED]`
- **URL:** https://play.cartesia.ai/
- **Step:** Sign up → API Keys → create key. Free tier includes monthly credits.
- **Paste into `ops/.env`:** `CARTESIA_API_KEY=sk_car_...`
- **Why Cartesia over ElevenLabs:** lower latency (sub-100ms), cheaper at scale, voice quality is indistinguishable for this use case.

### ☐ 10. Cal.com `[REQUIRED]`
- **URL:** https://cal.com/signup
- **Step:** Free account → Settings → Developer → API Keys → create.
- **Paste into `ops/.env`:** `CAL_COM_API_KEY=cal_...`
- **Why:** This is the booking backend. Each HVAC client will get their own Cal.com account later, but this one is for our demo + internal sales booking.

### ☐ 11. Neon Postgres `[REQUIRED]`
- **URL:** https://console.neon.tech/signup
- **Step:** Sign up → create project `ringbridge` → copy the connection string from the dashboard.
- **Paste into `ops/.env`:** `DATABASE_URL=postgresql://...neon.tech/...`
- **Cost:** free tier = 0.5 GB storage, plenty for 100+ clients.

### ☐ 12. Fly.io (for deploying the voice agent 24/7) `[REQUIRED]`
- **URL:** https://fly.io/app/sign-up
- **Step:** Sign up → add a card on file (required even for free tier) → Personal Access Tokens → create one called `ringbridge-deploy`.
- **Paste into `ops/.env`:** `FLY_API_TOKEN=fo1_...`
- **Cost:** ~$0–5/mo on free allowance until we scale.

### ☐ 13. Vercel (for the marketing site) `[REQUIRED]`
- **URL:** https://vercel.com/signup
- **Step:** Sign up with GitHub → Account Settings → Tokens → create one called `ringbridge-deploy`.
- **Paste into `ops/.env`:** `VERCEL_TOKEN=...`
- **Cost:** free.

### ☐ 14. GitHub — you already have it
- Confirm the remote origin is set and you can push to this repo. Nothing to paste.

### ☐ 15. Resend (transactional email) `[REQUIRED]`
- **URL:** https://resend.com/signup
- **Step:** Sign up → Domains → add `ringbridge.ai` → add the DNS records it gives you to your domain (Porkbun/Cloudflare → DNS → add TXT + MX records). Then API Keys → create.
- **Paste into `ops/.env`:** `RESEND_API_KEY=re_...`
- **Cost:** free tier = 3,000 emails/mo, 100/day. More than enough for month 1.
- **Why not Gmail SMTP:** deliverability + proper domain auth. We're sending cold outreach; doing it right matters.

---

## Phase 3 — Recommended but defer-able (20 min)

### ☐ 16. Google Workspace `[RECOMMENDED]`
- **URL:** https://workspace.google.com/
- **Why:** gives you `you@ringbridge.ai` — critical for looking legit to HVAC owners. Gmail-at-your-domain.
- **Cost:** $7.20/mo (Business Starter). First 14 days free.
- **Step:** sign up with your domain → verify via DNS TXT record → create `hello@ringbridge.ai` and `ops@ringbridge.ai`.
- **Paste into `ops/.env`:** `BUSINESS_EMAIL=hello@ringbridge.ai`

### ☐ 17. Privacy.com virtual card `[RECOMMENDED]`
- **URL:** https://privacy.com/signup
- **Why:** lets me spend on ad tests / tools with a hard $50 per-card cap. If anything goes wrong, the worst case is $50.
- **Step:** Sign up, link your personal bank, create a card named `Ringbridge Agent` with $50 spend cap.
- **Paste into `ops/.env`:** *(nothing — just note that Privacy card exists and is the card you'll enter for any agent-driven purchase later)*
- **Cost:** free.

### ☐ 18. Stripe `[RECOMMENDED]`
- **URL:** https://dashboard.stripe.com/register
- **Step:** Create account → activate with your LLC + EIN + personal ID. Developers → API keys → copy secret key.
- **Paste into `ops/.env`:** `STRIPE_SECRET_KEY=sk_live_...`
- **Why recommended:** we'll need this to charge clients $297/mo. But we can onboard the first 1–2 clients on Stripe Payment Links with zero integration work, so it's not strictly blocking.
- **Cost:** free, 2.9% + $0.30 per transaction.

---

## Phase 4 — Defer until after first paying client

Don't do these now. They eat time for little day-1 value.

- ☐ **Mercury business bank account** — do this once Stripe has revenue to deposit. Needs LLC + EIN + ID selfie; ~3 days to approve.
- ☐ **Apollo.io paid plan** — free trial (50 credits) is enough to validate. I'll scrape Google Maps as the primary lead source anyway.
- ☐ **Instantly.ai / Smartlead** — I'll send the first 200 cold emails through Resend. Upgrade only once volume >500/day.
- ☐ **Business insurance (Hiscox GL)** — $30/mo. Get it once you have 5+ clients.

---

## Final handoff

When every **`[REQUIRED]`** item above has a checkmark and a value in `ops/.env`:

1. `cd` to the repo on your Mac mini.
2. Run `git pull origin claude/ai-business-agent-oBHG2` to get any updates from me.
3. Confirm `ops/.env` is filled and saved.
4. Open Claude Code in this repo.
5. Say: **"creds ready, take off."**

I will then:
- Verify every API responds (1 min)
- Build the voice agent, outreach pipeline, and landing site (autonomous)
- Deploy voice agent to Fly.io, site to Vercel
- Start the first 50-lead cold-outreach batch to Colorado HVAC shops
- Report MRR daily

**One thing I can't do:** make you rich overnight. Realistic target is 3 clients by day 30, $891 MRR. Full P&L is in [`docs/BUSINESS.md`](../docs/BUSINESS.md) *(I'll write that when you unblock me).*

---

## Summary card (stick this on a monitor)

```
REQUIRED accounts (15):
[ ] Gmail personal
[ ] Domain (Porkbun/Cloudflare)
[ ] Colorado LLC (sos.state.co.us)
[ ] EIN (irs.gov)
[ ] Anthropic API
[ ] Twilio (CO number)
[ ] LiveKit Cloud
[ ] Deepgram
[ ] Cartesia
[ ] Cal.com
[ ] Neon Postgres
[ ] Fly.io (card on file)
[ ] Vercel
[ ] GitHub (existing)
[ ] Resend + domain DNS

RECOMMENDED (3):
[ ] Google Workspace ($7/mo)
[ ] Privacy.com virtual card ($50 cap)
[ ] Stripe

DEFER:
[ ] Mercury bank
[ ] Apollo.io
[ ] Instantly.ai
[ ] Business insurance

Upfront cash:  ~$75
Monthly:       ~$25
Reserve:       ~$410 of your $500 budget
```
