# Adding a New Country to Letter-Tools

This checklist documents all files and configurations that must be updated when adding support for a new country.

## Prerequisites

Before starting, gather:
- [ ] Country code (2-letter ISO code, e.g., `us`, `de`, `ca`)
- [ ] Legislature name (e.g., "Congress", "Bundestag", "Parliament")
- [ ] Representative title (e.g., "Representative", "Senator", "MP", "MdB")
- [ ] Postal code format and validation regex
- [ ] Data source for representatives (names, parties, districts, contact info)
- [ ] Data source for postal code → district mapping
- [ ] Policy demands relevant to that country's political context
- [ ] Flag SVG (for flags.tsx component)

---

## Quick Reference: All Files to Modify

| Category | File | Action |
|----------|------|--------|
| **Data** | `src/lib/data/{country}/` | Create directory |
| | `src/lib/data/{country}/forderungen-{country}.ts` | Create demands |
| | `src/lib/data/{country}/representative-data.json` | Create rep data |
| | `src/lib/data/{country}/districts.ts` | Create lookup functions |
| | `src/lib/data/{country}/*.json` | Create postal code mapping |
| **Prompt** | `src/lib/prompts/letter-prompt-{country}.ts` | Create system prompt |
| **Config** | `src/lib/country-config.ts` | Add to CountryCode type, COUNTRY_CONFIGS, VALID_COUNTRIES |
| **Geo/Proxy** | `src/proxy.ts` | Add country to geo-detection and routing |
| **Layout** | `src/app/[country]/layout.tsx` | Add COUNTRY_LANGUAGES, SEO_CONTENT, DEFAULT_LANG, OG_LOCALES |
| **Components** | `src/components/country-switcher.tsx` | Add to COUNTRIES array |
| | `src/components/header-settings.tsx` | Add to CountryCode type, COUNTRIES, COUNTRY_LANGUAGES |
| | `src/components/footer-settings.tsx` | Add to CountryCode type, COUNTRIES |
| | `src/components/flags.tsx` | Add flag SVG component, add to FLAGS map |
| | `src/components/letter-form.tsx` | Add imports, country detection, postal code handling |
| **API** | `src/app/api/generate-letter/route.ts` | Import prompt & demands, add to CountryCode type, add switch cases |
| **Editor** | `src/app/[country]/editor/page.tsx` | Add party colors, update getDefaultSubject |
| **Success** | `src/app/[country]/success/page.tsx` | Add default subject, country-specific logic |
| **SEO** | `src/app/api/og/route.tsx` | Add OG_CONTENT and DEFAULT_LANG for OG images |
| | `src/app/sitemap.ts` | Add to countries, countryLanguages, countryDocs |
| | `src/app/robots.ts` | Review robots rules (usually no changes needed) |
| **Optional** | `src/lib/i18n/translations.ts` | Add translations if new language |
| | `content/{country}/*.md` | Add legal pages |
| | `scripts/fetch-{country}-data.ts` | Create data fetch script |

---

## 1. Data Files

### 1.1 Create Country Data Directory
```
src/lib/data/{country}/
```

### 1.2 Create Demands File
**File:** `src/lib/data/{country}/forderungen-{country}.ts`

```typescript
export interface Demand{COUNTRY} {
  id: string;
  title: { en: string; /* other languages */ };
  description: { en: string; };
  briefText: { en: string; };
  jurisdiction: string;
}

export const DEMANDS_{COUNTRY}: Demand{COUNTRY}[] = [
  // Priority-ordered list of demands
];
```

**Checklist:**
- [ ] Define interface with appropriate language fields
- [ ] Create 8-10 priority-ordered demands
- [ ] Include `id`, `title`, `description`, `briefText`, `jurisdiction`
- [ ] Update death toll figure to current (currently 36,500)
- [ ] Adapt demands to country's political/legal context

### 1.3 Create Representative Data
**File:** `src/lib/data/{country}/representative-data.json`

```json
[
  {
    "id": "unique-id",
    "name": "Full Name",
    "party": "Party Name",
    "district": "District Name",
    "state": "State/Province",
    "email": "email@gov.example",
    "phone": "+1-xxx-xxx-xxxx",
    "website": "https://...",
    "imageUrl": "https://..."
  }
]
```

