# Component Exports - Quick Reference

All components are now exportable from the central barrel file for cleaner imports.

## Import Syntax

```typescript
// ✅ Recommended: Barrel import (cleaner)
import { QRCodeDisplay, LetterForm, ShareButtons } from "@/components";

// ✅ Also works: Direct import
import { QRCodeDisplay } from "@/components/qr-code";
```

## Available Exports

### QR Code
- `QRCodeDisplay` - QR code component with download/copy actions
- `QRCodeProps` - TypeScript interface for props

### Campaign Components
- `CampaignHeader` - Campaign header with title and description
- `CampaignPublicCard` - Public-facing campaign card
- `CampaignGoal` - Goal progress display

### Letter Components
- `LetterForm` - Main letter generation form
- `LetterOutput` - Display generated letter
- `LetterHistory` - Letter history display
- `EmailSender` - Email sending functionality
- `downloadLetterPdf` - PDF download function
- `GermanLetterDocument` - German letter template
- `BlockLetterDocument` - Block-style letter template
- `FrenchLetterDocument` - French letter template

### Stats & Display
- `ImpactStats` - Impact statistics display

### Sharing
- `ShareButtons` - Social sharing buttons

### Navigation & Layout
- `SiteHeader` - Main site header
- `CountrySwitcher` - Country selection component
- `LanguageSwitcher` - Language selection component

### Utilities
- `VoiceInput` - Voice input component

## Usage Examples

```typescript
// Single import
import { QRCodeDisplay } from "@/components";

// Multiple imports
import { 
  LetterForm, 
  ShareButtons, 
  ImpactStats 
} from "@/components";

// Import with type
import { QRCodeDisplay, type QRCodeProps } from "@/components";

// All from one place
import {
  QRCodeDisplay,
  LetterForm,
  LetterOutput,
  EmailSender,
  ShareButtons,
  ImpactStats
} from "@/components";
```

## Benefits

✅ **Cleaner Imports**: Single import source  
✅ **Type Safety**: All types exported  
✅ **Tree Shaking**: Only imports what you use  
✅ **Discoverability**: IDE autocomplete shows all available components  
✅ **Maintainability**: Central place to manage exports  

## File Location

**Barrel Export:** `src/components/index.ts`

To add new exports, edit this file and follow the existing pattern.
