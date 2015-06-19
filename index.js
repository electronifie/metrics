var debug = require('debug')('metrics');
var timers = require('./lib/timers');

function Metrics (providers) {
  this.providers = providers || [];
}

Metrics.prototype.applyToProviders = function applyToProviders (args, method) {

  if (typeof args[args.length - 1] === 'function') {

    var cb = args.pop();
    var results = [];

    function accumilate () {
      results.push(arguments[0]);
      if (results.length === this.providers.length) {
        results = results.filter(function (r) { return r !== undefined && r !== null; });
        cb(results.length ? results : undefined);
      }
    }

    args.push(accumilate);

    this.providers.forEach(function (p) {
      if (p[method]) p[method].apply(p, args);
    });

  } else {
    this.providers.forEach(function (p) {
      if (p[method]) p[method].apply(p, args);
    });
  }
};

Metrics.prototype.decrementCounter = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.applyToProviders(args, 'decrementCounter');
};

Metrics.prototype.getTimer = function (series, point) {
  return new timers.Timer(series, point);
};

Metrics.prototype.getMultiTimer = function () {
  return new timers.MultiTimer();
};

Metrics.prototype.incrementCounter = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.applyToProviders(args, 'incrementCounter');
};

Metrics.prototype.only = function (providers) {

  if (! providers instanceof Array) {
    throw new Error('only() accepts an array of metrics provider string names, like [\'influx\',\'reporting\']')
  }

console.log(providers instanceof Array)

  var list = [];
  var self = this;

  providers.forEach(function (p) {
    if (self[p] !== undefined) {
      list.push(self[p]);
    }
  });

  return new Metrics(list);
};

Metrics.prototype.writeGauge = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.applyToProviders(args, 'writeGauge');
};

Metrics.prototype.writeMultiTimer = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var timer = args[0];
  if ( ! timer.finish) {
    args[0] = new timers.MultiTimer(timer.series, timer.point, timer.start);
  }
  this.applyToProviders(args, 'writeMultiTimer');
};

Metrics.prototype.writeTimer = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var timer = args[0];
  if ( ! timer.finish) {
    args[0] = new timers.Timer(timer.series, timer.point, timer.start);
  }
  this.applyToProviders(args, 'writeTimer');
};

Metrics.prototype.writePoint = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.applyToProviders(args, 'writePoint');
};

Metrics.prototype.writePoints = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.applyToProviders(args, 'writePoints');
};

var defaultInstance = new Metrics();

module.exports = defaultInstance;

(function loadProviders () {

  var influx;

  try {
    debug('attempting to load metrics-influxdb');
    defaultInstance.influx = influx = require('metrics-influxdb');
    debug('loaded metrics-influxdb');
    defaultInstance.providers.push(influx);
  } catch (err) {
    debug('metrics-influxdb not loaded: %s', err);
  }

  var reporting;

  try {
    debug('attempting to load metrics-reporting');
    defaultInstance.reporting = reporting = require('metrics-reporting');
    debug('loaded metrics-reporting');
    defaultInstance.providers.push(reporting);
  } catch (err) {
    debug('metrics-reporting not loaded: %s', err);
  }

})();