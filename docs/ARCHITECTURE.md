# Projektarchitektur

- `index.html` Einstieg/semantische Grundoberfläche.
- `src/main.js` Startlogik, UI-Events, Fallback und Speichern.
- `src/style.css` skalierbare Oberfläche einschließlich iPad-Hochformat.
- `src/core/settings.js` Grafikprofile, Versionierung und Zustandseingabevalidierung.
- `src/core/storage.js` abgesicherte lokale Spielstand-Grundlage.
- `src/graphics/SceneController.js` Three.js-Renderer, Kamera, Licht, Touch/Maus, Schatten, Auswahl, Ressourcenlebenszyklus.
- `src/graphics/materials.js` selbst erzeugte Demo-Texturen und PBR-Materialien.
- `src/graphics/world.js` austauschbare Testwelt.
- `src/graphics/assets.js` kostenloser lokaler GLB-Modell-Loader mit sicheren relativen Pfaden.
- `public/models/` glTF/GLB und lizenzierte Modelle; `public/textures/`, `public/images/`, `public/audio/`.
- `tests/unit/` schnelle reine Modell-/Zustandstests mit Node.
- `tests/e2e/` echte Chromium-/emulierte-Touch-Browserläufe mit Playwright.
- `.github/workflows/pr-checks.yml` kompiliert PR-Code mit schreibgeschütztem GitHub-Token; lädt statische Dateien als Artefakt hoch.
- `.github/workflows/pages.yml` baut die von `main` freigegebene Website, lädt die statischen PR-Builds als Daten, packt sie in getrennte Unterordner und veröffentlicht einmalig über GitHub Pages.
- `.github/scripts/assemble_pages.py` entpackt Artefakte mit Pfad-/Größen- und PR-Commitprüfung, **ohne Code aus PRs auszuführen**.

Die Demowelt und ihre Materialien dürfen durch das eigentliche Spiel ersetzt werden. Für neue Systeme `src/game/`, `src/simulation/`, `src/ui/` usw. anlegen. Die Bibliotheken werden lokal via npm eingebunden und beim Build gebündelt; **die öffentliche Seite verwendet keinen externen CDN-Runtime-Dienst**.

Vite erstellt standardmäßig einen relativen Build `base:'./'`, der am Repository-Stamm und unter PR-Vorschaubereichen funktioniert. Künftige dynamische Assetpfade müssen entweder Vite-Imports oder `import.meta.env.BASE_URL` nutzen.
