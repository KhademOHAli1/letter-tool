# Security Documentation

## Overview

This application implements multiple layers of security to protect against various attack vectors. Given the politically sensitive nature of the content (Iran solidarity letters), the application is hardened against abuse from multiple threat actors.

## Security Layers

### 1. Rate Limiting (`src/lib/rate-limit.ts`)
- **IP-based limiting**: 10 requests per minute per IP address
- **In-memory tracking**: Efficient sliding window implementation
- **Automatic cleanup**: Prevents memory leaks from expired entries

### 2. Input Sanitization (`src/lib/sanitize.ts`)
- **XSS prevention**: HTML tags stripped from all inputs
- **Control character removal**: Prevents null bytes and escape sequences
- **Length limits**: 
  - Name: max 100 characters
  - PLZ: exactly 5 digits
  - Personal note: max 2000 characters
  - Forderungen: max 10 selections
- **Prompt injection detection**: Blocks known attack patterns

### 3. Advanced Security (`src/lib/security.ts`)
- **Origin validation**: CSRF protection via Origin/Referer headers
- **Bot detection**: Blocks known automation tools (curl, wget, headless browsers)
- **Request fingerprinting**: Identifies repeat abuse patterns
- **Abuse pattern detection**: Catches HTML injection, excessive inputs, spam
- **Content similarity**: Prevents duplicate request abuse (max 3 identical/hour)

### 4. Client-Side Bot Detection (`src/components/letter-form.tsx`)
- **Honeypot field**: Hidden input that bots auto-fill
- **Timing validation**: Form must be open for at least 3 seconds
- **Server-side timing check**: Rejects submissions under 2 seconds

### 5. HTTP Security Headers (`vercel.json` + `next.config.ts`)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: (see below)
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 6. Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' https://www.bundestag.de data: blob:;
font-src 'self';
connect-src 'self' https://api.openai.com;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
upgrade-insecure-requests;
```

## Blocked Attack Vectors

| Attack | Protection |
|--------|------------|
| CSRF (Cross-Site Request Forgery) | Origin validation |
| XSS (Cross-Site Scripting) | Input sanitization, CSP |
| SQL Injection | No database, all data static |
| Prompt Injection | Pattern detection, input sanitization |
| DDoS/Rate Abuse | IP rate limiting |
| Bot Automation | User-agent detection, honeypot, timing |
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
| `NEXT_PUBLIC_APP_URL` | Public | Origin validation |

## Vercel Deployment Security

- **Region**: `fra1` (Frankfurt) - GDPR-compliant EU region
- **No serverless function logs exposed**: Errors return generic messages
- **API routes cache disabled**: `Cache-Control: no-store`

## Future Enhancements

Consider implementing:
- [ ] Turnstile/hCaptcha for suspicious IPs
- [ ] Geographic restrictions (DE-only)
- [ ] Request signing with client-side tokens
- [ ] Webhook alerts for attack patterns
- [ ] Database-backed rate limiting for horizontal scaling

## Reporting Vulnerabilities

If you discover a security vulnerability, please email [REDACTED] immediately. Do not open a public GitHub issue.
