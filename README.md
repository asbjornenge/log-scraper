# LogScraper

Tiny little log scraper.

## Install

```sh
npm install --save @asbjornenge/log-scaper
```
## Use

```js
import { createScrapers } from 'log-scraper'

let scrapers = createScrapers({},[
    {
        name : 'my-service-1',
        uri  : 'http://my-service-1:8080'
    },
    {
        name : 'my-service-2',
        uri  : 'http://my-docker-host-1:4243/containers/my-service-2'
    }
])

scrapers.forEach(s => s.on('data', dataHandler.bind(undefined, s.service))) 
scrapers.forEach(s => s.on('error', errorHandler)) 
scrapers.forEach(s => s.start())
```

## Changelog

### 1.0.0

* Initial release :tada:
