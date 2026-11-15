// Gli esercizi interattivi di La Parola Giusta: da un blocco di testo all'HTML.
// Li usano il taccuino (strumenti/blog.mjs) e le pagine dei libri (strumenti/libri.mjs);
// il comportamento sta in js/sito.js, funzione esercizi(). Senza JavaScript restano testo leggibile.
//
//   :::scegli Domanda             - Risposta possibile | Che cosa succede se scegli questa
//   :::carte Titolo               - Davanti | Dietro
//   :::misura Domanda | da | a    - 0-3 | Testo per chi sta tra 0 e 3
//   :::domanda La domanda         (riga libera: una nota sotto il campo dove scrivere)
//   :::respiro 60 | Invito        (riga libera: la frase che compare alla fine)
//   :::tieni 8 | Invito           (riga libera: la frase che si rivela tenendo premuto)
//   :::conta 5 | Invito           (riga libera: la frase finale, dopo cinque tocchi)
//   :::rallenta Invito            (riga libera: la frase che corre finche' non rallenti)
//   :::spegni Titolo              - Una cosa da spegnere        (riga libera: frase finale)
//   :::cancella Titolo            - Una cosa da togliere        (riga libera: frase finale, {n} = quante)
//   :::passi Titolo               - Un passo alla volta         (riga libera: frase finale)
export const NOMI_GIOCO = { scegli: 'Scegli', carte: 'Gira le carte', misura: 'Misurati', domanda: 'Scrivilo', respiro: 'Fermati',
  tieni: 'Tieni premuto', conta: 'Conta', rallenta: 'Rallenta', spegni: 'Spegni', cancella: 'Togli', passi: 'Un passo alla volta' };

export function gioco(tipo, titolo, dentro, riga, esc) {
  if (!NOMI_GIOCO[tipo]) throw new Error('esercizio sconosciuto: ' + tipo);
  const righe = dentro.split('\n').map(r => r.trim()).filter(Boolean);
  const voci = righe.filter(r => /^[-•]\s+/.test(r)).map(r => r.replace(/^[-•]\s+/, '').split('|').map(x => x.trim()));
  const libere = righe.filter(r => !/^[-•]\s+/.test(r));
  const fine = libere.length ? `<p class="gioco-fine">${riga(libere.join(' '))}</p>` : '';
  const apri = (extra = '') => `<div class="gioco g-${tipo}" data-gioco="${tipo}"${extra}><div class="gioco-etichetta">Prova tu · ${NOMI_GIOCO[tipo]}</div>`;
  const tit = t => `<p class="gioco-tit">${riga(t)}</p>`;
  if (tipo === 'scegli' || tipo === 'carte') {
    if (voci.length < 2 || voci.some(v => v.length < 2)) throw new Error(`esercizio "${tipo}": servono almeno due righe "- testo | testo"`);
    return `${apri()}${tit(titolo)}<ul>${voci.map(v => `<li><strong>${riga(v[0])}</strong><span>${riga(v[1])}</span></li>`).join('')}</ul></div>`;
  }
  if (tipo === 'misura') {
    const [dom, da = 'per niente', a = 'moltissimo'] = titolo.split('|').map(x => x.trim());
    const fasce = voci.map(v => { const m = v[0].match(/^(\d+)\s*-\s*(\d+)$/); if (!m || !v[1]) throw new Error('esercizio "misura": righe "- 0-3 | testo"'); return [m[1], m[2], v[1]]; });
    return `${apri(` data-da="${esc(da)}" data-a="${esc(a)}"`)}${tit(dom)}<ul>${fasce.map(f => `<li data-min="${f[0]}" data-max="${f[1]}"><strong>Da ${f[0]} a ${f[1]}</strong><span>${riga(f[2])}</span></li>`).join('')}</ul></div>`;
  }
  if (tipo === 'domanda') return `${apri()}${tit(titolo)}${libere.length ? `<p class="gioco-nota">${riga(libere.join(' '))}</p>` : ''}</div>`;
  if (tipo === 'respiro' || tipo === 'tieni' || tipo === 'conta') {
    const [num, invito = 'Un minuto, senza fare altro.'] = titolo.split('|').map(x => x.trim());
    const n = parseInt(num, 10) || (tipo === 'respiro' ? 60 : tipo === 'tieni' ? 8 : 5);
    return `${apri(tipo === 'conta' ? ` data-n="${n}"` : ` data-secondi="${n}"`)}${tit(invito)}${fine}</div>`;
  }
  if (tipo === 'rallenta') {
    if (!libere.length) throw new Error('esercizio "rallenta": serve la frase da leggere');
    return `${apri()}${tit(titolo)}<p class="gioco-frase">${riga(libere.join(' '))}</p></div>`;
  }
  // spegni, cancella, passi: un elenco di voci e una frase finale
  if (voci.length < 2) throw new Error(`esercizio "${tipo}": servono almeno due righe "- voce"`);
  const lista = tipo === 'passi' ? 'ol' : 'ul';
  return `${apri()}${tit(titolo)}<${lista}>${voci.map(v => `<li><strong>${riga(v[0])}</strong></li>`).join('')}</${lista}>${fine}</div>`;
}
