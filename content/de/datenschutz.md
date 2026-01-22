## 1. Verantwortlicher

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:

**Ali Khademolhosseini**

E-Mail: [hi@khademohali.me](mailto:hi@khademohali.me)

## 2. Übersicht der Datenverarbeitung

Diese Website unterstützt Sie dabei, einen persönlichen Brief an Ihren Bundestagsabgeordneten zu verfassen. Dabei werden folgende Daten verarbeitet:

### Daten, die Sie eingeben (Formulardaten)

- **Ihr Name** - für die Briefanrede
- **Ihre Postleitzahl** - zur Ermittlung Ihres Wahlkreises und Abgeordneten
- **Ihre persönliche Geschichte** - der emotionale Kern Ihres Briefes
- **Ausgewählte Forderungen** - welche Themen Sie ansprechen möchten

### Technische Daten (automatisch erfasst)

- **IP-Adresse** - für Rate-Limiting und Missbrauchsschutz (gehasht)
- **Browser-Fingerprint** - zur Bot-Erkennung (gehasht, anonymisiert)
- **User-Agent** - zur Bot-Erkennung
- **Zeitstempel** - wann Anfragen gestellt wurden
- **Formular-Timing** - wie schnell das Formular ausgefüllt wurde (Bot-Schutz)

### Daten, die NICHT gespeichert werden

- Ihr Name wird nicht dauerhaft gespeichert
- Ihre persönliche Geschichte wird nicht gespeichert
- Der generierte Brieftext wird nicht auf unseren Servern gespeichert
- Ihre PLZ wird nicht gespeichert (nur der daraus ermittelte Wahlkreis-Name)

## 3. Briefgenerierung mit KI (OpenAI)

**Dies ist der wichtigste Punkt:** Wenn Sie einen Brief generieren lassen, werden Ihre Eingaben (Name, Wahlkreis, persönliche Notiz, ausgewählte Forderungen) an die Server von OpenAI, LLC in den USA übermittelt.

> **Wichtige Hinweise zur Datenübermittlung in die USA**
>
> - OpenAI verarbeitet Ihre Daten in den USA (Drittland gemäß DSGVO)
> - Die Übermittlung erfolgt auf Grundlage Ihrer ausdrücklichen Einwilligung (Art. 49 Abs. 1 lit. a DSGVO)
> - OpenAI ist unter dem EU-US Data Privacy Framework zertifiziert
> - OpenAI speichert API-Anfragen standardmäßig 30 Tage zur Missbrauchserkennung

**Rechtsgrundlage:** Ihre ausdrückliche Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO, die Sie durch Aktivieren der Checkbox vor der Generierung erteilen.

**Widerruf:** Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, indem Sie uns per E-Mail kontaktieren. Die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.

Weitere Informationen: [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)

## 4. Hosting (Vercel)

Diese Website wird bei Vercel Inc. gehostet. Vercel verarbeitet technische Daten wie IP-Adressen, um die Website bereitzustellen.

- **Anbieter:** Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
- **Server-Standort:** Frankfurt (fra1) - EU-Region
- **Rechtsgrundlage:** Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)
- **Garantien:** EU-US Data Privacy Framework, SCCs

Weitere Informationen: [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

## 5. Webanalyse (Vercel Analytics)

Wir nutzen Vercel Analytics zur Analyse der Websitenutzung. Dabei werden anonymisierte Daten erfasst:

- Seitenaufrufe und Verweildauer
- Gerätekategorie und Betriebssystem (anonymisiert)
- Geografische Region (auf Landesebene)

**Hinweis:** Vercel Analytics ist datenschutzfreundlich konzipiert und setzt keine Cookies. IP-Adressen werden nicht gespeichert.

**Rechtsgrundlage:** Berechtigtes Interesse an der Verbesserung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO).

## 6. Rate Limiting und Missbrauchsschutz

Zum Schutz vor Missbrauch speichern wir temporär:

- Gehashte IP-Adressen (zur Begrenzung der Anfragen pro Minute)
- Fingerprints des Browsers (zur Erkennung von Bots)
- Zeitstempel der letzten Anfragen

**Speicherdauer:** Diese Daten werden nur im Arbeitsspeicher gehalten und nach maximal 1 Stunde automatisch gelöscht.

**Rechtsgrundlage:** Berechtigtes Interesse am Schutz vor Missbrauch (Art. 6 Abs. 1 lit. f DSGVO).

## 7. Anonymisierte Nutzungsstatistik

