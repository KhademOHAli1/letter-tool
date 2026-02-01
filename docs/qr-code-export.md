# QR Code Export Script

## Quick Export

To generate QR code PNG files locally:

```bash
bun scripts/generate-qr-codes.ts
```

This will create a `qr-codes/` directory with:
- **main-qr-400px.png** (400×400px) - Main deployment URL
- **germany-qr-300px.png** (300×300px) - Germany page
- **canada-qr-300px.png** (300×300px) - Canada page
- **uk-qr-300px.png** (300×300px) - UK page
- **france-qr-300px.png** (300×300px) - France page
- **usa-qr-300px.png** (300×300px) - US page
- **README.md** - Info about the generated files

## Generated Files

All QR codes are:
- ✅ High quality PNG format
- ✅ Black & white (prints well)
- ✅ 2px margin for scanning reliability
- ✅ Print-ready resolution
- ✅ Named descriptively

## Usage

The generated PNG files can be used in:
- 📄 Print materials (flyers, posters)
- 📱 Social media graphics
- 🖼️ Presentation slides
- 🎫 Event materials
- 📧 Email campaigns

## Customization

To change sizes or add more QR codes, edit:
`scripts/generate-qr-codes.ts`

Modify the `QR_CONFIGS` array:

```typescript
const QR_CONFIGS = [
  {
    name: "custom",
    url: "https://letter-tool.vercel.app/your-path",
    size: 500, // Change size
    label: "Custom Label",
  },
  // ... add more
];
```

## Notes

- The `qr-codes/` directory is in `.gitignore` (regenerate as needed)
- QR codes are optimized for scanning at various sizes
- Use the main (400px) version for primary marketing
- Use country-specific (300px) versions for targeted campaigns
