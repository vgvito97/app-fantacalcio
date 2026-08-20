// Fa funzionare l'app anche senza rete.
// Alla prima apertura mette da parte i file; dalle volte successive li serve
// da lì, e prova comunque a scaricare una versione aggiornata in sottofondo.
//
// IMPORTANTE: quando carichi una versione nuova dell'app su GitHub, cambia il
// numero qui sotto (da v1 a v2, ecc.). Serve a dire al telefono di buttare via
// la copia vecchia: senza questo, continuerebbe a mostrare la versione salvata.
const VERSIONE = 'fanta-v4';

const FILE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSIONE)
      .then(c => c.addAll(FILE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nomi => Promise.all(nomi.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(salvata => {
      const dallaRete = fetch(e.request).then(risposta => {
        if (risposta && risposta.status === 200 && risposta.type === 'basic') {
          const copia = risposta.clone();
          caches.open(VERSIONE).then(c => c.put(e.request, copia));
        }
        return risposta;
      }).catch(() => salvata);   // offline: uso quella salvata
      return salvata || dallaRete;
    })
  );
});
