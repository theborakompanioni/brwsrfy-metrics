var Metrics = require('./node_modules/metrics/metrics'), 
Report = require('./node_modules/metrics/reporting/report');

exports.Histogram = Metrics.Histogram;
exports.Meter = Metrics.Meter;
exports.Counter = Metrics.Counter;
exports.Timer = Metrics.Timer;
exports.Report = Report;
