const PREFIX = "V5"
const BASE = location.protocol + '//' + location.host;
const assets = []

self.addEventListener("install", installEvent => {
    self.skipWaiting(); // install direct meme si un ancien tourne
    console.log(`${PREFIX} install`);
    installEvent.waitUntil((async () => {
        const cache = await caches.open(PREFIX);
        await cache.addAll([...assets,"/clock/offline.html"]);
    })()
    );
    console.log(`${PREFIX} install`);    
});
self.addEventListener("activate", installEvent => {
    clients.claim(); // controle la page en cours
    console.log(`${PREFIX} active`);
    installEvent.waitUntil((async()=>{
        const keys = await caches.keys();
        await Promise.all(
            keys.map((key)=> {
                if (!key.includes(PREFIX)) {
                    return caches.delete(key);
                }
            })
        )
    })())     
});

self.addEventListener("fetch", (fetchEvent) => {
    console.log(`${PREFIX} event ${fetchEvent.request.url}, event ${fetchEvent.request.mode}`);
    if (fetchEvent.request.mode == 'navigate'){        
        fetchEvent.respondWith( (async () => {
            try{
                    const preloadResponse = await fetchEvent.preloadResponse;
                    if (preloadResponse) {
                        console.log("return preload", preloadResponse);
                        return preloadResponse;
                    }
                    console.log("return fetch");
                    return await fetch(fetchEvent.request);
                } catch(e){
                    console.log('offline mode detected');
                    const cache = await caches.open(PREFIX);
                    return await caches.match('/clock/offline.html');
                }
            })())
    }
    else {        
        console.log('Fetch other');
        fetchEvent.respondWith( (async () => {
            try{
                    const preloadResponse = await fetchEvent.preloadResponse;
                    if (preloadResponse) {
                        console.log("return preload", preloadResponse);
                        return preloadResponse;
                    }
                    console.log("return other fetch");
                    return await fetch(fetchEvent.request);
                } catch(e){
                    console.log('other offline mode detected');
                    const cache = await caches.open(PREFIX);
                    return await caches.match('/clock/offline.html');
                }
            })())
    }
});
