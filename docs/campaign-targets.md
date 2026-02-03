# Campaign Custom Targets

Campaign organizers can upload a custom target list so supporters are routed to the nearest recipient by postal code, or can search by name/location.

## When To Use It

Use custom targets when your campaign should reach organizations (universities, NGOs, local institutions, etc.) instead of elected representatives. Example: a campaign targeting university deans in Germany.

## Enable Custom Targets

1. Go to the campaign edit page.
2. Open the **Settings** tab.
3. In **Custom Targets**, enable **Enable custom target list**.
4. Upload your CSV/TSV/JSON target file.

The uploaded list replaces any existing targets for that campaign.

## Target File Format

You can upload CSV/TSV or JSON. Required fields:

- `name`
- `email`
- `postal_code`

Optional fields:

- `city`
- `region`
- `country_code`
- `category` (used as a badge label in the UI)
- `image_url`
- `latitude` (decimal degrees)
- `longitude` (decimal degrees)

### CSV/TSV Example

```csv
name,email,postal_code,city,region,country_code,category,latitude,longitude
Example University,info@example.edu,10115,Berlin,Berlin,DE,University,52.5200,13.4050
```

### JSON Example

```json
[
  {
    "name": "Example University",
    "email": "info@example.edu",
    "postal_code": "10115",
    "city": "Berlin",
    "region": "Berlin",
    "country_code": "DE",
    "category": "University",
    "latitude": 52.52,
    "longitude": 13.405
  }
]
```

## How “Nearest” Works

When a supporter enters a postal code, the app selects the nearest targets using:

- Exact postal code matches first
- Shared prefix matching (e.g., `101` matches `10115`)
- Numeric proximity for numeric postal codes

Supporters can also search by name, city, region, or postal code to choose a target directly.

## Tips

- Use the **Download template** button in Settings for a ready-to-fill CSV.
- Keep postal codes formatted consistently for best matching.
- Include `category` to display a meaningful label (e.g., “University”, “Clinic”, “NGO”).
