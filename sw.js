/* offline voor de salon-tablets */
const C='capaldi-kids-20261015192351';
const CORE=['./','index.html','css/style.css','js/game.js','assets/capaldi-c.png','assets/capaldi-woord.png','assets/capaldi-logo.png','assets/robotfabriek-robot.png','assets/robotfabriek-woord.png','assets/icon.svg','assets/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 e.respondWith(fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;})
  .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))));});
