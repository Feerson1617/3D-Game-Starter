# Fahrplan: von der technischen Demo zum Fotorealismus

**Wichtig:** Eine kleine WebGL-Testwelt ist nicht fotorealistisch. Fotorealismus erfordert qualitativ hochwertige Geometrie, Oberflächentexturen, Animationen, Licht und visuelle Abnahme. Das Modellieren durch Codex allein garantiert ihn nicht.

Vorbereitete Grundlagen in der Vorlage:
- PBR (MeshStandardMaterial, MeshPhysicalMaterial), sRGB-Farbraum, ACES Filmic Tone Mapping.
- Gerichtetes Licht mit Soft Shadows, Hemisphere Light, Umgebungsnebel.
- Maus-/Touch-Orbitkamera, Qualitätsstufen inklusive Schattenauflösung und DPR-Grenzen.
- Modulares System mit `loadGLTF()` und kompatiblem `loadGLB()` für `.glb` und `.gltf` unter `public/models/`; es werden bewusst noch keine fremden Assets mitgeliefert.

Empfohlene künftige Schritte:
1. Reale Referenzen pro Objekt/Art und Maßstab recherchieren; botanische/zoologische Details prüfen.
2. Geometrie und UVs z. B. in **Blender** modellieren, mit glTF/GLB exportieren.
3. Lizenzierte oder selbst erzeugte PBR-Maps für Base Color, Normal, Roughness und ggf. AO einsetzen. **Keine ungeklärten Bildrechte.**
4. Natürliches Verhalten/Animationen mit überprüfbaren physikalischen und biologischen Regeln entwickeln.
5. Vorhandenen `GLTFLoader` nutzen; Instancing, LOD, Kompression und gezielte GPU-Optimierung ergänzen, wenn reale Modelle vorliegen. Keine Tools nur ihrer Existenz wegen installieren.
6. Browser-Screenshots mit Referenzen vergleichen, transparent über Vereinfachungen berichten.
7. **Echtes Safari-iPad** für Bildrate, Speicher und Touch testen; Cloud-Chromium ist kein Ersatz.

Weder externe Grafik-APIs noch lizenzpflichtige Asset-Marktplätze sind vorgesehen. Alle Assets werden entweder eigenständig erzeugt oder anhand ihrer jeweiligen Lizenz dokumentiert.

## Modelle tatsächlich einbinden (für Codex)

```js
// In der bestehenden SceneController-Instanz; keine zweite Render-Schleife anlegen.
const model = await scene.addModel('umgebung/gebaeude.glb', { animation: 0 });
model.group.position.set(0, 0, -4); // Platzierung bleibt von Modellanimationen getrennt
model.group.scale.setScalar(1);  // Konvention: ein Meter pro Three.js-Einheit
model.play('Idle');             // vorhandenen Clip wählen; keine erfundene Animation
// Beim Entfernen aus der Spielwelt:
scene.removeModel(model);
```

`addModel()` lädt den Loader erst bei Bedarf, übernimmt Mesh-Schatten, spielt einen vorhandenen Clip ab und aktualisiert AnimationMixer zeitbasiert. `removeModel()` beendet Animationen und gibt Geometrien, Materialien, Texturen, ImageBitmaps und Skelette frei. Jede Instanz besitzt ihre geladenen Ressourcen. Bei späterem Caching oder Klonen muss deren gemeinsame Lebensdauer separat verwaltet werden.

Bei `.gltf` die zugehörigen `.bin`-Dateien und Texturen mit ihrer Verzeichnisstruktur unter `public/models/` belassen. Der Loader erhält die eingebetteten PBR-Einstellungen, Textur-Farbräume, UVs und Animationen. Für manuell angelegte Materialien: Base Color und Emissive als sRGB; Normal-, Roughness-, Metalness- und AO-Daten ohne sRGB-Umwandlung. Die vorhandenen prozeduralen Texturen sind nur Demonstrationsmaterial.

Draco-, Meshopt- oder KTX2-komprimierte Assets benötigen passende Decoder. Dafür akzeptieren `loadGLTF()` und `addModel()` die Option `configureLoader(loader)`. Decoder ausschließlich lokal mitliefern und ihre Lizenz dokumentieren; bei KTX2 vor dem Laden `detectSupport(scene.renderer)` aufrufen. Sie sind **nicht automatisch installiert oder getestet**. Keine Decoder-CDNs ergänzen.

## Realistische Beleuchtung und iPad-Grenzen

Die Demo besitzt gerichtetes Licht, Hemisphere Light, ACES-Tonemapping und Schatten. Eine HDR-Umgebungsbeleuchtung (IBL) ist noch nicht enthalten. Für realistische Metallreflexionen und konsistente Oberflächenbeleuchtung projektspezifisch eine lizenzierte lokale Umgebung über Three.js `PMREMGenerator` vorbereiten und `scene.scene.environment` zuweisen. Zugehörige Texturen und RenderTargets beim Szenenwechsel wieder freigeben. Gebackenes Licht ist für stationäre Umgebungen auf schwächeren iPads oft geeigneter als viele dynamische Schattenlichter.

| Stufe | Maximales Pixelverhältnis | Schattenkarte |
| --- | --- | --- |
| Sparsam | 1 | deaktiviert |
| Ausgewogen | 1,5 | 1024 × 1024 |
| Hoch | 2 | 2048 × 2048 |

Antialiasing wird beim Erstellen des WebGL-Kontexts festgelegt; die laufende Qualitätsauswahl verändert DPR und Schatten. Der Hardware-Hinweis für die Startstufe ist keine zuverlässige Geräteklassifizierung. Bei Problemen zuerst „Sparsam“ wählen. Verdeckte Tabs werden nicht weiter gezeichnet; nach Grafik-Kontextverlust wird die Wiederherstellung angezeigt.

Für ein neues Spiel zunächst ein repräsentatives Modell auf dem ältesten tatsächlich verwendeten iPad messen. Texturauflösung, gleichzeitig sichtbare Objekte, Schatten und transparente Flächen danach budgetieren. Downloadgröße allein sagt wenig über GPU-Speicher aus. Große Welten brauchen projektspezifisch LOD, Instancing und abschnittsweises Laden. Aufwendige Screen-Space-Effekte, mehrere Schattenlichter und Raytracing sind nicht Teil dieser Vorlage. WebGL2 wird vorausgesetzt; ein Chromium- oder WebKit-Test bescheinigt keine reale iPad-Bildrate.

Technische Primärquellen: [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html), [PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html), [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html).
