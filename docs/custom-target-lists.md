# Custom Target Lists - Campaign Organizer Guide

This guide explains how to use custom target lists for your advocacy campaigns. Custom target lists allow you to define specific recipients (universities, organizations, officials, etc.) that supporters can contact based on their location.

## Overview

When you enable **Custom Targets** for your campaign:
- Supporters enter their postal code
- The system finds the nearest targets from your uploaded list
- Supporters can also search for targets by name
- If targets have geo coordinates, distance calculations are more accurate

## Enabling Custom Targets

### During Campaign Creation

1. Go to **Admin → Campaigns → New Campaign**
2. In Step 1 (Basic Info), scroll to **Custom Audience**
3. Check **"Enable custom audience list"**
4. Upload your target list or import from Google Sheets

### For Existing Campaigns

1. Go to **Admin → Campaigns → [Your Campaign] → Settings**
2. Check **"Enable custom target list"**
3. Upload your target list or import from Google Sheets

## Import Methods

### Upload from File

Upload a CSV, TSV, or JSON file from your computer.

### Import from Google Sheets

1. Create your target list in Google Sheets
2. Share the sheet: **Share → Anyone with the link → Viewer**
3. Copy the sheet URL (e.g., `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`)
4. Paste the URL in the import field and click **Import**

> **Note:** Only the first sheet (tab) will be imported. Make sure your headers are in the first row.

## File Formats

You can upload targets as **CSV**, **TSV**, or **JSON** files.

### Required Columns

| Column | Description |
|--------|-------------|
| `name` | Target name (e.g., "University of Berlin") |
| `email` | Contact email address |
| `postal_code` | Postal/ZIP code for location matching |

### Optional Columns

| Column | Description |
|--------|-------------|
| `city` | City name (displayed to users) |
| `region` | State/region/province |
| `country_code` | Two-letter country code (DE, UK, US, etc.) |
| `category` | Type/category (e.g., "University", "Hospital") |
| `image_url` | URL to target's logo/image |
| `latitude` | Latitude coordinate (for precise distance) |
| `longitude` | Longitude coordinate (for precise distance) |

### Column Name Variations

The system accepts various column name formats:

- **Postal code**: `postal_code`, `postalcode`, `postcode`, `plz`, `zip`
- **Country**: `country_code`, `countrycode`, `country`
- **Region**: `region`, `state`
- **Category**: `category`, `type`
- **Image**: `image_url`, `imageurl`, `image`
- **Latitude**: `latitude`, `lat`
- **Longitude**: `longitude`, `lng`, `lon`

## CSV Example

```csv
name,email,postal_code,city,region,country_code,category,latitude,longitude
Humboldt University,contact@hu-berlin.de,10117,Berlin,Berlin,DE,University,52.5186,13.3930
Technical University Munich,info@tum.de,80333,Munich,Bavaria,DE,University,48.1486,11.5680
University of Hamburg,info@uni-hamburg.de,20148,Hamburg,Hamburg,DE,University,53.5653,9.9847
```

## JSON Example

```json
[
  {
    "name": "Humboldt University",
    "email": "contact@hu-berlin.de",
    "postal_code": "10117",
    "city": "Berlin",
    "region": "Berlin",
    "country_code": "DE",
    "category": "University",
    "latitude": 52.5186,
    "longitude": 13.3930
  },
  {
    "name": "Technical University Munich",
    "email": "info@tum.de",
    "postal_code": "80333",
    "city": "Munich",
    "region": "Bavaria",
    "country_code": "DE",
    "category": "University",
    "latitude": 48.1486,
    "longitude": 11.5680
  }
]
```

## How Distance Matching Works

### With Geo Coordinates (Recommended)

When targets have `latitude` and `longitude`:
1. The system asks users for their location (browser permission)
2. Calculates real distance using the Haversine formula
3. Returns targets sorted by actual distance in kilometers

### Without Geo Coordinates (Fallback)

When geo coordinates are not available:
1. Matches based on postal code prefix similarity
2. For numeric postal codes, calculates numeric distance
3. Less accurate but still functional

## Tips for Best Results

### 1. Include Geo Coordinates

Adding latitude/longitude to your targets dramatically improves accuracy. You can find coordinates using:
- [Google Maps](https://maps.google.com) - Right-click on location
- [Nominatim/OpenStreetMap](https://nominatim.openstreetmap.org/)
- Batch geocoding services

### 2. Use Consistent Postal Codes

- Include the full postal code (e.g., "10117" not "101")
- Use the same format as your country's standard
- Germany: 5 digits (10115)
- UK: Full postcode (SW1A 1AA)
- US: 5-digit ZIP (90210)
- Canada: 6 characters (M5V 2H1)

### 3. Add Categories

Categories help users understand target types:
- "University", "Hospital", "NGO", "Government Office"
- Categories are displayed as tags in the selection UI

### 4. Validate Your Data

Before uploading:
- Check all emails are valid
- Verify postal codes are correct
- Test with a few known locations

## Managing Targets

### Replacing the List

Uploading a new file **replaces** all existing targets. Make sure your new file is complete.

### Downloading the Template

Click "Download template" to get a CSV file with the correct column headers.

### Clearing Targets

Click "Clear list" to remove all targets. This doesn't disable custom targeting—it just empties the list.

### Preview

After uploading, you'll see a preview of the first 5 targets to verify the import worked correctly.

## User Experience

When supporters use your campaign:

1. **Enter Postal Code**: User enters their postal code
2. **Nearest Targets Shown**: System displays 8 nearest targets
3. **Search Option**: Users can also search by name, city, or category
4. **Select Target**: User picks a target to write to
5. **Write Letter**: The selected target's info is used in the letter

## Troubleshooting

### "No valid targets found"

- Check that your file has the required columns: `name`, `email`, `postal_code`
- Verify the file is valid CSV/TSV/JSON format
- Check for encoding issues (use UTF-8)

### Targets Not Showing for Postal Code

- The postal code may not match any targets closely enough
- Add more targets in that region
- Add geo coordinates for better matching

### Wrong Distance Ordering

- Without geo coordinates, ordering is approximate
- Add latitude/longitude for accurate distance sorting
- Ensure postal codes are complete and correct

## Example Use Cases

### University Deans Campaign

Target university deans across a country, letting supporters contact their nearest university.

```csv
name,email,postal_code,city,category,latitude,longitude
Dean - University of Berlin,dean@fu-berlin.de,14195,Berlin,University,52.4534,13.2903
Dean - University of Munich,dean@lmu.de,80539,Munich,University,48.1508,11.5802
```

### Hospital Ethics Committees

Target hospital ethics committees for medical advocacy.

### Local Government Officials

Target mayors or council members by postal code region.

## Need Help?

If you have questions about setting up custom targets, please open an issue on GitHub or contact the platform administrators.
