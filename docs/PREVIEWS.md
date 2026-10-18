# Automatische Vorschau von Pull Requests

Der Workflow `pr-checks.yml` baut jeden Pull Request aus **demselben Repository** ohne Schreibzugriff oder Secrets. Der Workflow `pages.yml` führt ausschließlich den freigegebenen Code auf `main` aus und kopiert die fertigen Dateien der erfolgreichen PR-Builds als **Daten**. Er führt **keine** PR-Buildskripte mit erhöhten Rechten aus.

Website-Hauptversion: `https://BENUTZER.github.io/REPO/`

PR-Vorschau: `https://BENUTZER.github.io/REPO/pr-preview/pr-12/`

Die URLs werden nach erfolgreichem Build mit GitHub Actions erstellt. Eine Kommentar-Automatik fügt den konkreten Vorschaulink im PR hinzu, wenn die Berechtigung `issues:write` verfügbar ist.

## Einmalige Aktivierung

1. GitHub → **Settings → Pages → Source: GitHub Actions**.
2. Actions → **3D Starter – Website und Vorschauen veröffentlichen** → **Run workflow** auf `main`.
3. Beim ersten eigenen PR abwarten, bis der PR-Build und der nachfolgende Pages-Lauf erfolgreich sind.
4. Den Vorschaulink aus dem PR-Kommentar bzw. nach dem URL-Muster öffnen und die Szene tatsächlich ausprobieren.

## Grenzen

- Preview-Artefakte werden nach sieben Tagen gelöscht; bei offen gebliebenen PRs ggf. durch einen neuen Push/Synchronisieren einen aktuellen Build auslösen.
- Der Publisher berücksichtigt die letzten 100 Build-Läufe und maximal zwölf gleichzeitig offene **interne** PRs. Viele PRs können Anpassungen erfordern.
- Wenn der **neueste** Build scheitert, wird bewusst keine veraltete Vorschau für diesen PR gezeigt.
- PRs aus Forks werden nicht veröffentlicht. Das schützt gegen ungeprüftes Fremdmaterial.
- Vorschau und Hauptseite liegen auf derselben Web-Origin und sind beide **öffentlich**. Daher nur selbst kontrollierten PR-Code testen, keine Geheimnisse speichern.
- GitHub Pages hat Größen- und Bandbreitengrenzen; viele große 3D-Szenen gleichzeitig können diese erreichen.
- Nicht behaupten, dass Vorschauen funktionieren, bevor GitHub Actions mindestens eine vollständige PR-Bereitstellung erfolgreich abgeschlossen hat.
