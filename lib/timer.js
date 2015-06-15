function Timer (series, point) {
  this.series = series;
  this.point = point || {};
  this.start = process.hrtime();
}

Timer.prototype.finish = function () {
  
  var diff = process.hrtime(this.start);
  
  if (this.point.value) throw new Error('Timer.finish called twice!');
  
  this.point.value = (diff[0] * 1e3) + (diff[1]/1e6); // millis
};

function MultiTimer () {
  this.point = {};
  this.pointvalue = null;
  this.start = process.hrtime();
}

MultiTimer.prototype.finish = function (series, point) {
  if ( ! point.value) throw new Error('MultiTimer points require a value property');

  this.series = series;
  this.point = point;
  
  var diff = process.hrtime(this.start);
  
  this.pointvalue = (diff[0] * 1e3) + (diff[1]/1e6); // millis
};

module.exports.Timer = Timer;
module.exports.MultiTimer = MultiTimer;