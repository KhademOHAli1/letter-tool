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

## Technical Implementation

- Uses the `qrcode` library for generation
- Client-side rendering with Canvas API
- Responsive design with shadcn/ui components
- No external API dependencies

## Domain Configuration

All QR codes and domain references have been standardized to use:
**https://letter-tool.vercel.app**

This ensures consistency across:
- Environment variables (NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_BASE_URL)
- OG images
- Sitemaps and robots.txt
- API security validation
- QR code generation
