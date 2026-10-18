# 3D Game Starter – kostenlose Vorlage für Browser-Spiele

**Eine wiederverwendbare technische Grundlage, kein fertiges Spiel.** Die hier gezeigte 3D-Testwelt lässt sich später für ein Aquarium, eine Wattenmeer-Simulation oder ein anderes Unterrichtsspiel ersetzen. Deine bestehenden Projekte werden dadurch **nicht** verändert.

## Was enthalten ist

- Three.js: 3D-Szene mit PBR-Materialien, Beleuchtung, Schatten und Kamerasteuerung.
- Maus, Touch, einstellbare Grafikqualität für leistungsfähige Geräte und ältere iPads.
- Ein kleines, versioniertes Speichersystem auf Basis von `localStorage`.
- Struktur für Programme, Modelle, Texturen, Audio und Erweiterungen.
- Schnelltests mit Node und optionale Browser-Tests mit Playwright.
- Kostenloses Hosting mit GitHub Pages und separate Vorschau-URLs für Pull Requests.
- `AGENTS.md` mit Regeln für Codex, wissenschaftliche Korrektheit und Kostenfreiheit.

**Grafikrealismus:** Die vorhandene Testszene nutzt realistische Beleuchtung und Materialgrundlagen, aber nur einfache, selbst erzeugte Demonstrationsmodelle. **Sie ist nicht fotorealistisch.** Detaillierte Modelle und hochwertig lizenzierte Texturen müssen projektspezifisch ergänzt werden. Dafür ist die Architektur vorbereitet.

## Einmalig: aus der Vorlage ein neues Spiel machen

**Wenn dieses Repository bereits als GitHub-Vorlage eingerichtet ist:**
1. In GitHub **Use this template → Create a new repository** auswählen.
2. Einen Namen vergeben, zum Beispiel `Wattenmeer-Simulation`.
3. Das neue Repository in Codex Cloud als Projekt auswählen.
4. **Settings → Pages → Build and deployment → Source: GitHub Actions** aktivieren.
5. Unter **Actions → 3D Starter – Website und Vorschauen veröffentlichen → Run workflow** den ersten Workflow starten. (Je nach GitHub-Berechtigungen muss die Actions-Nutzung zuerst bestätigt werden.)
6. Nach einem grünen Lauf läuft die veröffentlichte Testszene unter `https://BENUTZERNAME.github.io/REPOSITORYNAME/`.
7. Wenn Codex einen neuen Branch und PR erstellt, wird nach bestandenem PR-Build eine eigene Vorschau gebaut und nach erfolgreicher Pages-Aktualisierung im PR kommentiert. Niemals ungeprüft mergen.

**Wenn du die heruntergeladene ZIP-Version verwenden willst:**
1. ZIP auf deinem Mac entpacken.
2. Auf GitHub ein neues, **öffentliches** Repository `3D-Game-Starter` anlegen.
3. Über GitHub Desktop dieses Repository klonen, den **Inhalt** des entpackten Ordners hineinkopieren, Commit und Push ausführen. Alternativ darf Codex die Dateien in das leere Repository übernehmen.
4. Auf GitHub unter **Settings → General → Template repository** als Vorlage markieren.
5. GitHub Pages wie oben aktivieren; zur echten Abnahme den ersten Actions-Lauf und einen Test-PR mit Vorschau prüfen.

## Technische Kommandos (Codex/Entwickler; im Alltag nicht nötig)

Einmalig Node.js 22+ bereitstellen. Danach im Projektordner:

```sh
npm ci
npm run dev
```

Vor dem PR:

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

Das mitgelieferte **`package-lock.json`** sichert reproduzierbare Installationen mit `npm ci`. Für den vollständigen lokalen Browserlauf zunächst `npx playwright install chromium webkit` ausführen; für einen schlanken Chromium-Lauf `npm run test:e2e -- --project=chromium-desktop`. Die stabile Website und die PR-Vorschauen werden mit `base: './'` gebaut, damit dieselben Assets auch unter Unterpfaden korrekt geladen werden.

## Was kostet das?

Alle verwendeten Bibliotheken sind ohne Registrierung und mit offenen Lizenzen nutzbar. GitHub Pages und Standard-GitHub-Actions-Läufe in **öffentlichen** Repositorys sind im üblichen Rahmen kostenfrei. Es werden keine Dritt-APIs, API-Schlüssel, weiteren Konten oder kostenpflichtigen 3D-Assetdienste benötigt. GitHub unterliegt allerdings seinen Größen-/Nutzungsgrenzen; die Ausführung von Codex selbst beansprucht dein vorhandenes Kontingent.

## Dokumentation

- [SETUP – alles ohne Terminal einrichten](docs/SETUP.md)
- [ARCHITEKTUR – welche Datei wofür zuständig ist](docs/ARCHITECTURE.md)
- [GRAFIKQUALITÄT – Weg zu hochwertiger 3D-Grafik](docs/RENDERING.md)
- [ROADMAP – späterer Ausbau](docs/ROADMAP.md)
- [RECHTE – erlaubte Abhängigkeiten und Assets](docs/ASSET-LICENSES.md)
- [VORSCHAUEN – Sicherheit und Grenzen](docs/PREVIEWS.md)
