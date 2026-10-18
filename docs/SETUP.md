# Einrichtung ohne Programmierkenntnisse

Diese Anleitung ist für GitHub im Browser, GitHub Desktop und Codex Cloud ausgelegt; das Terminal ist für die normalen Arbeitsschritte nicht nötig.

## A: Vorlage zum ersten Mal veröffentlichen

1. Auf dem Mac das bereitgestellte ZIP entpacken.
2. Im GitHub-Browser oben rechts **+ → New repository**. Name: `3D-Game-Starter`, Sichtbarkeit: **Public**. Optional README abwählen, da im ZIP vorhanden.
3. In **GitHub Desktop → File → Clone repository → URL** das neue Repository klonen.
4. **Repository → Show in Finder** wählen. Den **Inhalt** des entpackten Starter-Ordners in diesen Repository-Ordner kopieren (inklusive des versteckten Ordners `.github` und der Datei `.gitignore`). Nicht den ZIP-Ordner als Unterordner hineinkopieren.
5. In GitHub Desktop die neuen Dateien committen und auf **Push origin** klicken.
6. Auf GitHub **Settings → General → Template repository** aktivieren. Falls die Option anders angeordnet ist, nach `Template repository` suchen.
7. **Settings → Pages → Build and deployment → Source: GitHub Actions** auswählen.
8. Unter **Actions** den Workflow **3D Starter – Website und Vorschauen veröffentlichen** öffnen und **Run workflow** auf `main` auswählen.
9. Beide Jobs beziehungsweise die Veröffentlichung auf grün prüfen und die veröffentlichte URL ausprobieren.
10. Für einen Funktionstest einen kleinen neuen Branch mit Textänderung erstellen, einen PR öffnen und dessen Vorschau-Link nach erfolgreichem Durchlauf testen. Erst danach ist das Preview-System als bestätigt anzusehen.

**Falls die Dateien `.github` oder `.gitignore` nach dem Entpacken im Finder verborgen sind:** Mit `Cmd + Shift + .` die versteckten Dateien anzeigen. Der `.git`-Ordner von GitHub Desktop darf nicht ersetzt werden.

## B: Neue Spiele aus der Vorlage starten

1. Auf GitHub im fertigen `3D-Game-Starter` auf **Use this template → Create a new repository** klicken.
2. Neuen Namen angeben, z. B. `Wattenmeer-Simulation`, und als Public-Repository erstellen.
3. Unter Settings → Pages → Source GitHub Actions wählen und im Tab Actions den Workflow auf `main` starten.
4. In Codex Cloud das **neue Repository** auswählen. Die veröffentlichte Cloud-Entwicklungsumgebung ggf. zuordnen oder eine passende neue einrichten.
5. Den eigentlichen Spielentwicklungsauftrag an Codex geben. Keine Änderung an der Startervorlage notwendig.
6. Codex arbeitet auf einem Branch und stellt einen PR bereit; nach bestandenem PR-Build erscheint ein automatischer Vorschaulink im PR.
7. Vorschau auf Mac/iPad testen. Nur bei Zufriedenheit **Merge pull request** auswählen.

## Wenn Codex bei der Umgebung einrichtet

> Dieses GitHub-Repository nutzt Node.js 22, Vite, Three.js und Playwright. Prüfe zuerst die vorhandenen Werkzeuge, führe nur bei Bedarf `npm install` und `npx playwright install chromium` aus. Teste `npm run check` und einmal den Start der 3D-Vorschau. Erstelle einen `package-lock.json` durch `npm install` und sichere ihn über einen eigenen Branch/PR. Wiederhole keine unnötigen 3D-Gesamttests. Bewahre die `AGENTS.md` und das kostenlose GitHub-Pages-/PR-Vorschausystem.

## Sicherheit und Kosten

Verwende eine **öffentliche** GitHub-Repository-Version für den kostenlosen Pages-/Actions-Workflow. Die Vorschau-URLs sind ebenfalls öffentlich. Keine echten personenbezogenen Daten in Tests hochladen. Die GitHub-Vorschau-Workflows führen Code aus eigenen PRs nur mit read-only-Berechtigungen aus; fremde Fork-PRs erhalten keine automatische Vorschau. Beachte die GitHub-Limits und teste das System nach der Einrichtung.
