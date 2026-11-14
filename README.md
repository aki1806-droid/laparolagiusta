# La Parola Giusta

Sito statico di Achille Pagliaro, pubblicato con GitHub Pages
su https://aki1806-droid.github.io/laparolagiusta/

- `index.html` — home: La Parola Giusta (corsi, libri, ebook)
- `achillepagliaro.html` — i libri: Il Volo delle Radici, Mappe Silenziose, Eredità Invisibili
- `laparolagiusta.html` — reindirizzamento alla home, per il vecchio indirizzo
- `biglietto/` — biglietto da visita digitale, separato dal sito: non collegato dalle pagine, fuori dalla sitemap, con noindex

## Stile e script comuni

- `css/sito.css` — font, menu, cieli notturni, pulsanti, piede: lo caricano tutte le pagine
- `css/pagine.css` — componenti di home, ebook, corsi, omaggi, taccuino (la pagina autore ha i suoi)
- `js/sito.js` — menu su telefono, comparse, sezioni interattive (bussola, costellazione, volto, calendario)

## Il taccuino (blog)

Ogni post è un file di testo in `blog/_post/`, chiamato `AAAA-MM-GG-titolo-breve.md`:

```
---
titolo: Tre segnali in otto minuti
data: 2026-11-14
sommario: Una riga che invoglia a leggere.
immagine: img/blog/nome.webp
---
Testo del post, con una riga vuota tra i paragrafi.
```

`immagine` è facoltativa. Nel testo: `## titoletto`, `> citazione`, `- elenco`, `**grassetto**`, `*corsivo*`, `[link](https://…)`.

Per pubblicare un post nuovo: aggiungere il file, poi

```
node strumenti/blog.mjs
```

Lo script riscrive `blog/index.html`, le pagine dei post, `blog/feed.xml`, gli ultimi tre post in home e le voci del blog in `sitemap.xml`. Le pagine dentro `blog/` non vanno modificate a mano: si rigenerano. I post con `esempio: si` servono solo per l'anteprima; `node strumenti/blog.mjs --senza-esempi` li lascia fuori.
