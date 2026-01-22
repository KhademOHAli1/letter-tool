> **We know that trusting digital tools is hard for Iranians. This page explains transparently what happens with your data.**

---

## 🔒 Summary: What really happens?

| Data | Stored? | Where? | How long? |
|------|---------|--------|-----------|
| **Your name** | ❌ No | - | - |
| **Your story** | ❌ No | - | - |
| **The letter text** | ❌ No | Only in your browser | Until you delete it |
| **Your IP address** | ⚠️ Hashed only | Server memory | Max. 1 hour |

---

## We understand your concerns

As Iranians, we know that trusting digital tools is difficult. Many of us have friends or family who got into danger because of a post, a signature, or a photo.

**That's why we created this page:** Full transparency about what happens with your data - and what doesn't.

## How do we find your representative?

You enter your **postal code**, and we determine your electoral district and the responsible MP (MdB).

| Step | What happens | Stored? |
|------|--------------|---------|
| You enter your postal code | We search for the matching district | ❌ No |
| District is found | MP's name is displayed | ✅ Only the district name |
| Letter is generated | MP's name appears in the letter | ✅ MP name for statistics |

**Your postal code is not stored** - only the district name (e.g., "Berlin-Mitte") for our statistics.

## What happens with my name?

| Step | What happens | Where |
|------|--------------|-------|
| You write your name | Sent to OpenAI to create the letter | Your browser → OpenAI (USA) |
| The letter is generated | Your name appears in the letter | OpenAI → Your browser |
| You copy/send the letter | The name is only in your browser | Your computer |

**We don't store your name.** It only exists:
1. Briefly at OpenAI (max. 30 days, only for abuse detection)
2. In your own browser until you delete it

## What happens with my personal story?

Your story - the heart of the letter - is **never stored by us**.

- ❌ No database of your stories
- ❌ No logs of your personal experiences
- ❌ No way for us to read your stories

The only place your story exists:
1. Briefly at OpenAI during generation
2. In your browser after the letter is created

## What do we actually store?

Only **anonymous statistics** to measure campaign impact:

| What we store | Example | Why |
|---------------|---------|-----|
| MP's name | "Dr. Anna Müller" | To know which representatives were contacted |
| Party | "SPD" | Aggregated statistics by party |
| District name | "Berlin-Mitte" | Geographic distribution |
| Selected demands | "IRGC listing, Sanctions" | Which topics matter most |
| Anonymous fingerprint | "a7f3b2..." | To avoid counting duplicates |

**What we do NOT store:**
- ❌ Your name
- ❌ Your story
- ❌ The letter text
- ❌ Your email address
- ❌ Your postal code

## Why do we even need a name?

The letter needs to be signed with a name so the MP knows a real person from their district is writing. Anonymous letters are often ignored.

**But:** You can use any name you want. We don't verify it.

## What about OpenAI?

Yes, your data briefly passes through OpenAI servers in the USA. This is the biggest vulnerability, and we're honest about it:

**Risks:**
- OpenAI stores API requests for up to 30 days
- Servers are in the USA
- Theoretically, the US government could request access

**Why we still use it:**
- There's no good European alternative for this quality
- OpenAI doesn't use the data for training (API terms of service)
- The 30-day storage is only for abuse detection

**What you can do:**
- Don't use your full real name
- Don't use details that uniquely identify you
- Edit the letter before sending

## Why no login?

We deliberately have **no user account system**:

- ❌ No email registration
- ❌ No password
- ❌ No database of user identities

The less we know about you, the less can ever be compromised.

## What if the website gets hacked?

Even with a complete hack of our systems, an attacker could only find:
- Which MPs were contacted
- Which demands were selected
- Anonymous fingerprints (not traceable)

**An attacker could NOT find:**
- User names
- Personal stories
- Letter texts
- Email addresses

## Local storage - What stays in your browser?

Everything stored in the browser stays there:

| What | Where | How to delete |
|------|-------|---------------|
| Generated letters | LocalStorage | Clear browser data |
| Form drafts | LocalStorage | Automatically after 24h or click "Discard" |
| Theme/Language | Cookie & LocalStorage | Clear browser data |

This data never leaves your computer.

## 🔓 100% Open Source - Verify Us

Words are cheap. That's why this entire service is **fully open source**:

| What | Link |
|------|------|
| **Complete source code** | [github.com/KhademOHAli1/letter-tool](https://github.com/KhademOHAli1/letter-tool) |
| **This page** | The code for this transparency page is also public |
| **Server code** | No hidden backend secrets |
| **Database schema** | Publicly viewable in `/supabase/migrations/` |

**Why this matters:**
- Any developer can verify what we actually do with your data
- No hidden trackers, no secret data collection
- If we were lying, anyone could see it

> **To developers:** Look at the code. Make a pull request if you find anything suspicious. We have nothing to hide.

## 🛡️ Our Promises

| Promise | Status |
|---------|--------|
| No storage of names | ✅ Guaranteed |
| No storage of stories | ✅ Guaranteed |
| No sharing with third parties | ✅ Guaranteed |
| No advertising | ✅ Guaranteed |
| No tracking cookies | ✅ Guaranteed |
| Open source code | ✅ Public on GitHub |
| EU servers for statistics | ✅ Frankfurt, Germany |
| No registration required | ✅ No account system |

## More questions?

If you have further concerns, write to us: [hi@khademohali.me](mailto:hi@khademohali.me)

We respond in German, English, and Farsi.

---

**می‌دانیم که اعتماد کردن سخت است. به همین دلیل همه چیز شفاف است.**

*We know that trust is hard. That's why everything is transparent.*
