> **Wir wissen, dass Vertrauen in digitale Tools für Iraner:innen schwer ist. Diese Seite erklärt transparent, was mit euren Daten passiert.**

---

## 🔒 Zusammenfassung: Was passiert wirklich?

| Daten | Gespeichert? | Wo? | Wie lange? |
|-------|--------------|-----|------------|
| **Dein Name** | ❌ Nein | - | - |
| **Deine Geschichte** | ❌ Nein | - | - |
| **Der Brieftext** | ❌ Nein | Nur in deinem Browser | Bis du ihn löschst |
| **Deine IP-Adresse** | ⚠️ Nur gehasht | Server-Speicher | Max. 1 Stunde |

---

## Wir verstehen eure Sorgen

Als Iraner:innen wissen wir, dass Vertrauen in digitale Tools schwer ist. Viele von uns haben Freunde oder Familie, die wegen eines Posts, einer Unterschrift oder eines Fotos in Gefahr geraten sind.

**Deshalb haben wir diese Seite erstellt:** Volle Transparenz darüber, was mit euren Daten passiert - und was nicht.

## Wie finden wir deinen Abgeordneten?

Du gibst deine **Postleitzahl** ein, und wir ermitteln daraus deinen Wahlkreis und den zuständigen MdB.

| Schritt | Was passiert | Gespeichert? |
|---------|--------------|--------------|
| Du gibst deine PLZ ein | Wir suchen den passenden Wahlkreis | ❌ Nein |
| Wahlkreis wird gefunden | Name des MdB wird angezeigt | ✅ Nur der Wahlkreis-Name |
| Brief wird generiert | MdB-Name erscheint im Brief | ✅ MdB-Name für Statistik |

**Deine PLZ wird nicht gespeichert** - nur der Name des Wahlkreises (z.B. "Berlin-Mitte") für unsere Statistik.

## Was passiert mit meinem Namen?

| Schritt | Was passiert | Wo |
|---------|--------------|-----|
| Du schreibst deinen Namen | Wird an OpenAI gesendet, um den Brief zu erstellen | Dein Browser → OpenAI (USA) |
| Der Brief wird generiert | Dein Name erscheint im Brief | OpenAI → Dein Browser |
| Du kopierst/sendest den Brief | Der Name ist nur in deinem Browser | Dein Computer |

**Wir speichern deinen Namen nicht.** Er existiert nur:
1. Kurz bei OpenAI (max. 30 Tage, nur für Missbrauchserkennung)
2. In deinem eigenen Browser, bis du ihn löschst

## Was passiert mit meiner persönlichen Geschichte?

Deine Geschichte - das Herzstück des Briefes - wird **niemals bei uns gespeichert**.

- ❌ Keine Datenbank mit euren Geschichten
- ❌ Keine Logs eurer persönlichen Erfahrungen
- ❌ Keine Möglichkeit für uns, eure Geschichten zu lesen

Der einzige Ort, an dem deine Geschichte existiert:
1. Kurz bei OpenAI während der Generierung
2. In deinem Browser, nachdem der Brief erstellt wurde

## Was speichern wir wirklich?

Nur **anonyme Statistiken**, um die Wirkung der Kampagne zu messen:

| Was wir speichern | Beispiel | Warum |
|-------------------|----------|-------|
| Name des MdB | "Dr. Anna Müller" | Um zu wissen, welche Abgeordneten kontaktiert wurden |
| Partei | "SPD" | Aggregierte Statistik nach Partei |
| Wahlkreis-Name | "Berlin-Mitte" | Geografische Verteilung |
| Ausgewählte Forderungen | "IRGC-Listung, Sanktionen" | Welche Themen sind am wichtigsten |
| Anonymer Fingerprint | "a7f3b2..." | Um Mehrfachzählungen zu vermeiden |

**Was wir NICHT speichern:**
- ❌ Euer Name
- ❌ Eure Geschichte
- ❌ Der Brieftext
- ❌ Eure E-Mail-Adresse
- ❌ Eure PLZ

## Warum brauchen wir überhaupt einen Namen?

Der Brief muss mit einem Namen unterschrieben sein, damit der MdB weiß, dass ein echter Mensch aus seinem Wahlkreis schreibt. Anonyme Briefe werden oft ignoriert.

