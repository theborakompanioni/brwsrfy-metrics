!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.brwsrfyMetrics=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Metrics = _dereq_('./node_modules/metrics/metrics'), 
Report = _dereq_('./node_modules/metrics/reporting/report');

exports.Histogram = Metrics.Histogram;
exports.Meter = Metrics.Meter;
exports.Counter = Metrics.Counter;
exports.Timer = Metrics.Timer;
exports.Report = Report;

},{"./node_modules/metrics/metrics":6,"./node_modules/metrics/reporting/report":9}],2:[function(_dereq_,module,exports){
// From http://eloquentjavascript.net/appendix2.html, 
// licensed under CCv3.0: http://creativecommons.org/licenses/by/3.0/

var utils = _dereq_('./utils')

/* This acts as a ordered binary heap for any serializeable JS object or collection of such objects */
var BinaryHeap = module.exports = function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {

  clone: function() {
    var heap = new BinaryHeap(this.scoreFunction);
    // A little hacky, but effective.
    heap.content = JSON.parse(JSON.stringify(this.content));
    return heap;
  },

  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  peek: function() {
    return this.content[0];
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var len = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < len; i++) {
      if (this.content[i] == node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i != len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node))
            this.bubbleUp(i);
          else
            this.sinkDown(i);
        }
        return true;
      }
    }
    throw new Error("Node not found.");
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n];
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
          parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to move it further.
      else {
        break;
      }
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap != null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};


},{"./utils":3}],3:[function(_dereq_,module,exports){
/*
/*
 * Mix in the properties on an object to another object
 * utils.mixin(target, source, [source,] [source, etc.] [merge-flag]);
 * 'merge' recurses, to merge object sub-properties together instead
 * of just overwriting with the source object.
 */
exports.mixin = (function () {  
  var _mix = function (targ, src, merge) {
    for (var p in src) {
      // Don't copy stuff from the prototype
      if (src.hasOwnProperty(p)) {
        if (merge &&
            // Assumes the source property is an Object you can
            // actually recurse down into
            (typeof src[p] == 'object') &&
            (src[p] !== null) &&
            !(src[p] instanceof Array)) {
          // Create the source property if it doesn't exist
          // TODO: What if it's something weird like a String or Number?
          if (typeof targ[p] == 'undefined') {
            targ[p] = {};
          }
          _mix(targ[p], src[p], merge); // Recurse
        }
        // If it's not a merge-copy, just set and forget
        else {
          targ[p] = src[p];
        }
      }
    }
  };

  return function () {
    var args = Array.prototype.slice.apply(arguments),
        merge = false,
        targ, sources;
    if (args.length > 2) {
      if (typeof args[args.length - 1] == 'boolean') {
        merge = args.pop();
      }
    }
    targ = args.shift();
    sources = args; 
    for (var i = 0, ii = sources.length; i < ii; i++) {
      _mix(targ, sources[i], merge);
    }
    return targ;
  };
})();


},{}],4:[function(_dereq_,module,exports){
/*
*  A simple counter object
*/

/* JavaScript uses double-precision FP for all numeric types.  
 * Perhaps someday we'll have native 64-bit integers that can safely be
 * transported via JSON without additional code, but not today. */
var MAX_COUNTER_VALUE = Math.pow(2, 32); // 4294967296

var Counter = module.exports = function Counter() {
  this.count = 0;
  this.type = 'counter';
}

Counter.prototype.inc = function(val) {
  if (!val) { val = 1; }
  this.count += val;
  // Wrap counter if necessary.
  if (this.count > MAX_COUNTER_VALUE) {
    this.count -= (MAX_COUNTER_VALUE + 1);
  }
}

Counter.prototype.dec = function(val) {
  if (!val) { val = 1; }
  this.count -= val;
  // Prevent counter from being decremented below zero.
  if (this.count < 0) {
    this.count = 0;
  }
}

Counter.prototype.clear = function() {
  this.count = 0;
}

Counter.prototype.printObj = function() {
  return {type: 'counter', count: this.count};
}

},{}],5:[function(_dereq_,module,exports){
var EDS = _dereq_('../stats/exponentially_decaying_sample')
  , UniformSample = _dereq_('../stats/uniform_sample');

var DEFAULT_PERCENTILES = [0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.98, 0.99, 0.999];

/*
* A histogram tracks the distribution of items, given a sample type 
*/
var Histogram = module.exports = function Histogram(sample) {
  this.sample = sample || new EDS(1028, 0.015);
  this.min = null;
  this.max = null;
  this.sum = null;
  // These are for the Welford algorithm for calculating running variance
  // without floating-point doom.
  this.varianceM = null;
  this.varianceS = null;
  this.count = 0;
  this.type = 'histogram';
}

Histogram.prototype.clear = function() {
  this.sample.clear();
  this.min = null;
  this.max = null;
  this.sum = null;
  this.varianceM = null;
  this.varianceS = null;
  this.count = 0;
}

// timestamp param primarily used for testing
Histogram.prototype.update = function(val, timestamp) {
  this.count++;
  this.sample.update(val, timestamp);
  if (this.max === null) {
    this.max = val;
  } else {
    this.max = val > this.max ? val : this.max;
  }
  if (this.min === null) {
    this.min = val;
  } else {
    this.min = val < this.min ? val : this.min;
  }
  this.sum = (this.sum === null) ? val : this.sum + val;
  this.updateVariance(val);
}

Histogram.prototype.updateVariance = function(val) {
  var oldVM = this.varianceM
    , oldVS = this.varianceS;
  if (this.count == 1) {
    this.varianceM = val;
  } else {
    this.varianceM = oldVM + (val - oldVM) / this.count;
    this.varianceS = oldVS + (val - oldVM) * (val - this.varianceM);
  }
}

// Pass an array of percentiles, e.g. [0.5, 0.75, 0.9, 0.99]
Histogram.prototype.percentiles = function(percentiles) {
  if (!percentiles) {
    percentiles = DEFAULT_PERCENTILES;
  }
  var values = this.sample.getValues().map(function(v){ return parseFloat(v);}).sort(function(a,b){ return a-b;})
    , scores = {}
    , percentile
    , pos
    , lower
    , upper;
  for (var i = 0; i < percentiles.length; i++) {
    pos = percentiles[i] * (values.length + 1);
    percentile = percentiles[i];
    if (pos < 1) { scores[percentile] = values[0]; }
    else if (pos >= values.length) { scores[percentile] = values[values.length - 1]; }
    else {
      lower = values[Math.floor(pos) - 1];
      upper = values[Math.ceil(pos) - 1];
      scores[percentile] = lower + (pos - Math.floor(pos)) * (upper - lower);
    }
  }
  return scores;
}

Histogram.prototype.variance = function() {
  return this.count < 1 ? null : this.varianceS / (this.count - 1);
}

Histogram.prototype.mean = function() {
  return this.count == 0 ? null : this.varianceM;
}

Histogram.prototype.stdDev = function() {
  return this.count < 1 ? null : Math.sqrt(this.variance());
}

Histogram.prototype.values = function() {
  return this.sample.getValues();
}

Histogram.prototype.printObj = function() {
  var percentiles = this.percentiles();
  return {
      type: 'histogram'
    , min: this.min
    , max: this.max
    , sum: this.sum
    , variance: this.variance()
    , mean: this.mean()
    , std_dev: this.stdDev()
    , count: this.count
    , median: percentiles[0.5]
    , p75: percentiles[0.75]
    , p95: percentiles[0.95]
    , p99: percentiles[0.99]
    , p999: percentiles[0.999]};
}

module.exports.createExponentialDecayHistogram = function(size, alpha) { return new Histogram(new EDS((size || 1028), (alpha || 0.015))); };
module.exports.createUniformHistogram = function(size) { return new Histogram(new UniformSample((size || 1028))); };
module.exports.DEFAULT_PERCENTILES = DEFAULT_PERCENTILES;

},{"../stats/exponentially_decaying_sample":10,"../stats/uniform_sample":13}],6:[function(_dereq_,module,exports){

exports.Counter = _dereq_('./counter');
exports.Histogram = _dereq_('./histogram');
exports.Meter = _dereq_('./meter');
exports.Timer = _dereq_('./timer');


},{"./counter":4,"./histogram":5,"./meter":7,"./timer":8}],7:[function(_dereq_,module,exports){
var EWMA = _dereq_('../stats/exponentially_weighted_moving_average.js');
/*
*  
*/
var Meter = module.exports = function Meter() {
  this.m1Rate = EWMA.createM1EWMA();
  this.m5Rate = EWMA.createM5EWMA();
  this.m15Rate = EWMA.createM15EWMA();
  this.count = 0;
  this.startTime = (new Date).getTime();
  this.type = 'meter';
}

// Mark the occurence of n events
Meter.prototype.mark = function(n) {
  if (!n) { n = 1; }
  this.count += n;
  this.m1Rate.update(n);
  this.m5Rate.update(n);
  this.m15Rate.update(n);
}

Meter.prototype.rates = function() {
  return {1: this.oneMinuteRate()
      , 5: this.fiveMinuteRate()
      , 15: this.fifteenMinuteRate()
      , mean: this.meanRate()};
}

// Rates are per second
Meter.prototype.fifteenMinuteRate = function() {
  return this.m15Rate.rate();
}

Meter.prototype.fiveMinuteRate = function() {
  return this.m5Rate.rate();
}

Meter.prototype.oneMinuteRate = function() {
  return this.m1Rate.rate();
}

Meter.prototype.meanRate = function() {
  return this.count / ((new Date).getTime() - this.startTime) * 1000;
}

Meter.prototype.printObj = function() {
  return {type: 'meter'
      , count: this.count
      , m1: this.oneMinuteRate()
      , m5: this.fiveMinuteRate()
      , m15: this.fifteenMinuteRate()
      , mean: this.meanRate()
      , unit: 'seconds'};
}

Meter.prototype.tick = function(){
  this.m1Rate.tick();
  this.m5Rate.tick();
  this.m15Rate.tick();
}

},{"../stats/exponentially_weighted_moving_average.js":11}],8:[function(_dereq_,module,exports){
var Meter = _dereq_('./meter');
Histogram = _dereq_('./histogram')
ExponentiallyDecayingSample = _dereq_('../stats/exponentially_decaying_sample');
/*
*  Basically a timer tracks the rate of events and histograms the durations
*/
var Timer = module.exports = function Timer() {
  this.meter = new Meter();
  this.histogram = new Histogram(new ExponentiallyDecayingSample(1028, 0.015));
  this.clear();
  this.type = 'timer';
}

Timer.prototype.update = function(duration) {
  this.histogram.update(duration);
  this.meter.mark();
}

// delegate these to histogram
Timer.prototype.clear = function() { return this.histogram.clear(); }
Timer.prototype.count = function() { return this.histogram.count; }
Timer.prototype.min = function() { return this.histogram.min; }
Timer.prototype.max = function() { return this.histogram.max; }
Timer.prototype.mean = function() { return this.histogram.mean(); }
Timer.prototype.stdDev = function() { return this.histogram.stdDev(); }
Timer.prototype.percentiles = function(percentiles) { return this.histogram.percentiles(percentiles); }
Timer.prototype.values = function() { return this.histogram.values(); }

// delegate these to meter
Timer.prototype.oneMinuteRate = function() { return this.meter.oneMinuteRate(); }
Timer.prototype.fiveMinuteRate = function() { return this.meter.fiveMinuteRate(); }
Timer.prototype.fifteenMinuteRate = function() { return this.meter.fifteenMinuteRate(); }
Timer.prototype.meanRate = function() { return this.meter.meanRate(); }
Timer.prototype.tick = function() { this.meter.tick(); } // primarily for testing

Timer.prototype.printObj = function() {
  return {type: 'timer'
      , duration: this.histogram.printObj()
      , rate: this.meter.printObj()};
}


},{"../stats/exponentially_decaying_sample":10,"./histogram":5,"./meter":7}],9:[function(_dereq_,module,exports){
/**
* trackedMetrics is an object with eventTypes as keys and metrics object as values.
*/

var _evtparse = function (eventName){
  var namespaces = eventName.split('.')
    , name = namespaces.pop()
    , namespace = namespaces.join('.');

  return {
    ns: namespace
  , name: name
  }
}

var Report = module.exports = function (trackedMetrics){
  this.trackedMetrics = trackedMetrics || {};
}

Report.prototype.addMetric = function(eventName, metric) {
  var parts = _evtparse(eventName);

  if (!this.trackedMetrics[parts.ns]) {
    this.trackedMetrics[parts.ns] = {};
  }
  if(!this.trackedMetrics[parts.ns][parts.name]) {
    this.trackedMetrics[parts.ns][parts.name] = metric;
  }
}

Report.prototype.getMetric = function (eventName){
  var parts = _evtparse(eventName);
  if (!this.trackedMetrics[parts.ns]){ return; }
  return this.trackedMetrics[parts.ns][parts.name];
}

Report.prototype.summary = function (){
  var metricsObj = {};
  for (namespace in this.trackedMetrics) {
    metricsObj[namespace] = {};
    for (name in this.trackedMetrics[namespace]) {
      metricsObj[namespace][name] = this.trackedMetrics[namespace][name].printObj();
    }
  }
  return metricsObj;
}

},{}],10:[function(_dereq_,module,exports){
var Sample = _dereq_('./sample')
  , BinaryHeap = _dereq_('../lib/binary_heap');

/*
 *  Take an exponentially decaying sample of size size of all values
 */
var RESCALE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

var ExponentiallyDecayingSample = module.exports = function ExponentiallyDecayingSample(size, alpha) {
  this.limit = size;
  this.alpha = alpha;
  this.clear();
}

ExponentiallyDecayingSample.prototype = new Sample();

// This is a relatively expensive operation
ExponentiallyDecayingSample.prototype.getValues = function() {
  var values = []
    , heap = this.values.clone();
  while(elt = heap.pop()) {
    values.push(elt.val);
  }
  return values;
}

ExponentiallyDecayingSample.prototype.size = function() {
  return this.values.size();
}

ExponentiallyDecayingSample.prototype.newHeap = function() {
  return new BinaryHeap(function(obj){return obj.priority;});
}

ExponentiallyDecayingSample.prototype.now = function() {
  return (new Date()).getTime();
}

ExponentiallyDecayingSample.prototype.tick = function() {
  return this.now() / 1000;
}

ExponentiallyDecayingSample.prototype.clear = function() {
  this.values = this.newHeap();
  this.count = 0;
  this.startTime = this.tick();
  this.nextScaleTime = this.now() + RESCALE_THRESHOLD;
}

/*
* timestamp in milliseconds
*/
ExponentiallyDecayingSample.prototype.update = function(val, timestamp) {
  // Convert timestamp to seconds
  if (timestamp == undefined) {
    timestamp = this.tick();
  } else {
    timestamp = timestamp / 1000;
  }
  var priority = this.weight(timestamp - this.startTime) / Math.random()
    , value = {val: val, priority: priority};
  if (this.count < this.limit) {
    this.count += 1;
    this.values.push(value);
  } else {
    var first = this.values.peek();
    if (first.priority < priority) {
      this.values.push(value);
      this.values.pop();
    }
  }

  if (this.now() > this.nextScaleTime) {
    this.rescale(this.now(), this.nextScaleTime);
  }
}

ExponentiallyDecayingSample.prototype.weight = function(time) {
  return Math.exp(this.alpha * time);
}

// now: parameter primarily used for testing rescales
ExponentiallyDecayingSample.prototype.rescale = function(now) {
  this.nextScaleTime = this.now() + RESCALE_THRESHOLD;
  var oldContent = this.values.content
    , newContent = []
    , elt
    , oldStartTime = this.startTime;
  this.startTime = (now && now / 1000) || this.tick();
  // Downscale every priority by the same factor. Order is unaffected, which is why we're avoiding the cost of popping.
  for(var i = 0; i < oldContent.length; i++) {
    newContent.push({val: oldContent[i].val, priority: oldContent[i].priority * Math.exp(-this.alpha * (this.startTime - oldStartTime))});
  }
  this.values.content = newContent;
}

},{"../lib/binary_heap":2,"./sample":12}],11:[function(_dereq_,module,exports){
/*
 *  Exponentially weighted moving average.
 *  Args: 
 *  - alpha:
 *  - interval: time in milliseconds
 */

var M1_ALPHA = 1 - Math.exp(-5/60);
var M5_ALPHA = 1 - Math.exp(-5/60/5);
var M15_ALPHA = 1 - Math.exp(-5/60/15);

var ExponentiallyWeightedMovingAverage = EWMA = module.exports = function ExponentiallyWeightedMovingAverage(alpha, interval) {
  var self = this;
  this.alpha = alpha;
  this.interval = interval || 5000;
  this.initialized = false;
  this.currentRate = 0.0;
  this.uncounted = 0;
  if (interval) {
    this.tickInterval = setInterval(function(){ self.tick(); }, interval);

    // Don't keep the process open if this is the last thing in the event loop.
    if(this.tickInterval.unref && ({}).toString.call(this.tickInterval.unref) === '[object Function]') {
      this.tickInterval.unref();
    }
  }
}

ExponentiallyWeightedMovingAverage.prototype.update = function(n) {
  this.uncounted += (n || 1);
}

/*
 * Update our rate measurements every interval
 */
ExponentiallyWeightedMovingAverage.prototype.tick = function() {
  var  instantRate = this.uncounted / this.interval;
  this.uncounted = 0;
  
  if(this.initialized) {
    this.currentRate += this.alpha * (instantRate - this.currentRate);
  } else {
    this.currentRate = instantRate;
    this.initialized = true;
  }
}

/*
 * Return the rate per second
 */
ExponentiallyWeightedMovingAverage.prototype.rate = function() {
  return this.currentRate * 1000;
}

ExponentiallyWeightedMovingAverage.prototype.stop = function() {
  clearInterval(this.tickInterval);
}

module.exports.createM1EWMA = function(){ return new EWMA(M1_ALPHA, 5000); }
module.exports.createM5EWMA = function(){ return new EWMA(M5_ALPHA, 5000); }
module.exports.createM15EWMA = function(){ return new EWMA(M15_ALPHA, 5000); }

},{}],12:[function(_dereq_,module,exports){
var Sample = module.exports = function Sample() {
  this.values = [];
  this.count = 0;
}
var Sample = module.exports = function Sample() {}
Sample.prototype.init = function(){ this.clear(); }
Sample.prototype.update = function(val){ this.values.push(val); };
Sample.prototype.clear = function(){ this.values = []; this.count = 0; };
Sample.prototype.size = function(){ return this.values.length;};
Sample.prototype.print = function(){console.log(this.values);}
Sample.prototype.getValues = function(){ return this.values; }


},{}],13:[function(_dereq_,module,exports){
var utils = _dereq_('../lib/utils');
var Sample = _dereq_('./sample');

/*
 *  Take a uniform sample of size size for all values
 */
var UniformSample = module.exports = function UniformSample(size) {
  this.limit = size;
  this.count = 0;
  this.init();
}

UniformSample.prototype = new Sample();

UniformSample.prototype.update = function(val) {
  this.count++;
  if (this.size() < this.limit) {
    //console.log("Adding "+val+" to values.");
    this.values.push(val);
  } else {
    var rand = parseInt(Math.random() * this.count);
    if (rand < this.limit) {
      this.values[rand] = val;
    }
  }
}

},{"../lib/utils":3,"./sample":12}]},{},[1])
(1)
});