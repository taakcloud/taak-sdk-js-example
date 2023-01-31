// eslint-disable-next-line no-restricted-globals
const ignored = self.__WB_MANIFEST

// Your custom service worker code goes here.

const staticCacheName = 'pages-cached-v1'

const filesToCache = []

const dynamicPostfixToCache = [
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.ico',
  '.js',
  '.css',
  '.ttf',
  '.eot',
  '.woff',
  '.woff2',
  '.json',
]

const whiteListHostToCache = [
  'a.tile.openstreetmap.org',
  'b.tile.openstreetmap.org',
  'c.tile.openstreetmap.org',
]

const blackListHostToCache = ['www.google-analytics.com']
// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', (event) => {
  console.log('Attempting to install service worker and cache static assets')
  try {
    // eslint-disable-next-line no-restricted-globals
    if (self.location.hostname === 'taakcloud.com' && !!filesToCache) {
      event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
          return cache.addAll(filesToCache)
        })
      )
    }
  } catch (error) {
    console.log('Cache#addAll failed.', error)
  }
})
// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches
      .match(event.request)
      .then(function (response) {
        if (response) {
          console.log('from cache ', event.request.url)
          return response
        } else {
          return fetch(event.request).then((res) => {
            let hostname = 'localhost'
            try {
              hostname = new URL(event.request.url).hostname
            } catch (ignore) {}
            const postfix =
              event.request.url.indexOf('.') !== -1
                ? event.request.url.substring(event.request.url.lastIndexOf('.'))
                : '.unknow'
            if (
              whiteListHostToCache.includes(hostname) ||
              (dynamicPostfixToCache.includes(postfix) && !blackListHostToCache.includes(hostname))
            ) {
              return caches.open(staticCacheName).then((cache) => {
                cache
                  .add(event.request, res.clone())
                  .then(() => {
                    console.log('cached ', event.request.url)
                  })
                  .catch((e) => {
                    console.log('not cached', event.request.url, e)
                  })
                return res
              })
            } else {
              return res
            }
          })
        }
      })
      .catch((error) => {
        console.log('offline ', event.request.url, error)
      })
  )
})
// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', (event) => {
  console.log('Activating new service worker...')

  const cacheAllowlist = [staticCacheName]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

/*** START PUSH NOTIFICATION ***/

function handlePushEvent(event) {
  const DEFAULT_TAG = 'taakcloud-site'
  return Promise.resolve()
    .then(() => {
      return event.data.json()
    })
    .then((data) => {
      const title = data.notification.title
      const options = data.notification
      if (!options.tag) {
        options.tag = DEFAULT_TAG
      }
      if (!options.icon) {
        options.icon = '/assets/icon/icon.png'
      }
      // eslint-disable-next-line no-undef
      return registration?.showNotification(title, options)
    })
    .catch((err) => {
      console.error('Push event caused an error: ', err)

      const title = 'Message Received'
      const options = {
        body: event.data.text(),
        tag: DEFAULT_TAG,
        icon: '/assets/icon/icon.png',
      }
      // eslint-disable-next-line no-undef
      return registration?.showNotification(title, options)
    })
}
// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', function (event) {
  event.waitUntil(handlePushEvent(event))
})

function openWindow(path) {
  // eslint-disable-next-line no-undef
  return clients?.openWindow(path)
}

// This is here just to highlight the simple version of notification click.
// Normally you would only have one notification click listener.
// eslint-disable-next-line no-restricted-globals
self.addEventListener('notificationclick', function (event) {
  const clickedNotification = event.notification
  clickedNotification.close()

  // Do something as the result of the notification click
  const promiseChain = openWindow('/home')
  event.waitUntil(promiseChain)
})

/*** END PUSH NOTIFICATION ***/
// eslint-disable-next-line no-restricted-globals
self.addEventListener('unhandledrejection', (event) => {
  console.log('UnHandledRejection', event.reason)
})
