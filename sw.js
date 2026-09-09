const CACHE="mealbuzz-v2";
const CORE=["./","./index.html","./menus.html","./map.html","./mess.html","./partner-index.html","./partner-login.html","./register.html","./dashboard.html","./owner-profile.html","./assets/mealbuzz.css","./assets/partner-polish.css","./assets/shared.js","./assets/model.js","./assets/discover.js","./assets/detail.js","./assets/favicon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{})));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const url=new URL(e.request.url);if(url.hostname.includes("supabase.co")||url.pathname.includes("/rest/v1/"))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok&&url.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{})}return r}).catch(()=>caches.match(e.request)))});