**Aber:** Du kannst jeden Namen verwenden, den du möchtest. Wir prüfen ihn nicht.

## Was ist mit OpenAI?

Ja, eure Daten gehen kurz durch OpenAI-Server in den USA. Das ist die größte Schwachstelle, und wir sind ehrlich darüber:

**Risiken:**
- OpenAI speichert API-Anfragen bis zu 30 Tage
- Server stehen in den USA
- Theoretisch könnte die US-Regierung Zugriff verlangen

**Warum wir es trotzdem nutzen:**
- Es gibt keine gute europäische Alternative für diese Qualität
- OpenAI nutzt die Daten nicht für Training (API-Nutzungsbedingungen)
- Die 30-Tage-Speicherung ist nur für Missbrauchserkennung

**Was ihr tun könnt:**
- Verwendet nicht euren vollständigen echten Namen
- Verwendet keine Details, die euch eindeutig identifizieren
- Bearbeitet den Brief vor dem Versenden

## Warum kein Login?

Wir haben bewusst **kein Benutzerkonto-System**:

- ❌ Keine E-Mail-Registrierung
- ❌ Kein Passwort
- ❌ Keine Datenbank mit Nutzer-Identitäten

Je weniger wir über euch wissen, desto weniger kann jemals kompromittiert werden.

## Was ist, wenn die Website gehackt wird?

Selbst bei einem vollständigen Hack unserer Systeme könnte ein Angreifer nur finden:
- Welche MdBs kontaktiert wurden
- Welche Forderungen ausgewählt wurden
- Anonyme Fingerprints (nicht rückverfolgbar)

**Ein Angreifer könnte NICHT finden:**
- Namen von Nutzern
- Persönliche Geschichten
- Brieftexte
- E-Mail-Adressen

## Lokale Speicherung - Was bleibt in eurem Browser?

Alles, was im Browser gespeichert wird, bleibt dort:

| Was | Wo | Wie löschen |
|-----|-----|-------------|
| Generierte Briefe | LocalStorage | Browser-Daten löschen |
| Formular-Entwürfe | LocalStorage | Automatisch nach 24h oder "Verwerfen" klicken |
| Theme/Sprache | Cookie & LocalStorage | Browser-Daten löschen |

Diese Daten verlassen euren Computer nie.

## 🔓 100% Open Source - Prüft uns

Worte sind billig. Deshalb ist dieser gesamte Dienst **vollständig Open Source**:

| Was | Link |
|-----|------|
| **Vollständiger Quellcode** | [github.com/KhademOHAli1/letter-tool](https://github.com/KhademOHAli1/letter-tool) |
| **Diese Seite** | Auch der Code für diese Transparenz-Seite ist öffentlich |
| **Server-Code** | Keine versteckten Backend-Geheimnisse |
| **Datenbank-Schema** | Öffentlich einsehbar in `/supabase/migrations/` |

**Warum das wichtig ist:**
- Jeder Entwickler kann prüfen, was wir wirklich mit euren Daten machen
- Keine versteckten Tracker, keine geheimen Datensammlungen
- Wenn wir lügen würden, könnte es jeder sehen

> **An Entwickler:innen:** Schaut euch den Code an. Macht einen Pull Request, wenn ihr etwas Verdächtiges findet. Wir haben nichts zu verbergen.

## 🛡️ Unsere Versprechen

| Versprechen | Status |
|-------------|--------|
| Keine Speicherung von Namen | ✅ Garantiert |
| Keine Speicherung von Geschichten | ✅ Garantiert |
| Keine Weitergabe an Dritte | ✅ Garantiert |
| Keine Werbung | ✅ Garantiert |
| Keine Tracking-Cookies | ✅ Garantiert |
| Open Source Code | ✅ Öffentlich auf GitHub |
| EU-Server für Statistiken | ✅ Frankfurt, Deutschland |
| Keine Registrierung nötig | ✅ Kein Account-System |

## Noch Fragen?

Wenn ihr weitere Bedenken habt, schreibt uns: [hi@khademohali.me](mailto:hi@khademohali.me)

Wir antworten auf Deutsch, Englisch und Farsi.

---

**می‌دانیم که اعتماد کردن سخت است. به همین دلیل همه چیز شفاف است.**

*Wir wissen, dass Vertrauen schwer ist. Deshalb ist alles transparent.*
