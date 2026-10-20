/* RoR2 Field Guide offline cache. Opens from the cache first, then fetches a fresh copy in the background so
   updates show up the next time the app is opened. Run progress is stored in the page, never in this cache. */
var CACHE = 'ror2-cf5d5e60b7';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE && k.indexOf('ror2-') === 0; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url); if(url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request, {ignoreSearch:true}).then(function(hit){
      var net = fetch(e.request).then(function(r){ if(r && r.ok) c.put(e.request, r.clone()); return r; }).catch(function(){ return hit; });
      return hit || net;
    });
  }));
});
