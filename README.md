# Challiot — Website

Statische One-Page-Website für die **Ernst Challiot & Sohn GmbH**, Glaserei in
Mönchengladbach-Rheydt. Kein Build-Tooling, kein Framework — eine HTML-Datei,
ein JS-File, ein Ordner Assets.

## Aufbau

```
index.html            ausgelieferte Seite  (generiert — nicht direkt bearbeiten)
build.mjs             erzeugt index.html aus Challiot.dc.html
Challiot.dc.html      Quell-Artefakt (Markup + Interaktionslogik)
support.js            Runtime des Artefakts (nur für die Vorschau des .dc.html)
assets/site.js        Interaktionen der ausgelieferten Seite (Vanilla-Port)
assets/img/           Sortiments-Bilder (Stockfotos, Unsplash)
assets/brand/         Logo, Hero-Video, Ausstellungs- und Team-Foto
assets/partners/      Logos der Lieferanten für die Laufschrift
```

Das Artefakt `Challiot.dc.html` braucht zur Laufzeit React über `support.js`.
Die ausgelieferte Seite soll das nicht — deshalb packt `build.mjs` `<helmet>`
und `<x-dc>` aus, biegt die Webflow-CDN-Referenzen auf lokale Dateien um, füllt
die Bildplätze und hängt statt der Artefakt-Logik `assets/site.js` an. Dieselben
Interaktionen, ohne Framework.

## Ändern

Inhalte und Layout in `Challiot.dc.html` bearbeiten, dann:

```bash
node build.mjs
```

Das Skript bricht ab, wenn eine erwartete Stelle fehlt (Asset-Referenz,
Sortiments-Zeile, Vorschau-Kasten) — ein stilles Durchrutschen gibt es nicht.

Reines Verhalten (Scroll-Reveals, Menü, FAQ, Sortiments-Vorschau) steht in
`assets/site.js` und wird vom Build nicht angefasst.

## Lokal ansehen

```bash
python -m http.server 8137
```

Dann `http://localhost:8137` öffnen. Ein `file://`-Aufruf reicht nicht, weil
das Hero-Video und die Assets über relative Pfade geladen werden.

## Deployment

GitHub Pages liefert den `main`-Branch aus dem Repo-Root aus. Push auf `main`
genügt; `index.html` ist bereits eingecheckt.

## Bilder

* **Sortiment** (`assets/img/`) — Stockfotos von [Unsplash](https://unsplash.com),
  Unsplash-Lizenz. Platzhalter für echte Projektfotos: sobald eigene Aufnahmen
  vorliegen, die Dateien unter gleichem Namen ersetzen — `build.mjs` verweist
  über `data-pic` auf die Pfade.
* **Marke & Partner** (`assets/brand/`, `assets/partners/`) — aus dem bestehenden
  Webflow-Auftritt übernommen.

## Offen

* Die Footer-Links **Impressum** und **Datenschutz** zeigen noch auf `#`.
  Beides ist für einen gewerblichen deutschen Auftritt Pflicht (§ 5 DDG,
  Art. 13 DSGVO) und muss vor dem Livegang mit echten Inhalten hinterlegt
  werden.
* Das Kontaktformular ist ein `mailto:`-Link, kein Formular mit Serverteil.