### 1.4 Create Postal Code Mapping
**File:** `src/lib/data/{country}/postal-district.json` (or similar)

Maps postal codes to legislative districts. Structure depends on country.

### 1.5 Create District Lookup Module
**File:** `src/lib/data/{country}/districts.ts`

```typescript
export function getDistrictByPostalCode(postalCode: string): District | null
export function getRepresentativesByDistrict(districtId: string): Representative[]
```

---

## 2. Letter Prompt

**File:** `src/lib/prompts/letter-prompt-{country}.ts`

```typescript
export const LETTER_SYSTEM_PROMPT_{COUNTRY} = `ROLE
You are writing a formal but personal letter...

CONTEXT - SITUATION IN IRAN (As of January 2026)
- Over 36,500 killed (source: Iran International, January 2026)
...
`;
```

**Checklist:**
- [ ] Adapt salutation format for country's customs
- [ ] Set appropriate word limit (400-600 words)
- [ ] Include country-specific political context
- [ ] Reference relevant legislation/treaties
- [ ] Update death toll figure

---

## 3. Country Configuration

**File:** `src/lib/country-config.ts`

### 3.1 Update CountryCode Type
```typescript
export type CountryCode = "de" | "ca" | "uk" | "fr" | "us" | "{country}";
```

### 3.2 Add to COUNTRY_CONFIGS
```typescript
{country}: {
  code: "{country}",
  name: { en: "Country Name", native: "Native Name" },
  flag: "🏳️",
  defaultLanguage: "en",
  languages: ["en"],
  legislatureLabel: { en: "...", native: "..." },
  representativeLabel: { en: "...", native: "...", short: "..." },
  postalCode: {
    label: { en: "ZIP Code", native: "..." },
    placeholder: "12345",
    pattern: /^\d{5}$/,
    maxLength: 5,
  },
  legalPages: {
    impressum: null,
    privacy: "/privacy-policy",
    dataTransparency: "/data-transparency",
  },
  footer: { ... },
  isReady: true,
},
```

### 3.3 Update VALID_COUNTRIES Array
```typescript
export const VALID_COUNTRIES: CountryCode[] = ["de", "ca", "uk", "fr", "us", "{country}"];
```

---

## 4. Geo-Detection & Proxy

**File:** `src/proxy.ts`

The proxy handles automatic country detection based on Vercel's geo headers.

### 4.1 Add Country Detection Array
```typescript
// Countries that should route to {country} version
const {COUNTRY}_COUNTRIES = ["{ISO_CODE}"];  // e.g., ["US"] or ["AU", "NZ"]
```

### 4.2 Update Skip Logic
```typescript
if (
  pathname.startsWith("/de") ||
  pathname.startsWith("/ca") ||
  // ... existing countries
  pathname.startsWith("/{country}")
) {
  return NextResponse.next();
}
```

### 4.3 Update Cookie Check
```typescript
if (countryCookie && ["de", "ca", "uk", "fr", "us", "{country}"].includes(countryCookie)) {
```

### 4.4 Update Target Country Type
```typescript
let targetCountry: "de" | "ca" | "uk" | "fr" | "us" | "{country}" = "de";
```

### 4.5 Add Detection Logic
```typescript
} else if ({COUNTRY}_COUNTRIES.includes(detectedCountry)) {
  targetCountry = "{country}";
}
```

---

## 5. Layout & SEO

**File:** `src/app/[country]/layout.tsx`

### 5.1 Add to COUNTRY_LANGUAGES
```typescript
{country}: ["en"],  // or ["en", "fr"] etc.
```

### 5.2 Add SEO_CONTENT
```typescript
{country}: {
  en: {
    title: "Voice for Iran | Write to Your Representative",
    description: "Advocate for human rights in Iran...",
    ogAlt: "Voice for Iran - Write to Your Representative",
  },
},
```

### 5.3 Add to DEFAULT_LANG
```typescript
{country}: "en",
```

### 4.4 Add to OG_LOCALES
```typescript
{country}: { en: "en_{COUNTRY}" },
```

---

## 5. Components

### 5.1 Flag Component
**File:** `src/components/flags.tsx`

Add SVG flag component:
```tsx
function Flag{Country}({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 32 24" className={className} role="img" aria-labelledby="flag{Country}Title">
      <title id="flag{Country}Title">Country Name</title>
      {/* SVG paths for flag */}
    </svg>
  );
}
```

