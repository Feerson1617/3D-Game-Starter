# Automatische Vorschau von Pull Requests

Der Workflow `pr-checks.yml` baut jeden Pull Request aus **demselben Repository** ohne Schreibzugriff oder Secrets. Der Workflow `pages.yml` führt ausschließlich den freigegebenen Code auf `main` aus und kopiert die fertigen Dateien der erfolgreichen PR-Builds als **Daten**. Er führt **keine** PR-Buildskripte mit erhöhten Rechten aus.

Website-Hauptversion: `https://BENUTZER.github.io/REPO/`

PR-Vorschau: `https://BENUTZER.github.io/REPO/pr-preview/pr-12/`

Für ein Benutzerseiten-Repository `BENUTZER.github.io` entfällt `/REPO`: Die Vorschau liegt dann unter `https://BENUTZER.github.io/pr-preview/pr-12/`. Eigene Domains sind nicht automatisch in der Kommentar-URL berücksichtigt.

Nach erfolgreichem Build muss auch der Artefakt-Download und die Veröffentlichung erfolgreich sein. Eine Kommentar-Automatik fügt dann den konkreten Vorschaulink im PR hinzu, wenn die Berechtigung `issues:write` verfügbar ist.

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

## Sicherheit und Übertragbarkeit

Der privilegierte Publisher checkt ausschließlich `main` aus. PR-Artefakte werden nie als Buildskripte ausgeführt; ZIP-Pfade, Symlinks, Größen und die PR-Commit-Metadaten werden kontrolliert. Bei Download-Weiterleitungen an andere Hosts wird der GitHub-Token entfernt. Ein geschlossener PR wird beim nächsten Publisher-Lauf nicht mehr aufgenommen; sein `closed`-Ereignis stößt über den abgeschlossenen PR-Workflow diese Aktualisierung an.

Mehrere Vorschauen werden beim Veröffentlichen zusammen mit der Hauptseite neu zusammengesetzt. Keine Vorschau ersetzt die Hauptseite oder einen anderen PR-Ordner. Es gibt weiterhin genau **eine** GitHub-Pages-Veröffentlichung. Ändere in neuen Repositorys weder `base: './'` noch die relativen Assetpfade auf den alten Repositorynamen. Actions-/Pages-Einstellungen werden durch „Use this template“ nicht zuverlässig mitübernommen und müssen im neuen Repository aktiviert werden.

Workflow-Änderungen im PR werden vom vorhandenen Publisher auf `main` absichtlich nicht ausgeführt. Neue Publisher-Sicherheitskorrekturen lassen sich lokal testen; der endgültige Live-Test dieser Änderungen ist erst nach ausdrücklicher Merge-Freigabe und Veröffentlichung möglich.

Seit der technischen Prüfung prüft der PR-Workflow den Download seines eigenen echten Artefakts mit einem Token, der ausschließlich Lesezugriff besitzt. Dieser Integrationstest kontrolliert auch Metadaten und sicheres Entpacken. Der korrigierte Publisher bricht ab, wenn ein aktueller, erfolgreich gebauter auslösender PR trotzdem keine gültige Vorschau erhält. So kann ein fehlender Download nicht mehr unbemerkt zu einem grünen Veröffentlichungsstatus mit einer 404-Vorschau führen.
