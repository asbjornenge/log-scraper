"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var request = _interopRequire(require("request"));

var assign = _interopRequire(require("object.assign"));

var minimatch = _interopRequire(require("minimatch"));

var events = _interopRequire(require("events"));

// Defaults

var defaultConfig = {
    interval: 10,
    lastScrape: 0
};

// LogScraper

var LogScraper = (function () {
    function LogScraper(service) {
        var parser = arguments[1] === undefined ? defaultParser : arguments[1];

        _classCallCheck(this, LogScraper);

        this.service = service;
        this.running = false;
        this.parser = parser;
    }

    _prototypeProperties(LogScraper, null, {
        updateAndEmit: {
            value: function updateAndEmit(line) {
                var timestamp = findTimeStamp(line);
                if (!timestamp) {
                    return this.emit("error", "No timestamp found", line);
                }this.service.lastScrape = timestamp;
                this.emit("data", line);
            },
            writable: true,
            configurable: true
        },
        scrape: {
            value: function scrape() {
                var _this = this;

                this.req = request(createRequestUri(this.service.uri, this.service.lastScrape), function (err, res, body) {
                    if (err) return _this.emit("error", err);
                    _this.emit("response", err, res, body);
                    _this.parser(body).forEach(_this.updateAndEmit.bind(_this));
                });
            },
            writable: true,
            configurable: true
        },
        start: {
            value: function start() {
                this.running = setInterval(this.scrape.bind(this), this.service.interval * 1000);
                this.scrape();
            },
            writable: true,
            configurable: true
        },
        stop: {
            value: function stop() {
                this.running = clearInterval(this.running);
            },
            writable: true,
            configurable: true
        }
    });

    return LogScraper;
})();

assign(LogScraper.prototype, events.EventEmitter.prototype);

// Functions

function defaultParser(dump) {
    var lines = dump.split("\n");
    return lines.filter(function (l) {
        return l != "";
    });
}

function findTimeStamp(line) {
    if (!line) {
        return;
    }var match = line.match(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2}).(\d+)Z/);
    if (!match) {
        return;
    }return parseInt(new Date(match[0]).getTime() / 1000);
}

function createRequestUri(uri, since) {
    return "" + uri + "?stdout=1&stderr=1&timestamps=1&since=" + since;
}

function createScrapers(config, services) {
    config = assign({}, defaultConfig, config);
    return services.map(assignServiceConfig.bind(undefined, config)).map(function (service) {
        return new LogScraper(service);
    });
}

function assignServiceConfig(config, service) {
    var relevantConfig = assign({}, {
        interval: config.interval,
        lastScrape: config.lastScrape
    });
    assign(service, relevantConfig);
    var serviceConfig = config.services || {};
    Object.keys(serviceConfig).forEach(function (glob) {
        if (minimatch(service.name, glob)) assign(service, serviceConfig[glob]);
    });
    return service;
}

exports.createScrapers = createScrapers;
exports.findTimeStamp = findTimeStamp;
exports.defaultParser = defaultParser;
exports.LogScraper = LogScraper;
Object.defineProperty(exports, "__esModule", {
    value: true
});

