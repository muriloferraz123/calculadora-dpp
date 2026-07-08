var CACHE = 'dpp-v2';
var ARQUIVOS = ['.', 'index.html', 'manifest.json', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

// rede primeiro (para receber atualizações); cache como reserva offline
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var clone = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(r){
        return r || caches.match('index.html');
      });
    })
  );
});
