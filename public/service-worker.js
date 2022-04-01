const APP_PREFIX = "MobileBudget-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-"+ VERSION;
const FILES_TO_CACHE = ["./index.html", "./css/styles.css", "./js/index.js"];

self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });

      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function (evt) {
  console.log('fetch request : ' + evt.request.url);
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
        .then(response => {
          if (response.status===200) {
            cache.put(evt.request.url, response.clone())
          }
          return response;
        }).catch(err => {
          return cache.match(evt.request);
        })
      }).catch(err => {
        console.log(err);
      })
    )
    return
  }
  evt.respondWith(
    fetch(evt.request).catch(function() {
     return caches.match(evt.request).then(function (request) {
        if (request) {
          console.log('responding with cache : ' + evt.request.url);
          return request;
        } else {
          console.log('file is not cached, fetching : ' + evt.request.url);
          return fetch(evt.request);
        }
      })
    })    
  );
});