Zur Messung der Wirksamkeit unserer Kampagne speichern wir bei jeder Briefgenerierung anonymisierte Metadaten in unserer Datenbank (Supabase, EU-Region Frankfurt):

- Name des kontaktierten MdB und Partei
- Ausgewählte Forderungen (nur IDs)
- Wahlkreis-Name
- Anonymisierter Browser-Fingerprint (zur Deduplizierung)
- Zeitstempel

**Nicht gespeichert:** Ihr Name, Ihre persönliche Geschichte, der Brieftext selbst oder sonstige personenbezogene Daten.

**Zweck:** Aggregierte Statistiken (z.B. "423 Briefe an den Bundestag gesendet") zur Motivation und Transparenz.

**Rechtsgrundlage:** Berechtigtes Interesse an der Wirksamkeitsmessung (Art. 6 Abs. 1 lit. f DSGVO).

## 8. Lokale Speicherung und Cookies

Diese Website nutzt lokale Speichertechnologien in Ihrem Browser:

### Funktionale Cookies

Wir setzen ausschließlich technisch notwendige Cookies, die keine Einwilligung erfordern (ePrivacy-Richtlinie Art. 5 Abs. 3):

- **theme:** Speichert Ihre Präferenz für Hell-/Dunkelmodus (Gültigkeit: 1 Jahr)
- **lang:** Speichert Ihre Spracheinstellung DE/EN (Gültigkeit: 1 Jahr)

Diese Cookies enthalten keine persönlichen Daten und dienen ausschließlich der Verbesserung Ihrer Nutzererfahrung.

### LocalStorage

- **Generierter Brief:** Wird temporär in Ihrem Browser gespeichert, damit Sie ihn kopieren oder per E-Mail versenden können. Diese Daten verlassen Ihren Computer nicht.
- **Präferenzen:** Theme und Sprache werden zusätzlich im LocalStorage als Fallback gespeichert.

**Rechtsgrundlage:** Diese Speicherung ist technisch notwendig für die Funktionalität (Art. 6 Abs. 1 lit. f DSGVO) und erfordert keine Einwilligung gemäß ePrivacy-Richtlinie Art. 5 Abs. 3. Sie können diese Daten jederzeit durch Löschen Ihrer Browserdaten entfernen.

### Entwurf-Speicherung (Auto-Save)

Ihre Formulareingaben werden automatisch im LocalStorage Ihres Browsers zwischengespeichert, damit Sie Ihre Arbeit fortsetzen können, falls Sie die Seite verlassen oder der Browser abstürzt.

- **Speicherort:** Nur in Ihrem Browser (LocalStorage)
- **Speicherdauer:** 24 Stunden, danach automatische Löschung
- **Inhalt:** Alle Formularfelder außer sensiblen Daten
- **Löschung:** Automatisch nach erfolgreicher Briefgenerierung oder manuell durch Klick auf "Verwerfen"

### Brief-Verlauf (Letter History)

Generierte Briefe werden lokal in Ihrem Browser gespeichert, damit Sie diese später erneut senden oder nachverfolgen können.

- **Speicherort:** Nur in Ihrem Browser (LocalStorage)
- **Speicherdauer:** Bis Sie die Briefe manuell löschen oder Ihre Browserdaten leeren
- **Inhalt:** Brieftext, MdB-Name, E-Mail, Datum, Versandstatus
- Diese Daten verlassen Ihren Computer nicht und werden nicht an uns übermittelt.

## 9. Spracheingabe (Voice Input)

Optional können Sie Ihre persönliche Geschichte per Spracheingabe diktieren. Diese Funktion nutzt die Web Speech API Ihres Browsers.

- **Anbieter:** Google (in Chrome/Edge) oder Apple (in Safari) - je nach Browser
- **Verarbeitung:** Audio wird zur Spracherkennung an die Server des Browser-Anbieters gesendet
- **Speicherung:** Wir speichern keine Audiodaten - nur der erkannte Text wird im Formular verwendet
- **Einwilligung:** Die Nutzung erfolgt nur nach Ihrer aktiven Aktivierung (Klick auf Mikrofon-Symbol)

**Rechtsgrundlage:** Ihre ausdrückliche Einwilligung durch Aktivierung der Funktion (Art. 6 Abs. 1 lit. a DSGVO).

