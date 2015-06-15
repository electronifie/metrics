var debug = require('debug')('metrics');
var timer = require('./lib/timer');

var providers = [];

(function loadProviders () {

  var influxdb;

  try {
    debug('attempting to load metrics-influxdb');
    influxdb = require('metrics-influxdb');
    debug('loaded metrics-influxdb');
    providers.push(influxdb);
  } catch (err) { 
    debug('metrics-influxdb not loaded: %s', err);
  }
  
})();

function applyToAllProviders (args, method) {

  if (typeof args[args.length - 1] === 'function') {

    var cb = args.pop();
    var results = [];

    function accumilate () {
      results.push(arguments[0]);
      if (results.length === providers.length) {
        results = results.filter(function (r) { return r !== undefined && r !== null; });
        cb(results.length ? results : undefined);
      }
    }

    args.push(accumilate);

    providers.forEach(function (p) { 
      p[method].apply(p, args); 
    });

  } else {
    providers.forEach(function (p) { p[method].apply(p, args); });
  }
}

module.exports = {
  decrementCounter: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    applyToAllProviders(args, 'decrementCounter');
  },
  getTimer: function (series, point) {
    return new timer.Timer(series, point);
  },
  getMultiTimer: function () {
    return new timer.MultiTimer();
  },
  incrementCounter: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    applyToAllProviders(args, 'incrementCounter');
  },
  writeGauge: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    applyToAllProviders(args, 'writeGauge');
  },
  writeMultiTimer: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    applyToAllProviders(args, 'writeMultiTimer');
  },
  writeTimer: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    applyToAllProviders(args, 'writeTimer');
  },
  writePoint: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    applyToAllProviders(args, 'writePoint');
  },
  writePoints: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    applyToAllProviders(args, 'writePoints');
  },
};