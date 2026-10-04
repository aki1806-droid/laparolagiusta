# Fine del lancio autunnale — da eseguire il 1 novembre 2026

Questa cartella esiste solo sul branch `claude/lancio-novembre`.
**Non va mai portata su `main`**: finirebbe sul sito pubblico e quelle sei
pagine sarebbero raggiungibili con prezzi diversi da quelli in vigore.

## Che cosa c'è qui

Sei pagine già pronte, fornite da Achille Pagliaro il 4 ottobre 2026.
Sono le stesse sei pagine che il lancio autunnale aveva modificato, nella
versione che va in vigore dal 1 novembre.

## Che cosa fanno, rispetto a quello che è online oggi

1. Tolgono la fascia promozionale blu in cima alla pagina (il blocco fra
   i commenti `LANCIO AUTUNNALE: inizio` e `LANCIO AUTUNNALE: fine`).
2. Riportano il prezzo Kindle da **2,99 € a 6,99 €**, in tutti i punti:
   intestazione, scheda formato, scheda di acquisto.
3. Riportano il cartaceo da 7,99 € a **13,00 €**.
4. Tolgono le diciture «Lancio autunnale», «Prezzo di lancio fino al 31/10»
   e la riga dorata sotto le copertine in home.
5. Aggiornano i dati strutturati JSON-LD: l'offerta torna a `6.99`.

Non cambiano nient'altro. In particolare **restano come sono oggi**:
l'acquisto su Amazon al posto del PDF sulle cinque schede, le etichette
«Acquista su Amazon» in home e il box del corso dove c'era.

## Procedura

```sh
git checkout claude/site-certificate-check-o34qy0
git merge --ff-only main
git checkout claude/lancio-novembre -- dal-1-novembre
cp dal-1-novembre/*.html .
rm -rf dal-1-novembre
```

Poi, prima di pubblicare, verificare:

- `grep -rl 'LANCIO AUTUNNALE' *.html` non deve restituire niente;
- `grep -rl '2,99' *.html` non deve restituire niente;
- nessuna pagina deve perdere il contatore (`gc.zgo.at`) né acquisire
  un collegamento a `fonts.googleapis.com`;
- rendere le sei pagine a 1280px e 390px: niente overflow, niente immagini
  rotte, nessun errore JavaScript.

Solo dopo: commit sul branch di lavoro, merge su `main`, push, e controllo
che le pagine online tornino identiche byte per byte a quelle locali.

## Verifiche già fatte il 4 ottobre 2026

Sulle sei pagine di questa cartella, a 1280px e 390px: fascia assente,
nessuna traccia testuale del lancio, nessun `2,99` residuo, nessun overflow,
nessuna immagine rotta, contatore presente, zero errori JavaScript.
JSON-LD: offerta `6.99 EUR`, cinque nodi collegati, nessun riferimento
pendente.

## Due cose rimaste in sospeso, indipendenti da questa sostituzione

- In home i bottoni dicono «Acquista su Amazon» ma puntano alle schede del
  sito, non ad Amazon. Resta così anche dopo il 1 novembre.
- Il piè di pagina dice «Corsi ed ebook venduti tramite Skillplate», che per
  i cinque titoli passati ad Amazon non è più esatto.