Add to FLAGS map:
```typescript
export const FLAGS: Record<string, React.FC<FlagProps>> = {
  // ...existing flags
  {country}: Flag{Country},
};
```

### 5.2 Country Switcher
**File:** `src/components/country-switcher.tsx`

Add to COUNTRIES array:
```typescript
{ code: "{country}", label: "🏳️", name: "Country Name" },
```

### 5.3 Header Settings
**File:** `src/components/header-settings.tsx`

Update CountryCode type:
```typescript
type CountryCode = "de" | "ca" | "uk" | "fr" | "us" | "{country}";
```

Add to COUNTRIES array:
```typescript
{ code: "{country}", name: "Country Name" },
```

Add to COUNTRY_LANGUAGES:
```typescript
{country}: ["en"],  // languages available
```

### 5.4 Footer Settings
**File:** `src/components/footer-settings.tsx`

Update CountryCode type:
```typescript
type CountryCode = "de" | "ca" | "uk" | "fr" | "us" | "{country}";
```

Add to COUNTRIES array:
```typescript
{ code: "{country}", name: "Country Name" },
```

Update country detection in `currentCountry`:
```typescript
: pathname.startsWith("/{country}")
  ? "{country}"
```

### 5.5 Letter Form
**File:** `src/components/letter-form.tsx`

**Imports to add:**
```typescript
import { DEMANDS_{COUNTRY} } from "@/lib/data/{country}/forderungen-{country}";
import { findRepByPostalCode, type Representative } from "@/lib/data/{country}/districts";
```

**Country detection:**
```typescript
const is{Country} = country === "{country}";
```

**Demands selection:**
```typescript
const demands = isCanada
  ? DEMANDS_CA
  : is{Country}
    ? DEMANDS_{COUNTRY}
    : FORDERUNGEN;
```

**Postal code lookup logic:**
Add a new branch in the `useEffect` that handles postal code changes.

**Draft restore logic:**
Add a new branch in `restoreDraft` for the country.

**Template reuse logic:**
Add a new branch in the template reuse `useEffect`.

---

## 6. API Route

**File:** `src/app/api/generate-letter/route.ts`

### 6.1 Imports
```typescript
import { DEMANDS_{COUNTRY}, type Demand{COUNTRY} } from "@/lib/data/{country}/forderungen-{country}";
import { LETTER_SYSTEM_PROMPT_{COUNTRY} } from "@/lib/prompts/letter-prompt-{country}";
```

### 6.2 Update CountryCode Type
```typescript
type CountryCode = "de" | "ca" | "uk" | "fr" | "us" | "{country}";
```

### 6.3 Update getDemandInfo Function
```typescript
if (country === "{country}") {
  const d = demand as Demand{COUNTRY};
  return { title: d.title.en, briefText: d.briefText.en };
}
```

### 6.4 Update Country Detection
```typescript
const country: CountryCode =
  rawBody.country === "{country}"
    ? "{country}"
    : // ...existing countries
```

### 6.5 Update Demands Selection
```typescript
const demands =
  country === "{country}"
    ? DEMANDS_{COUNTRY}
    : // ...existing countries
```

### 6.6 Update System Prompt Selection
```typescript
const systemPrompt =
  country === "{country}"
    ? LETTER_SYSTEM_PROMPT_{COUNTRY}
    : // ...existing countries
```

---

## 7. Success Page

**File:** `src/app/[country]/success/page.tsx`

### 7.1 Update Default Subject
```typescript
function getDefaultSubject(country: string): string {
  if (country === "{country}") {
    return "Request for Support: Human Rights in Iran";
  }
  // ...existing countries
}
```

### 7.2 Add Country-Specific Logic (if needed)
For countries with special handling (e.g., multiple representatives per district).

---

## 8. SEO & GEO (Search/Generative Engine Optimization)

These files ensure proper visibility in search engines and AI-powered search tools.

### 8.1 OG Images

**File:** `src/app/api/og/route.tsx`

Add country content to `OG_CONTENT`:
```typescript
{country}: {
  en: {
    badge: "Your Voice Matters",
    title: "Voice for Iran",
    subtitle: "Write to your {representative_type} for human rights in Iran",
    cta: "Write your letter in 5 minutes →",
    domain: "voiceforiran.{tld}",
  },
  // Add other languages if supported
},
```

Add to `DEFAULT_LANG`:
```typescript
const DEFAULT_LANG: Record<string, "de" | "en" | "fr"> = {
  // ...existing
  {country}: "en",
};
```

### 8.2 Sitemap

**File:** `src/app/sitemap.ts`

Add country to the countries array:
```typescript
const countries = ["de", "ca", "uk", "fr", "us", "{country}"];
```

Add language configuration:
```typescript
const countryLanguages: Record<string, string[]> = {
  // ...existing
  {country}: ["en"], // or ["en", "fr"] for bilingual
};
```

Add document slugs:
```typescript
const countryDocs: Record<string, string[]> = {
  // ...existing
  {country}: ["privacy-policy", "legal-notice", "data-transparency"],
};
```

### 8.3 Robots

**File:** `src/app/robots.ts`

Usually no changes needed. Review if country has specific crawl requirements.

### 8.4 SEO Testing

After deployment, verify:
- [ ] Visit `/sitemap.xml` - country pages listed
- [ ] Visit `/robots.txt` - correct rules
- [ ] Visit `/api/og?country={country}&lang=en` - OG image renders
- [ ] Check page source for correct `<meta>` tags
- [ ] Test Open Graph debugger (Facebook/Twitter/LinkedIn)

---

## 9. Translations (if adding new language)

**File:** `src/lib/i18n/translations.ts`

If the country uses a language not yet supported:
- [ ] Add language to `Language` type
- [ ] Add translations for all UI strings

---

## 10. Database/Tracking

**File:** `src/lib/supabase.ts`

The country is already tracked via the `country` column (added in migration 004). No changes needed unless adding country-specific analytics.

---

## 11. Content (Optional)

### Legal Pages
If creating country-specific legal pages:

```
content/{country}/
├── privacy-policy.md
├── data-transparency.md
└── legal-notice.md (if applicable)
```

Update `src/lib/content.ts` to load these files.

---

## 12. Scripts (Optional)

If data needs to be fetched/processed:

**File:** `scripts/fetch-{country}-data.ts`

Document the data source and processing steps.

---

## Testing Checklist

After implementation:

- [ ] Navigate to `/{country}` - page loads correctly
- [ ] Country appears in header country switcher
- [ ] Country appears in footer country switcher  
- [ ] Flag displays correctly in header/footer
- [ ] Enter valid postal code - representative(s) appear
- [ ] Select demands and write story
- [ ] Generate letter - correct prompt used, letter in correct language
- [ ] Copy/email letter works
- [ ] Switching to/from new country works
- [ ] SEO metadata correct (check page source)
- [ ] Draft save/restore works
- [ ] Template reuse works
- [ ] Success page shows correctly
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` passes

---

## Example: Adding Germany (Reference Implementation)

The Germany implementation is the primary reference:

- Data: `src/lib/data/`
  - `forderungen.ts` - 8 demands based on Strategiepapier Iran 2026
  - `mdb-data.json` - 736 Members of Bundestag (MdBs)
  - `wahlkreise-data.json` - 299 electoral districts (Wahlkreise)
  - `plz-wahlkreis-geo.json` - PLZ → Wahlkreis mapping
  - `wahlkreise.ts` - lookup functions

- Prompt: `src/lib/prompts/letter-prompt.ts`
  - German primary, English fallback
  - Formal salutation (Sehr geehrte/r Frau/Herr)
  - 600 word limit
  - References R2P, VStGB, IRGC EU terror list

- Special handling: Germany uses 5-digit PLZ (Postleitzahl) mapped to Wahlkreise, each with one directly-elected MdB.

---

## Other Country Examples

### United States
- Bicameral legislature (House + Senate)
- ZIP code → Congressional District mapping
- Shows chamber selector (Representative vs Senator)
- 2 Senators + 1 Representative per ZIP

### Canada
- Bilingual (English + French)
- Postal codes (letter-number format) → Riding mapping
- IRGC already listed as terrorist entity (June 2024)

### United Kingdom
- Single chamber focus (House of Commons)
- Postcode → Constituency mapping
- Partial IRGC proscription context

### France
- Bilingual UI (French + English)
- Code postal → Circonscription mapping
- EU policy focus (CGRI listing, E3 coordination)
