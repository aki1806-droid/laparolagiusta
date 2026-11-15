// Rende le pagine a due larghezze, cerca i difetti, salva schermate.
// uso: node guarda.mjs <base-url> <dir-uscita> <modo: controlla|schermate> pagina1 pagina2 ...
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
const [,, base, out, modo, ...pagine] = process.argv;
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const p of pagine) for (const [w, h, nome] of [[1280, 860, 'd'], [390, 800, 't']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/gc\.zgo|goatcounter|ERR_|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  pg.on('requestfailed', r => { const u = r.url(); if (u.startsWith(base)) errs.push('non caricato: ' + u.replace(base, '')); });
  pg.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) errs.push(r.status() + ' ' + r.url().replace(base, '')); });
  await pg.goto(base + p, { waitUntil: 'load' });
  await pg.waitForTimeout(1900);
  if (modo === 'schermate') await pg.screenshot({ path: `${out}/${p.replace('.html', '')}-${nome}-1.png` });
  await pg.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 350) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 90)); }
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }); await new Promise(r => setTimeout(r, 400));
  });
  const r = await pg.evaluate(() => ({
    overflow: (() => { window.scrollTo({ left: 500, behavior: 'instant' }); const x = window.scrollX; window.scrollTo({ left: 0, behavior: 'instant' }); return x; })(),
    tagliati: [...document.querySelectorAll('main table, main pre')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 2 && !e.closest('.tabella')).length,
    larghi: [...document.querySelectorAll('body *')].filter(e => { const q = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        return q.width > 0 && (q.right > window.innerWidth + 2 || q.left < -2) && cs.position !== 'fixed' && !e.closest('.salta,.tabella,[style*="-5000px"],[aria-hidden="true"],.nastro,.scaffale,.cielo,.fondo-scritta,.menu,.lanterna,.notte > .cadente,.cadente,.barra'); })
      .slice(0, 5).map(e => e.tagName + '.' + String(e.className).slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().left) + '..' + Math.round(e.getBoundingClientRect().right)),
    rotte: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src').slice(0, 60)),
    nonViste: document.querySelectorAll('.r:not(.visto)').length,
    viste: document.querySelectorAll('.r.visto').length,
    ancore: [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(x => x !== '#' && !document.getElementById(x.slice(1))),
    dup: (() => { const ids = [...document.querySelectorAll('[id]')].map(e => e.id); return [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))]; })(),
    gc: document.querySelectorAll('script[src*="gc.zgo.at"]').length,
    h1: document.querySelectorAll('h1').length,
    menu: !!document.querySelector('.nav-apri') + '/' + (document.querySelector('.nav-apri') ? getComputedStyle(document.querySelector('.nav-apri')).display : '-'),
    alto: document.body.scrollHeight,
  }));
  const guai = [];
  if (r.overflow > 0) guai.push('SBORDA ' + r.overflow + 'px ' + r.larghi.join(' | '));
  else if (r.larghi.length) guai.push('fuori schermo: ' + r.larghi.join(' | '));
  if (r.tagliati) guai.push('TABELLE TAGLIATE ' + r.tagliati);
  if (r.rotte.length) guai.push('IMMAGINI ROTTE ' + r.rotte.join(','));
  if (r.nonViste) guai.push('non comparsi ' + r.nonViste);
  if (r.ancore.length) guai.push('ANCORE MORTE ' + r.ancore.join(','));
  if (r.dup.length) guai.push('ID DOPPI ' + r.dup.join(','));
  if (r.gc !== 1) guai.push('contatore x' + r.gc);
  if (r.h1 !== 1) guai.push('h1 x' + r.h1);
  if (errs.length) guai.push('ERRORI ' + [...new Set(errs)].join(' ; '));
  console.log(`${p.padEnd(34)} ${String(w).padStart(4)}  comparsi ${String(r.viste).padStart(3)}  menu ${r.menu.padEnd(11)} alto ${String(r.alto).padStart(6)}  ${guai.length ? '!! ' + guai.join(' || ') : 'ok'}`);
  if (modo === 'schermate') {
    await pg.screenshot({ path: `${out}/${p.replace('.html', '')}-${nome}-intera.png`, fullPage: true });
  }
  await ctx.close();
}
await b.close();
