# Dauerhafte Codex-Anweisungen – 3D Game Starter

## Zweck
Dies ist ein **allgemeines, modular aufgebautes Starterprojekt**, kein fertiges Spiel. Ziel sind hochwertige, erweiterbare, browserbasierte Spiele und gegebenenfalls wissenschaftlich fundierte Simulationen. Projektanweisungen neuer Spiele dürfen diese Regeln ergänzen.

## Kosten und Konten (verbindlich)
- Verwende ausschließlich kostenfreie Open-Source-Werkzeuge oder Assets mit geklärter, für eine öffentliche Webseite passender Lizenz.
- Keine neuen Drittanbieter-Konten, keine API-Schlüssel, bezahlten APIs, Credits, Testabos oder Abonnements verlangen. Bestehende GitHub- und ChatGPT/Codex-Konten sind ausgenommen.
- Keine laufzeitabhängigen externen Hosting-, Tracking- oder Cloud-Dienste für das Spiel. Es muss nach dem Build statisch auf GitHub Pages laufen.
- Bibliotheken über npm installieren ist erlaubt; vor neuen Abhängigkeiten ihren konkreten Nutzen, die Lizenz und die iPad-Leistung prüfen. Keine fremden Grafiken ohne Quellen-/Lizenzprüfung übernehmen.

## Qualität, Fotorealismus und Geräte
- **Fotorealistische, naturgetreue 3D-Welten bleiben das langfristige Entwicklungsziel, sofern passend zum konkreten Spiel.** Verwende PBR, passende Beleuchtung, glaubwürdige Materialien, hochwertige legal nutzbare Modelle und realistische Bewegungen, wenn sie den Zielzustand verbessern.
- Verwechsle technisch funktionierende oder prozedurale Demo-Objekte niemals mit erreichtem Fotorealismus. Berichte ehrlich über Grenzen und zeige aussagekräftige Screenshots.
- Nutze die vorhandene Three.js-/Vite-Architektur, statt ohne Grund einen zweiten Renderer einzuführen. Ansonsten dürfen nach Begründung andere dauerhaft kostenlose Werkzeuge eingesetzt werden.
- Berücksichtige Safari auf Schul-iPads, Touch-Eingaben, reduzierte Pixelauflösung, Performance und Grafikqualitätsstufen. Cloud-Chromium ersetzt keinen echten iPad-Test.
- Verwende bei spielbezogenen naturwissenschaftlichen Abläufen prüfbare Regeln, korrekte Einheiten und kennzeichne didaktische Vereinfachungen.

## Architektur
- Erweitere das modulare Projekt schrittweise; keine Komplettneuschreibung ohne expliziten Auftrag.
- Neue Spiellogik in `src/` strukturiert ablegen; Medien nach `public/` oder über Vite-Assets importieren. Erhalte lauffähige Entwicklung, Build und Tests.
- Das projektweite Vite-`base` ist relativ (`./`), damit der Build unter dem üblichen Pages-Pfad und unter `/pr-preview/pr-N/` funktioniert. Keine hardcodierten absoluten Pfade zu Repositorynamen einbauen.
- Speicherstände versionieren und gegen ungültige Daten absichern. Beim Ausbau Migrationen und Kompatibilität bedenken.
- `README.md`, Entwicklungsnotizen und Quellenangaben bei wesentlichen Änderungen aktualisieren.

## Arbeitsweise und Kontingent
- Pro Aufgabe zunächst die konkret relevanten Dateien untersuchen; nicht wiederholt alle Dateien durchsuchen.
- Kleine, prüfbare Umsetzungsschritte. Neue Features zielgerichtet testen, dazu Build und Start-Smoke-Test. Umfangreiche E2E-Gesamtläufe nur bei relevanten Änderungen.
- Sinnvolle Zwischenstände committen und auf GitHub sichern, besonders bei lang dauernden Cloud-Aufgaben und bevor das Kontingent erschöpft ist.
- Für jede Aufgabe einen Branch und Pull Request verwenden, **niemals ungefragt main mergen oder eine öffentliche Version verändern**.
- Beim PR die automatische Browser-Vorschau angeben. Falls die GitHub-API blockiert, den gepushten Branch und den direkten PR-Erstellungslink liefern.
- Änderungen an `.github/workflows/` sicherheitssensibel behandeln. Niemals fremden PR-Code in einem privilegierten `workflow_run`-Job ausführen oder PR-Artefakte ohne Pfadprüfung entpacken.
- Kommuniziere klar auf Deutsch: Änderungen, erfolgreich durchgeführte Prüfungen, fehlende Tests und Grenzen kurz erläutern.
