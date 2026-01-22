## 1. Data Controller

Data controller within the meaning of the General Data Protection Regulation (GDPR):

**Ali Khademolhosseini**

Email: [hi@khademohali.me](mailto:hi@khademohali.me)

## 2. Overview of Data Processing

This website helps you write a personal letter to your member of the Bundestag. The following data is processed:

### Data you enter (form data)

- **Your name** - for the letter salutation
- **Your postal code** - to determine your electoral district and representative
- **Your personal story** - the emotional core of your letter
- **Selected demands** - which topics you want to address

### Technical data (automatically collected)

- **IP address** - for rate limiting and abuse protection (hashed)
- **Browser fingerprint** - for bot detection (hashed, anonymized)
- **User agent** - for bot detection
- **Timestamp** - when requests were made
- **Form timing** - how quickly the form was filled (bot protection)

### Data that is NOT stored

- Your name is not permanently stored
- Your personal story is not stored
- The generated letter text is not stored on our servers
- Your postal code is not stored (only the determined district name)

## 3. Letter Generation with AI (OpenAI)

**This is the most important point:** When you have a letter generated, your inputs (name, district, personal note, selected demands) are transmitted to OpenAI, LLC servers in the USA.

> **Important notes on data transfer to the USA**
>
> - OpenAI processes your data in the USA (third country under GDPR)
> - Transfer is based on your explicit consent (Art. 49(1)(a) GDPR)
> - OpenAI is certified under the EU-US Data Privacy Framework
> - OpenAI stores API requests for up to 30 days for abuse detection

**Legal basis:** Your explicit consent under Art. 6(1)(a) GDPR, which you give by activating the checkbox before generation.

**Withdrawal:** You can withdraw your consent at any time with effect for the future by contacting us by email. The lawfulness of processing based on consent before its withdrawal remains unaffected.

More information: [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)

## 4. Hosting (Vercel)

This website is hosted by Vercel Inc. Vercel processes technical data such as IP addresses to provide the website.

- **Provider:** Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
- **Server location:** Frankfurt (fra1) - EU region
- **Legal basis:** Legitimate interest (Art. 6(1)(f) GDPR)
- **Guarantees:** EU-US Data Privacy Framework, SCCs

More information: [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

## 5. Web Analytics (Vercel Analytics)

We use Vercel Analytics to analyze website usage. Anonymized data is collected:

- Page views and time on page
- Device category and operating system (anonymized)
- Geographic region (country level)

**Note:** Vercel Analytics is privacy-friendly and does not set cookies. IP addresses are not stored.

**Legal basis:** Legitimate interest in improving our service (Art. 6(1)(f) GDPR).

## 6. Rate Limiting and Abuse Protection

To protect against abuse, we temporarily store:

- Hashed IP addresses (to limit requests per minute)
- Browser fingerprints (for bot detection)
- Timestamps of recent requests

**Storage duration:** This data is only held in memory and automatically deleted after a maximum of 1 hour.

**Legal basis:** Legitimate interest in protection against abuse (Art. 6(1)(f) GDPR).

## 7. Anonymized Usage Statistics

To measure the effectiveness of our campaign, we store anonymized metadata for each letter generation in our database (Supabase, EU region Frankfurt):

- Name of the contacted MP and party
- Selected demands (IDs only)
- District name
- Anonymized browser fingerprint (for deduplication)
- Timestamp

**Not stored:** Your name, your personal story, the letter text itself, or any other personal data.

**Purpose:** Aggregated statistics (e.g., "423 letters sent to the Bundestag") for motivation and transparency.

**Legal basis:** Legitimate interest in effectiveness measurement (Art. 6(1)(f) GDPR).

## 8. Local Storage and Cookies

This website uses local storage technologies in your browser:

### Functional Cookies

We only set strictly necessary cookies that don't require consent (ePrivacy Directive Art. 5(3)):

- **theme:** Stores your light/dark mode preference (validity: 1 year)
- **lang:** Stores your language setting DE/EN (validity: 1 year)

These cookies contain no personal data and serve solely to improve your user experience.

### LocalStorage

- **Generated letter:** Temporarily stored in your browser so you can copy or send it by email. This data does not leave your computer.
- **Preferences:** Theme and language are additionally stored in LocalStorage as a fallback.

**Legal basis:** This storage is technically necessary for functionality (Art. 6(1)(f) GDPR) and requires no consent under ePrivacy Directive Art. 5(3). You can remove this data at any time by clearing your browser data.

### Draft Storage (Auto-Save)

Your form inputs are automatically saved in your browser's LocalStorage so you can continue your work if you leave the page or the browser crashes.

- **Storage location:** Only in your browser (LocalStorage)
- **Storage duration:** 24 hours, then automatic deletion
- **Content:** All form fields except sensitive data
- **Deletion:** Automatically after successful letter generation or manually by clicking "Discard"

### Letter History

Generated letters are stored locally in your browser so you can resend them or track them later.

- **Storage location:** Only in your browser (LocalStorage)
- **Storage duration:** Until you manually delete them or clear your browser data
- **Content:** Letter text, MP name, email, date, send status
- This data does not leave your computer and is not transmitted to us.

## 9. Voice Input

Optionally, you can dictate your personal story via voice input. This feature uses your browser's Web Speech API.

- **Provider:** Google (in Chrome/Edge) or Apple (in Safari) - depending on browser
- **Processing:** Audio is sent to the browser provider's servers for speech recognition
- **Storage:** We don't store any audio data - only the recognized text is used in the form
- **Consent:** Usage only occurs after you actively enable it (click on microphone icon)

**Legal basis:** Your explicit consent by activating the feature (Art. 6(1)(a) GDPR).

**Note:** For more information on data processing, see the privacy policies of [Google](https://policies.google.com/privacy) or [Apple](https://www.apple.com/legal/privacy/).

## 10. Email Open Tracking (Optional)

When you send a letter via the email function, an invisible tracking pixel may optionally be embedded to detect whether the email was opened.

### What is collected?

- Whether and when the email was opened (timestamp)
- Anonymized tracking ID (no personal data)

### What is NOT collected?

- Your name or email address
- The content of your letter
- The recipient's email address
- Your IP address

**Purpose:** Aggregated statistics on campaign effectiveness (e.g., "X% of letters were opened").

**Legal basis:** Legitimate interest in effectiveness measurement (Art. 6(1)(f) GDPR).

**Note:** Many email programs block tracking pixels by default. The statistics are therefore not complete.

## 11. No Permanent Storage of Your Letters

**We don't store your letters.** After generation, the letter is only displayed in your browser. We have no database of your personal letters.

The generated letter is temporarily held (for the duration of your browser session) in your local browser storage so you can copy or send it by email.

## 12. Data Sources for MP Information

The contact details of members of the Bundestag (MPs) come from publicly available sources:

- **Bundestag Open Data:** Names, party affiliation, email addresses of MPs ([bundestag.de/opendata](https://www.bundestag.de/services/opendata))
- **Federal Returning Officer:** Electoral districts and their geographic assignment
- **OpenStreetMap/ArcGIS:** Postal code to district mapping

This data is public and not subject to any special confidentiality. Processing is carried out to provide the service (Art. 6(1)(f) GDPR).

## 13. Your Rights

You have the following rights under GDPR:

- **Access (Art. 15):** You can request information about your processed data.
- **Rectification (Art. 16):** You can request correction of inaccurate data.
- **Erasure (Art. 17):** You can request deletion of your data.
- **Restriction (Art. 18):** You can request restriction of processing.
- **Data portability (Art. 20):** You can receive your data in a common format.
- **Objection (Art. 21):** You can object to processing.
- **Withdrawal (Art. 7):** You can withdraw given consents at any time.

To exercise your rights, please contact us by email.

## 14. Right to Complain to Supervisory Authority

You have the right to complain to a data protection supervisory authority. The responsible authority depends on your place of residence or the seat of the controller.

List of supervisory authorities: [German Data Protection Authorities](https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html)

## 15. Technical Security Measures

To protect your data, we implement the following technical measures (Art. 32 GDPR):

- **HTTPS/TLS:** All data transfers are encrypted
- **HSTS:** Enforces secure connections
- **CSP:** Content Security Policy for XSS protection
- **Input sanitization:** All inputs are sanitized
- **Rate limiting:** Protection against overload attacks
- **Bot detection:** Protection against automated attacks
- **IP hashing:** IP addresses are only processed in hashed form

## 16. Currency of This Privacy Policy

**Last updated:** January 2026

We reserve the right to adapt this privacy policy to comply with changed legal situations or changes to the service.
