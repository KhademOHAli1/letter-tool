# Security Documentation

## Overview

This application implements multiple layers of security to protect against various attack vectors. Given the politically sensitive nature of the content (advocacy campaigns), the application is hardened against abuse from multiple threat actors.

## Security Layers

### 1. Authentication & Authorization (`src/lib/auth/`)
- **Supabase Auth**: Session-based authentication with email/password and Google OAuth
- **Role hierarchy**: user < organizer < admin < super_admin
- **Row Level Security (RLS)**: Database-enforced access control via Postgres policies
- **Permission system**: Granular permissions mapped to roles (`src/lib/auth/permissions.ts`)
- **Protected routes**: Server-side checks on admin/superadmin routes

### 2. Rate Limiting (`src/lib/rate-limit.ts`)
- **IP-based limiting**: 10 requests per minute per IP address
- **In-memory tracking**: Efficient sliding window implementation
- **Automatic cleanup**: Prevents memory leaks from expired entries
- **Configurable via env vars**: `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_SECONDS`

### 3. Input Sanitization (`src/lib/sanitize.ts`)
- **XSS prevention**: HTML tags stripped from all inputs
- **Control character removal**: Prevents null bytes and escape sequences
- **Length limits**: 
  - Name: max 100 characters
  - PLZ: exactly 5 digits
  - Personal note: max 2000 characters
  - Forderungen: max 10 selections
- **Prompt injection detection**: Blocks known attack patterns

### 4. Advanced Security (`src/lib/security.ts`)
- **Origin validation**: CSRF protection via Origin/Referer headers
- **Bot detection**: Blocks known automation tools (curl, wget, headless browsers)
- **Request fingerprinting**: Identifies repeat abuse patterns
- **Abuse pattern detection**: Catches HTML injection, excessive inputs, spam
- **Content similarity**: Prevents duplicate request abuse (max 3 identical/hour)

### 5. CAPTCHA Protection (`src/components/turnstile.tsx`)
- **Cloudflare Turnstile**: Privacy-friendly CAPTCHA on public forms
- **Server-side verification**: Token verified before processing submissions
- **Graceful degradation**: Works without token in development mode

### 6. Client-Side Bot Detection (`src/components/letter-form.tsx`)
- **Honeypot field**: Hidden input that bots auto-fill
- **Timing validation**: Form must be open for at least 3 seconds
- **Server-side timing check**: Rejects submissions under 2 seconds

### 7. HTTP Security Headers (`vercel.json` + `next.config.ts`)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: (see below)
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 8. Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline';
img-src 'self' https://www.bundestag.de https://www.ourcommons.ca https://members-api.parliament.uk https://bioguide.congress.gov data: blob:;
font-src 'self';
connect-src 'self' https://api.openai.com https://api.postcodes.io https://*.supabase.co https://challenges.cloudflare.com;
frame-src 'self' https://challenges.cloudflare.com;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
upgrade-insecure-requests;
```

Note: `unsafe-eval` is only allowed in development mode for Next.js hot reload.

## Blocked Attack Vectors

| Attack | Protection |
|--------|------------|
| CSRF (Cross-Site Request Forgery) | Origin validation |
| XSS (Cross-Site Scripting) | Input sanitization, CSP |
| SQL Injection | Supabase parameterized queries, RLS policies |
| Prompt Injection | Pattern detection, input sanitization |
| DDoS/Rate Abuse | IP rate limiting |
| Bot Automation | Turnstile CAPTCHA, user-agent detection, honeypot, timing |
| Unauthorized Access | Supabase Auth, role-based permissions, RLS |
| Clickjacking | X-Frame-Options: DENY |
| Content Sniffing | X-Content-Type-Options: nosniff |
| API Key Exposure | Server-only environment variables |

## Prompt Injection Protection

The following patterns are blocked in user input:
- System message overrides (`ignore previous`, `new instructions`)
- Role switching (`as an AI`, `you are now`)
- Output manipulation (`<output>`, `</output>`)
- Command injections (`execute:`, `run:`)

## Logging & Monitoring

All security events are logged with `[SECURITY]` prefix:
```typescript
console.warn(`[SECURITY] Bot detected from IP: ${clientIP}, reason: ${reason}`);
console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
console.warn(`[SECURITY] Suspicious content detected from IP: ${clientIP}`);
```

Monitor Vercel logs for these patterns to detect attack attempts.

## Environment Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `OPENAI_API_KEY` | Server-only | LLM API authentication |
| `LLM_MODEL` | Server-only | Model selection (default: gpt-5.2) |
| `SUPABASE_URL` | Server-only | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Supabase admin access |
| `TURNSTILE_SECRET_KEY` | Server-only | Cloudflare Turnstile verification |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase client URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Cloudflare Turnstile widget |
| `NEXT_PUBLIC_APP_URL` | Public | Origin validation |

## Database Security (Supabase)

- **Row Level Security (RLS)**: All tables protected with policies
- **Service role isolation**: Server-side only, never exposed to client
- **Anon key limitations**: Public key can only read public data
- **Auth triggers**: User profiles created automatically on signup

## Vercel Deployment Security

- **Region**: `fra1` (Frankfurt) - GDPR-compliant EU region
- **No serverless function logs exposed**: Errors return generic messages
- **API routes cache disabled**: `Cache-Control: no-store`

## Scaling Security

When scaling beyond 5K users/day, consider:
- [x] Cloudflare Turnstile for CAPTCHA protection
- [ ] Upstash Redis for distributed rate limiting
- [ ] Sentry for error tracking and alerting
- [ ] Webhook alerts for attack patterns

## Reporting Vulnerabilities

If you discover a security vulnerability, please email [REDACTED] immediately. Do not open a public GitHub issue.
