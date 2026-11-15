// Le venticinque tappe di «Mappe Silenziose»: titolo del capitolo, una riga tratta dal capitolo,
// e un esercizio costruito sulla pratica che il capitolo racconta. La pagina la scrive strumenti/libri.mjs.
// Formato dell'esercizio: [tipo, intestazione, righe] come nei blocchi :::tipo del taccuino (vedi strumenti/esercizi.mjs).
export const TAPPE = [
  { titolo: 'Il rumore che ci allontana da noi',
    riga: 'Le cinque e un quarto, il mondo tace. Poi, come ogni mattina da anni, l\'errore: allungo la mano verso il comodino e prendo il telefono. Trentasette notifiche.',
    gioco: ['spegni', 'Una piccola insurrezione: spegnile, una alla volta.', `- Le notifiche
- La posta
- I gruppi
- Le notizie
- Lo schermo sul comodino
Mia nonna la chiamava «l'ora del silenzio». Nessuno osava disturbarla.`] },
  { titolo: 'Il tempo dell\'anima',
    riga: 'Venticinque novembre 2020: un incidente mi porta dall\'altra parte della sanità che conosco così bene. In sala d\'attesa il tempo smette di seguire le sue leggi abituali.',
    gioco: ['rallenta', 'La frase corre. Rallenta finché riesci a leggerla.', 'Quando tutto è urgente, niente è davvero importante.'] },
  { titolo: 'Le scelte che ci appartengono davvero',
    riga: 'Una riunione «che non può aspettare», il giorno del compleanno di mio figlio. Da allora mi fermo prima di dire sì: tre respiri, e una domanda. «Questa scelta è mia o di qualcun altro?»',
    gioco: ['scegli', 'Pensa alla prossima richiesta che ti arriva. Che cosa senti?', `- Espansione | È un sì che ti appartiene. Dillo senza fretta.
- Contrazione | Fermati tre respiri prima di rispondere. Forse quel sì non è tuo.
- Niente | Aspetta. Il triage serve a questo: distinguere ciò che è davvero urgente da ciò che può aspettare.`] },
  { titolo: 'L\'intelligenza della lentezza',
    riga: '«Nel mare, se corri, affoghi.» Me lo disse mio nonno una mattina d\'estate. Avevo otto anni e una gran fretta di uscire in barca.',
    gioco: ['cancella', 'Tre «non adesso». Togli quello che può aspettare.', `- Il messaggio che può aspettare
- La richiesta che non è davvero urgente
- L'ennesima attività in un tempo già pieno
- La risposta data di corsa
Ne hai tolte {n}. «Non adesso» si può dire senza sensi di colpa.`] },
  { titolo: 'Il silenzio: la prima frontiera',
    riga: 'Agosto 2023, due settimane da solo in casa. Il silenzio che avevo tanto desiderato si rivelò una presenza densa, quasi fisica, che sembrava osservarmi.',
    gioco: ['respiro', '60 | Un micromomento di silenzio: un minuto, senza schermo.', 'Tre respiri in ascensore, senza guardare lo schermo. Sono frammenti minuscoli, ma sommati cambiano tutto il resto.'] },
  { titolo: 'L\'ascolto profondo',
    riga: 'Il signor Martinelli sorrideva sempre. «Tutto bene», ripeteva. Qualcosa non mi quadrava: mi avvicinai e abbassai la maschera chirurgica, perché potesse vedere il mio viso.',
    gioco: ['carte', 'Quello che si dice, e come viene detto', `- «Va tutto bene» | Detto con una fretta che tradisce l'ansia.
- Un sorriso | Troppo fisso per essere tranquillo.
- Un tono | Troppo controllato per essere sereno.`] },
  { titolo: 'Ritmi naturali, cicli umani',
    riga: 'Le 3:47 della quinta notte consecutiva in sala operatoria. Il corpo mandava segnali d\'allarme che avevo ignorato troppo a lungo, e quella notte presentò il conto.',
    gioco: ['misura', 'Che ora è, adesso, per il tuo corpo? | scarico | pieno di energia', `- 0-3 | È l'ora di fermarsi, non di spingere. Il corpo sa quando deve rallentare.
- 4-7 | Una cosa alla volta, quella che conta di più.
- 8-10 | È la tua ora buona: dalla alla cosa più importante, non alla più urgente.`] },
  { titolo: 'L\'arte della rinuncia consapevole',
    riga: 'Una telefonata, un martedì sera: coordinare tre regioni, stipendio importante, ufficio a Napoli. «L\'opportunità della vita.» Io guardavo i miei figli a tavola.',
    gioco: ['carte', 'Piccole sottrazioni quotidiane: togli una cosa, e guarda che cosa aggiungi', `- Impegni non essenziali | Tempo di qualità
- Rumore | Silenzio
- Cose | Spazio
- Fretta | Presenza`] },
  { titolo: 'Spazi di respiro nel quotidiano',
    riga: 'Un lunedì guardai l\'agenda e mi mancò il respiro: riunioni incatenate dalle 8 alle 18, senza un vuoto. La risposta arrivò davanti alla moka, aspettando che salisse il caffè.',
    gioco: ['tieni', '10 | Aspetta la moka: tieni premuto finché sale il caffè.', 'Quando creo uno spazio tra una riunione e l\'altra, arrivo alla seconda più presente.'] },
  { titolo: 'Abitare l\'invisibile',
    riga: 'All\'alba, sulla soglia della stanza dove dormono i miei figli: una bolla di calore invisibile, tessuta da anni di cure. Non si vedeva, ma era più reale di qualsiasi cosa.',
    gioco: ['conta', '5 | Guardati intorno. Tocca per ogni cosa che c\'è e non si vede: un affetto, un\'atmosfera, un\'assenza.', 'È la geografia dell\'invisibile: non compare su nessuna mappa, e la attraversi ogni giorno.'] },
  { titolo: 'Il valore dell\'attesa',
    riga: '«Il mare ti dice tutto, ma devi sapere aspettare che ti parli.» Mio nonno, sulla banchina del porto, nelle prime ore dell\'alba.',
    gioco: ['tieni', '12 | Aspetta. Qui non succede niente finché non hai aspettato.', '«L\'attesa è come una lente d\'ingrandimento: ti permette di vedere cose che quando vai di fretta non riesci mai a notare.»'] },
  { titolo: 'La cura del vuoto',
    riga: 'C\'è un momento, in ogni addio definitivo, in cui le parole diventano inutili e rimane solo la presenza. La stanza 312, una notte di novembre.',
    gioco: ['domanda', 'C\'è un vuoto che stai cercando di riempire in fretta?', 'Per ora basta dargli un nome.'] },
  { titolo: 'Imparare a sparire per ritrovarsi',
    riga: 'Da solo in casa per due settimane, scoprii il piacere della lentezza non finalizzata a nulla: docce lunghe, caffè bevuti goccia a goccia, passeggiate in giardino senza destinazione.',
    gioco: ['passi', 'Sparire per dieci minuti', `- Metti il telefono in un'altra stanza.
- Non dire a nessuno dove sei.
- Fai una cosa sola, lentamente: un caffè, una doccia, quattro passi.
- Torna.
Sei stato via dieci minuti. Guarda se qualcosa, intanto, è crollato.`] },
  { titolo: 'Essere nel fare: il potere dei gesti lenti',
    riga: 'Una notte di novembre, un codice rosso. Le mani preparavano i farmaci da sole, con la precisione di migliaia di volte. Quella notte finì un\'illusione: che si possa fare bene un lavoro senza esserci completamente.',
    gioco: ['respiro', '45 | Scegli un gesto di ogni giorno (versare l\'acqua, allacciarti le scarpe) e fallo adesso, lentamente.', 'Lo stesso gesto di sempre, ma con te dentro.'] },
  { titolo: 'Domandare senza avere fretta',
    riga: '«Achille, perché sei diventato sindacalista davvero?» Me lo chiese il segretario generale, posando la penna. Non era una domanda da risposta immediata.',
    gioco: ['domanda', 'Perché fai davvero quello che fai?', 'Non la risposta che dai agli altri. Non c\'è fretta: puoi tornarci domani.'] },
  { titolo: 'La bussola della quiete',
    riga: 'Marzo 2020: Padova era diventata una città fantasma, i nostri passi risuonavano in un silenzio irreale. E ogni mattina, dal giardino accanto, appariva Teresa.',
    gioco: ['misura', 'Quanta quiete c\'è in te, adesso? | tempesta | quiete', `- 0-3 | Non decidere niente di importante adesso. Prima la quiete, poi la rotta.
- 4-7 | Si può navigare, una decisione alla volta.
- 8-10 | È il momento buono per la scelta che rimandi: la bussola segna bene.`] },
  { titolo: 'Tecnologia e presenza: un patto possibile',
    riga: 'A cena, mio figlio di sei anni stava raccontando della scuola. Il mio sguardo andò allo schermo per una frazione di secondo. «È più importante quello che dice il telefono o quello che dico io?»',
    gioco: ['scegli', 'Il telefono vibra mentre qualcuno ti parla. Che cosa fai?', `- Guardo solo un attimo | A me è bastata una frazione di secondo perché mio figlio se ne accorgesse.
- Lo giro a faccia in giù | È un segnale gentile: chi ti parla lo vede, e capisce di venire prima.
- Lo lascio in un'altra stanza | È il patto più semplice. A tavola il telefono non c'è.`] },
  { titolo: 'Difendere il proprio tempo',
    riga: '«Non riesco più a riconoscere mia figlia», mi disse Laura, infermiera di terapia intensiva. Cominciammo da un «audit temporale»: scrivere dove va davvero una settimana.',
    gioco: ['misura', 'Quanta parte di ieri è stata davvero tua? | niente | tutta', `- 0-2 | È il punto da cui è partita Laura. Domani segna un'ora sola, e difendila.
- 3-6 | Un margine c'è. Scegli quale ora non sei disposto a cedere.
- 7-10 | Si chiama sovranità sul proprio tempo. Tienila stretta.`] },
  { titolo: 'Mappe emotive per le scelte importanti',
    riga: 'Una domenica d\'ottobre al Prato della Valle: sotto il successo, un\'inquietudine che non riuscivo a decifrare. Cominciai un diario emotivo, quindici minuti ogni sera.',
    gioco: ['carte', 'Il consiglio delle voci interiori: pensa a una scelta, e lascia parlare ogni voce', `- La voce che ha paura | Che cosa teme? Lasciala finire.
- La voce che desidera | Che cosa vuole davvero?
- La voce che protegge | Che cosa non vuole perdere?`] },
  { titolo: 'Il coraggio di essere anacronistici',
    riga: '«Papà, ma perché tu non corri mai?» «Non corro perché non sto scappando da niente.»',
    gioco: ['tieni', '9 | Accendi una candela al posto della lampadina: tieni premuto.', 'Non è più efficiente, ma è più umana.'] },
  { titolo: 'Silenziose rivoluzioni quotidiane',
    riga: 'Anna, infermiera di oncologia, dava a ogni paziente tre secondi di sguardo in più. Tre secondi per i trenta pazienti del turno: un minuto e mezzo al giorno.',
    gioco: ['conta', '3 | Pensa alla prossima persona che incontri. Tre secondi di sguardo: contali.', 'Tre secondi in cui scegliere se essere efficiente o essere presente.'] },
  { titolo: 'La bellezza del non sapere tutto subito',
    riga: '«Papà, ma come fanno gli alberi a sapere quando devono fare le foglie?» Avrei potuto improvvisare una spiegazione. Quella sera scelsi una strada diversa.',
    gioco: ['scegli', 'Ti fanno una domanda a cui non sai rispondere. Che cosa fai?', `- Improvviso una spiegazione | Suona convincente, e chiude la domanda.
- Dico «non lo so» | È onesto. E lascia la domanda aperta.
- Dico «non lo so, guardiamo insieme» | È quello che abbiamo fatto: una settimana a osservare le gemme che si gonfiavano.`] },
  { titolo: 'Prepararsi a un futuro gentile',
    riga: 'Mio figlio seduto in giardino, immobile, a guardare un germoglio. La gentilezza, ho capito, non è un sentimento spontaneo: è una pratica, e chiede costanza.',
    gioco: ['passi', 'Un gesto gentile, oggi', `- Pensa a una persona che oggi non se lo aspetta.
- Scegli un gesto piccolo: un grazie detto bene, una porta tenuta, un messaggio.
- Fallo senza dirlo a nessuno.
La gentilezza trasforma chi la esercita ancora prima di trasformare il mondo intorno.`] },
  { titolo: 'Il telescopio che aspetta',
    riga: 'Il telescopio arrivò per il mio compleanno: «Per le notti in cui hai bisogno di vedere lontano». Ogni sera, prima di rientrare, Andrea alza la manina verso il cielo.',
    gioco: ['conta', '7 | Accendi le stelle, una alla volta.', '«Ciao stelle.»'] },
  { titolo: 'Disegnare la propria mappa del domani',
    riga: 'Una mappa del tesoro disegnata con i pastelli. «Cos\'è il tesoro?» «Non lo so ancora. Lo scoprirò quando arriverò lì.»',
    gioco: ['domanda', 'Dove metti la X sulla tua mappa?', 'Non un posto: un modo di essere che puoi praticare già oggi.'] },
];
