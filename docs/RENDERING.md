# Fahrplan: von der technischen Demo zum Fotorealismus

**Wichtig:** Eine kleine WebGL-Testwelt ist nicht fotorealistisch. Fotorealismus erfordert qualitativ hochwertige Geometrie, Oberflächentexturen, Animationen, Licht und visuelle Abnahme. Das Modellieren durch Codex allein garantiert ihn nicht.

Vorbereitete Grundlagen in der Vorlage:
- PBR (MeshStandardMaterial, MeshPhysicalMaterial), sRGB-Farbraum, ACES Filmic Tone Mapping.
- Gerichtetes Licht mit Soft Shadows, Hemisphere Light, Umgebungsnebel.
- Maus-/Touch-Orbitkamera, Qualitätsstufen inklusive Schattenauflösung und DPR-Grenzen.
- Modulares System mit `loadGLB()` für lizenzierte `.glb`-Modelle unter `public/models/`; es werden bewusst noch keine fremden Assets mitgeliefert.

Empfohlene künftige Schritte:
1. Reale Referenzen pro Objekt/Art und Maßstab recherchieren; botanische/zoologische Details prüfen.
2. Geometrie und UVs z. B. in **Blender** modellieren, mit glTF/GLB exportieren.
3. Lizenzierte oder selbst erzeugte PBR-Maps für Base Color, Normal, Roughness und ggf. AO einsetzen. **Keine ungeklärten Bildrechte.**
4. Natürliches Verhalten/Animationen mit überprüfbaren physikalischen und biologischen Regeln entwickeln.
5. `GLTFLoader`, Instancing, LOD, Kompression und gezielte GPU-Optimierung ergänzen, wenn reale Modelle vorliegen. Keine Tools nur ihrer Existenz wegen installieren.
6. Browser-Screenshots mit Referenzen vergleichen, transparent über Vereinfachungen berichten.
7. **Echtes Safari-iPad** für Bildrate, Speicher und Touch testen; Cloud-Chromium ist kein Ersatz.

Weder externe Grafik-APIs noch lizenzpflichtige Asset-Marktplätze sind vorgesehen. Alle Assets werden entweder eigenständig erzeugt oder anhand ihrer jeweiligen Lizenz dokumentiert.
