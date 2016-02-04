import request   from 'request'
import assign    from 'object.assign'
import minimatch from 'minimatch'
import events    from 'events'

// Defaults

let defaultConfig = {
    interval : 10,
    lastScrape : 0
}

// LogScraper

class LogScraper {
    constructor(service, parser=defaultParser) {
        this.service = service
        this.running = false
        this.parser  = parser
    }
    updateAndEmit(line) {
        let timestamp = findTimeStamp(line)
        if (!timestamp) return this.emit('error', 'No timestamp found', line) 
        this.service.lastScrape = timestamp
        this.emit('data', line)
    }
    scrape() {
        this.req = request(createRequestUri(this.service.uri, this.service.lastScrape), (err, res, body) => {
            if (err) return this.emit('error', err)
            this.emit('response', err, res, body)
            this.parser(body).forEach(this.updateAndEmit.bind(this))
        })
    }
    start() {
        this.running = setInterval(this.scrape.bind(this), this.service.interval*1000)
        this.scrape()
    }
    stop() {
        this.running = clearInterval(this.running) 
    }
}
assign(LogScraper.prototype, events.EventEmitter.prototype)

// Functions

function defaultParser(dump) {
    let lines = dump.split('\n')
    return lines.filter(l => l != '')
}

function findTimeStamp(line) {
        if (!line) return 
        let match = line.match(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2}).(\d+)Z/)
        if (!match) return 
        return parseInt(new Date(match[0]).getTime() / 1000)
}

function createRequestUri(uri, since) {
    return `http://${uri}/logs?stdout=1&stderr=1&timestamps=1&since=${since}`
}

function createScrapers(config, services) {
    config = assign({}, defaultConfig, config)
    return services 
        .map(assignServiceConfig.bind(undefined, config))
        .map(service => { return new LogScraper(service) })
}

function assignServiceConfig(config, service) {
    let relevantConfig = assign({}, {
        interval   : config.interval,
        lastScrape : config.lastScrape
    })
    assign(service, relevantConfig)
    let serviceConfig = config.services || {}
    Object.keys(serviceConfig).forEach(glob => {
        if (minimatch(service.name, glob))
            assign(service, serviceConfig[glob])
    })
    return service
}

export { createScrapers, findTimeStamp, defaultParser, LogScraper }
