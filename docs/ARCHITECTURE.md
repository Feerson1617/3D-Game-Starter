# Projektarchitektur

- `index.html` Einstieg/semantische Grundoberfläche.
- `src/main.js` Startlogik, UI-Events, Fallback und Speichern.
- `src/style.css` skalierbare Oberfläche einschließlich iPad-Hochformat.
- `src/core/settings.js` Grafikprofile, Versionierung und Zustandseingabevalidierung.
- `src/core/storage.js` abgesicherte lokale Spielstand-Grundlage.
- `src/graphics/SceneController.js` Three.js-Renderer, Kamera, Licht, Touch/Maus, Schatten, Auswahl, Ressourcenlebenszyklus.
- `src/graphics/materials.js` selbst erzeugte Demo-Texturen und PBR-Materialien.
- `src/graphics/world.js` austauschbare Testwelt.
- `src/graphics/assets.js` lokaler GLB-/glTF-Loader mit relativen Pfaden und optionaler Decoder-Konfiguration.
- `src/graphics/ModelInstance.js` Modellplatzierung, AnimationMixer und Ressourcenfreigabe.
- `public/models/` glTF/GLB und lizenzierte Modelle; `public/textures/`, `public/images/`, `public/audio/`.
- `tests/unit/` schnelle reine Modell-/Zustandstests mit Node.
- `tests/e2e/` Chromium, emulierte Wisch-/Pinch-Gesten und WebKit mit iPad-Viewport; prüft Kamera, Speicher und texturierte Modellanimationen.
- `.github/workflows/pr-checks.yml` kompiliert PR-Code mit schreibgeschütztem GitHub-Token; lädt statische Dateien als Artefakt hoch.
- `.github/workflows/pages.yml` baut die von `main` freigegebene Website, lädt die statischen PR-Builds als Daten, packt sie in getrennte Unterordner und veröffentlicht einmalig über GitHub Pages.
- `.github/scripts/assemble_pages.py` entpackt Artefakte mit Pfad-/Größen- und PR-Commitprüfung, **ohne Code aus PRs auszuführen**.

Die Demowelt und ihre Materialien dürfen durch das eigentliche Spiel ersetzt werden. Für neue Systeme `src/game/`, `src/simulation/`, `src/ui/` usw. anlegen. Die Bibliotheken werden lokal via npm eingebunden und beim Build gebündelt; **die öffentliche Seite verwendet keinen externen CDN-Runtime-Dienst**.

Vite erstellt standardmäßig einen relativen Build `base:'./'`, der am Repository-Stamm und unter PR-Vorschaubereichen funktioniert. Künftige dynamische Assetpfade müssen entweder Vite-Imports oder `import.meta.env.BASE_URL` nutzen.

## Langfristige Eignung

Three.js mit Vite bleibt eine geeignete, schlanke Grundlage für anspruchsvolle statisch veröffentlichte 3D-Anwendungen. PBR, glTF, Animationen und frei zugängliche Renderer-Schnittstellen erlauben hochwertige Grafik. Die bestehende Szene ist ein Integrationseinstieg, keine fertige Engine für beliebig große Welten.

Für neue Spiele Spiellogik und serialisierbare Daten außerhalb von Meshes halten. Fachliche Simulationen in eigenen Modulen mit festen Zeitschritten, Einheiten und reproduzierbaren Anfangswerten aufbauen; die Render-Schleife zeigt deren Zustand an. Das vorhandene Speicherschema enthält ausschließlich Anzeigeeinstellungen und Kamera. Neue Spielobjekte, Fortschritt, Zustandswechsel und Migrationen müssen dann zum jeweiligen Projekt passen.

Modellanimationen nutzen eine begrenzte Zeitdifferenz; sie ersetzen keine wissenschaftlich genaue Simulation. Streaming, LOD-Strategie, Physik, Navigation, Mehrspieler und umfangreiche Spielmenüs sind nicht vorimplementiert. Solche Systeme erst für einen konkreten Bedarf ergänzen. Öffentliches Pages-Hosting besitzt keinen vertrauenswürdigen Server: Geheimnisse, verbindliche Mehrspielerlogik und serverseitige Spielstände gehören nicht in Browsercode.

Keine zusätzliche Bibliothek wurde für diese Prüfung eingeführt. Das Lockfile fixiert die vorhandenen Abhängigkeiten; Installationen erfolgen mit `npm ci`. Updates gesondert prüfen und committen, statt Builds von wechselnden Paketauflösungen abhängig zu machen.
