
const SHELL_CACHE='app-shell-v2',RUNTIME_CACHE='runtime-v2';
const APP_SHELL=['./','./index.html','/manifest.webmanifest','/icons/icon-144.png','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL_CACHE).then(c=>c.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>!([SHELL_CACHE,RUNTIME_CACHE].includes(k))?caches.delete(k):undefined))));self.clients.claim();});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match('./index.html')));return;}
if(u.pathname.startsWith('/assets/')){e.respondWith(caches.match(r).then(c=>c||fetch(r).then(resp=>{caches.open(RUNTIME_CACHE).then(cache=>cache.put(r,resp.clone()));return resp;}).catch(()=>c)));return;}
if(u.pathname.includes('/v1/stories')){e.respondWith(fetch(r).then(resp=>{caches.open(RUNTIME_CACHE).then(cache=>cache.put(r,resp.clone()));return resp;}).catch(()=>caches.match(r)));return;}});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){}
const t=d.title||'Notifikasi',o={body:d.body||'Ada pembaruan.',icon:d.icon||'/icons/icon-192.png',data:d.data||{}};e.waitUntil(self.registration.showNotification(t,o));});
self.addEventListener('notificationclick',e=>{e.notification.close();const d=e.notification.data||{},url=d.url||(d.storyId?`#/detail/${d.storyId}`:'#/home');e.waitUntil((async()=>{const l=await clients.matchAll({type:'window',includeUncontrolled:true});const c=l[0];if(c){c.postMessage({type:'NAVIGATE',url});return c.focus();}return clients.openWindow(url);})());});
