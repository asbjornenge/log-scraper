# LogScraper

Tiny little log scraper.

It follows the [docker logs API](https://docs.docker.com/engine/reference/api/docker_remote_api_v1.19/#get-container-logs) and assumes you want both `stdout` and `stderr` and `timestamps`. It uses the `since` parameter to avoid scraping the same logs twice.

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
        uri  : 'http://my-service-1:8080/logs'
    },
    {
        name : 'my-service-2',
        uri  : 'http://my-docker-host-1:4243/containers/my-service-2/logs'
    }
])

scrapers.forEach(s => s.on('data',  dataHandler.bind(undefined, s.service))) 
scrapers.forEach(s => s.on('error', errorHandler)) 
scrapers.forEach(s => s.start())
```

## Changelog

### 1.0.0

* Initial release :tada:
