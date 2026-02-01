# QR Code Generator

## Access

The QR code generator is available at:
**https://letter-tool.vercel.app/qr**

## Features

- **Main QR Code**: Large QR code for the main deployment URL (letter-tool.vercel.app)
- **Country-Specific QR Codes**: Smaller QR codes for direct links to each country:
  - Germany: `/de`
  - Canada: `/ca`
  - United Kingdom: `/uk`
  - France: `/fr`
  - United States: `/us`

## Actions

Each QR code supports:
- **Download**: Save QR code as PNG image
- **Copy URL**: Copy the URL to clipboard

## Usage in Marketing Materials

1. Visit https://letter-tool.vercel.app/qr
2. Download the appropriate QR code(s)
3. Use in:
   - Flyers and posters
   - Social media graphics
   - Presentation slides
   - Print materials

---

## Developer Usage

### Component Export

The QR code component is available for reuse throughout the application:

```typescript
// Import from barrel export
import { QRCodeDisplay, type QRCodeProps } from "@/components";

// Or direct import
import { QRCodeDisplay } from "@/components/qr-code";
```

### Basic Usage

```tsx
import { QRCodeDisplay } from "@/components";

export default function MyPage() {
  return (
    <QRCodeDisplay
      value="https://letter-tool.vercel.app"
      size={256}
      label="Scan to visit"
    />
  );
}
```

### Props

```typescript
interface QRCodeProps {
  value: string;              // The URL or text to encode (required)
  size?: number;              // QR code size in pixels (default: 256)
  includeMargin?: boolean;    // Add margin around QR code (default: true)
  showDownload?: boolean;     // Show download button (default: true)
  showCopy?: boolean;         // Show copy URL button (default: true)
  label?: string;             // Display label below QR code (optional)
}
```

### Examples

**Minimal QR Code:**
```tsx
<QRCodeDisplay value="https://letter-tool.vercel.app/de" />
```

**Custom Size:**
```tsx
<QRCodeDisplay 
  value="https://letter-tool.vercel.app/ca" 
  size={400}
  label="Canada Campaign"
/>
```

**Without Actions:**
```tsx
<QRCodeDisplay 
  value="https://letter-tool.vercel.app" 
  showDownload={false}
  showCopy={false}
/>
```

**Compact Version:**
```tsx
<QRCodeDisplay 
  value="https://letter-tool.vercel.app/uk" 
  size={150}
  includeMargin={false}
/>
```

---

## Technical Implementation

- Uses the `qrcode` library for generation
- Client-side rendering with Canvas API
- Responsive design with shadcn/ui components
- No external API dependencies
- Toast notifications for user feedback

### File Structure

```
src/
├── components/
│   ├── index.ts              # Barrel export (includes QRCodeDisplay)
│   └── qr-code.tsx           # QR code component
├── app/
│   └── qr/
│       └── page.tsx          # QR code showcase page
└── docs/
    └── qr-codes.md           # This documentation
```

---

## Domain Configuration

All QR codes and domain references have been standardized to use:
**https://letter-tool.vercel.app**

This ensures consistency across:
- Environment variables (NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_BASE_URL)
- OG images
- Sitemaps and robots.txt
- API security validation
- QR code generation

---

## Deployment

The QR code page is:
- ✅ Automatically deployed with the main application
- ✅ Accessible at `/qr` route
- ✅ Not indexed by search engines (robots: noindex)
- ✅ Fully client-side rendered (no server dependencies)

---

## Future Enhancements

Potential improvements:
- [ ] Custom QR code colors/branding
- [ ] SVG export option
- [ ] Batch download (all country QR codes at once)
- [ ] Campaign-specific QR codes
- [ ] QR code analytics tracking
- [ ] Custom logo overlay on QR codes
