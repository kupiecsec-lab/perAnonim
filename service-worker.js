const CACHE_NAME = 'peranonim-v9';
const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './polish-dictionary.js',
  './vendor/jszip.min.js',
  './vendor/xlsx.full.min.js',
  './vendor/pdf.min.mjs',
  './vendor/pdf.worker.min.mjs',
  './vendor/fonts/manrope-400-latin.woff2',
  './vendor/fonts/manrope-400-latin-ext.woff2',
  './vendor/fonts/dmmono-400-latin.woff2',
  './vendor/fonts/dmmono-400-latin-ext.woff2',
  './vendor/fonts/dmmono-500-latin.woff2',
  './vendor/fonts/dmmono-500-latin-ext.woff2',
  './vendor/tesseract/tesseract.min.js',
  './vendor/tesseract/worker.min.js',
  './vendor/tesseract/tesseract-core-simd-lstm.wasm.js',
  './vendor/tesseract/tesseract-core-simd-lstm.wasm',
  './vendor/tesseract/tesseract-core-lstm.wasm.js',
  './vendor/tesseract/tesseract-core-lstm.wasm',
  './vendor/tesseract/tesseract-core-simd.wasm.js',
  './vendor/tesseract/tesseract-core-simd.wasm',
  './vendor/tesseract/tesseract-core.wasm.js',
  './vendor/tesseract/tesseract-core.wasm',
  './vendor/tesseract/pol.traineddata'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  })));
});
