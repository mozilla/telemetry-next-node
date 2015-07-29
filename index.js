require('superagent-retry')(require('superagent'));
var request = require('superagent');
var vm      = require('vm');

/** Load and patch telemetry.js v2 for use under node.js */
exports.init = function(cb) {
  request
    .get('https://anthony-zhang.me/telemetry-dashboard/v2/telemetry.js')
    .buffer()
    .end(function(err, res) {
      // Handle errors
      if (err || !res.ok) {
        throw new Error("Failed to load telemetry.js");
      }

      // Load telemetry.js
      vm.runInThisContext(res.text);

      // Patch telemetry.js to work under node.js
      Telemetry.getJSON = function(url, callback, backoff) {
        backoff = backoff === undefined ? 500 : backoff;

        var requestCallbacks = [function(err, res) {
          if (err) {
            callback(null, 0);
          } else if (!res.ok) {
            callback(null, res.status);
          } else {
            var result = JSON.parse(res.text);
            callback(result, null);
          }
        }];
        requestCallbacks._loading = true;
        var pendingRequest = request.get(url).retry(5).buffer().end(function(err, res) { // Make the request for the JSON result
          if (res.status === 503 || res.status === 504 || res.status === 408) { // Service down, try exponential backoff with 8 second upper limit
            backoff = Math.min(backoff * 2, 8000);
            console.log("ERROR STATUS 503 FOR URL " + url + ", RETRYING IN " + backoff / 1000 + " SECONDS")
            setTimeout(function() { Telemetry.getJSON(url, callback, backoff); }, backoff);
          } else {
            requestCallbacks.forEach(function(requestCallback) { requestCallback(err, res); }); // Dispatch callbacks
          }
        });
      }

      // Attach methods to this module
      for (var method in Telemetry) {
        if (method === 'init') {
          continue;
        }
        exports[method] = Telemetry[method];
      }

      // Call cb when original telemetry method is initialize
      Telemetry.init(cb);
    });
};
