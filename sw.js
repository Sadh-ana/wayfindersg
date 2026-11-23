/* WayFinder SG service worker: keeps the site and the help numbers available offline.
   Same-origin files: cache first, refreshed in the background. Fonts and libraries: cached after first use. */
var V='wfsg-v4';
var CORE=['./','index.html','toolkit.html','app.html','privacy.html','terms.html','wf.css','wf.js','landing.js','toolkit.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','404.html'];
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(V).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;
 var u=new URL(r.url);
 var same=u.origin===self.location.origin;
 var cdn=/fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|unpkg\.com/.test(u.hostname);
 if(!same&&!cdn)return;
 e.respondWith(caches.open(V).then(function(c){
  return c.match(r,{ignoreSearch:true}).then(function(hit){
   var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(function(){return hit});
   if(hit)return hit;
   return net.then(function(res){
    if(res)return res;
    if(r.mode==='navigate')return c.match('index.html');
    return res;
   });
  });
 }));
});
