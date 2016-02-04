import assert             from 'assert'
import nock               from 'nock'
import { LogScraper }     from '../'
import { createScrapers } from '../'
import services           from './services.json'

// Nock

let _date = "2016-01-18T13:33:06.517910479Z"
let _log  = `${_date} [pid: 58|app: 0|req: 478/1599] 127.0.0.1 () {40 vars in 604 bytes} [Mon Jan 18 14:33:06 2016] GET /login/?next=/index/ => generated 7339 bytes in 8 msecs (HTTP/1.0 200) 1 headers in 59 bytes (1 switches on core 0)`

services.forEach(service => {
    let base = service.uri.split('/')
    nock(new RegExp(base[2]))
        .get(new RegExp(`/${base[3]}/${base[4]}/logs`))
        .reply(200, _log)
})

// Tests

it('will overwrite default config', () => {
    let scraper = new LogScraper({
        interval : 5
    })
    assert(scraper.service.interval == 5)
})

it('supports service spesific configs', () => {
    let scrapers = createScrapers({
        services : {
            "*.mango.api.*" : {
                interval : 30
            }
        }
    }, services)
    scrapers.forEach(scraper => {
        let service = scraper.service
        if (service.name.indexOf('mango.api') > 0)
            assert(service.interval == 30)
        else
            assert(service.interval == 10)
    })
})

it('can start and stop', (done) => {
    let scraper = createScrapers({}, [services[0]])[0] 
    scraper.on('response', (err, res, body) => {
        assert(err == null)
        assert(res.statusCode == 200)
    })
    scraper.on('data', (log) => {
        assert(log == _log)
        assert(scraper.service.lastScrape == parseInt(new Date(_date).getTime() / 1000))
        scraper.stop()
        done()
    })
    scraper.start()
})