**Hinweis:** Weitere Informationen zur Datenverarbeitung finden Sie in den Datenschutzerklärungen von [Google](https://policies.google.com/privacy) bzw. [Apple](https://www.apple.com/legal/privacy/).

## 10. E-Mail-Öffnungs-Tracking (Optional)

Wenn Sie einen Brief über die E-Mail-Funktion versenden, kann optional ein unsichtbares Tracking-Pixel eingebettet werden, um zu erkennen, ob die E-Mail geöffnet wurde.

### Was wird erfasst?

- Ob und wann die E-Mail geöffnet wurde (Zeitstempel)
- Anonymisierte Tracking-ID (keine personenbezogenen Daten)

### Was wird NICHT erfasst?

- Ihr Name oder Ihre E-Mail-Adresse
- Der Inhalt Ihres Briefes
- Die E-Mail-Adresse des Empfängers
- Ihre IP-Adresse

**Zweck:** Aggregierte Statistiken zur Wirksamkeit der Kampagne (z.B. "X% der Briefe wurden geöffnet").

**Rechtsgrundlage:** Berechtigtes Interesse an der Wirksamkeitsmessung (Art. 6 Abs. 1 lit. f DSGVO).

**Hinweis:** Viele E-Mail-Programme blockieren Tracking-Pixel standardmäßig. Die Statistik ist daher nicht vollständig.

## 11. Keine dauerhafte Speicherung Ihrer Briefe

**Wir speichern Ihre Briefe nicht.** Nach der Generierung wird der Brief nur in Ihrem Browser angezeigt. Wir haben keine Datenbank mit Ihren persönlichen Briefen.

Der generierte Brief wird temporär (für die Dauer Ihrer Browser-Sitzung) in Ihrem lokalen Browser-Speicher gehalten, damit Sie ihn kopieren oder per E-Mail versenden können.

## 12. Datenquellen für MdB-Informationen

Die Kontaktdaten der Bundestagsabgeordneten (MdBs) stammen aus öffentlich zugänglichen Quellen:

- **Bundestag Open Data:** Namen, Parteizugehörigkeit, E-Mail-Adressen der MdBs ([bundestag.de/opendata](https://www.bundestag.de/services/opendata))
- **Bundeswahlleiter:** Wahlkreise und deren geografische Zuordnung
- **OpenStreetMap/ArcGIS:** PLZ-zu-Wahlkreis-Mapping

Diese Daten sind öffentlich und unterliegen keiner besonderen Vertraulichkeit. Die Verarbeitung erfolgt zur Bereitstellung des Dienstes (Art. 6 Abs. 1 lit. f DSGVO).

## 13. Ihre Rechte

Sie haben gemäß DSGVO folgende Rechte:

- **Auskunft (Art. 15):** Sie können Auskunft über Ihre verarbeiteten Daten verlangen.
- **Berichtigung (Art. 16):** Sie können die Berichtigung unrichtiger Daten verlangen.
- **Löschung (Art. 17):** Sie können die Löschung Ihrer Daten verlangen.
- **Einschränkung (Art. 18):** Sie können die Einschränkung der Verarbeitung verlangen.
- **Datenübertragbarkeit (Art. 20):** Sie können Ihre Daten in einem gängigen Format erhalten.
- **Widerspruch (Art. 21):** Sie können der Verarbeitung widersprechen.
- **Widerruf (Art. 7):** Sie können erteilte Einwilligungen jederzeit widerrufen.

Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte per E-Mail.

## 14. Beschwerderecht bei der Aufsichtsbehörde

Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die zuständige Behörde richtet sich nach Ihrem Wohnort oder dem Sitz des Verantwortlichen.

Liste der Aufsichtsbehörden: [Datenschutzbehörden der Länder](https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html)

## 15. Technische Sicherheitsmaßnahmen

Zum Schutz Ihrer Daten setzen wir folgende technische Maßnahmen ein (Art. 32 DSGVO):

- **HTTPS/TLS:** Alle Datenübertragungen sind verschlüsselt
- **HSTS:** Erzwingt sichere Verbindungen
- **CSP:** Content Security Policy zum Schutz vor XSS
- **Input-Sanitization:** Alle Eingaben werden bereinigt
- **Rate-Limiting:** Schutz vor Überlastungsangriffen
- **Bot-Detection:** Schutz vor automatisierten Angriffen
- **IP-Hashing:** IP-Adressen werden nur gehasht verarbeitet

## 16. Aktualität dieser Datenschutzerklärung

**Stand:** Januar 2026

Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Änderungen des Dienstes anzupassen.
