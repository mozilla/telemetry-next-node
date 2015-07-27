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
      Telemetry.getJSON = function(url, callback) {
        if (Telemetry.CACHE[url] !== undefined) {
          if (Telemetry.CACHE[url] !== null && Telemetry.CACHE[url]._loading) { // Requested but not yet loaded
            var requestCallbacks = Telemetry.CACHE[url];
            requestCallbacks.unshift(function(err, res) {
              if (err) { callback(null, 0); }
              else if (!res.ok) { callback(null, res.status); }
              else { callback(JSON.parse(res.text), null); }
            });
            return;
          } else if ((new Date).getTime() - Telemetry.CACHE_LAST_UPDATED[url] < Telemetry.CACHE_TIMEOUT) { // In cache and hasn't expired
            setTimeout(function() { callback(Telemetry.CACHE[url], Telemetry.CACHE[url] === null ? 404 : null); }, 1);
            return;
          }
        }

        var requestCallbacks = [function(err, res) {
          if (err) {
            delete Telemetry.CACHE[url];
            callback(null, 0);
          } else if (!res.ok) {
            if (res.status === 404) { // Cache the null result if the URL resolves to a resource or missing resource
              Telemetry.CACHE[url] = null; Telemetry.CACHE_LAST_UPDATED[url] = (new Date).getTime();
            } else {
              delete Telemetry.CACHE[url];
            }
            callback(null, res.status);
          } else {
            var result = JSON.parse(res.text);
            Telemetry.CACHE[url] = result; Telemetry.CACHE_LAST_UPDATED[url] = (new Date).getTime();
            callback(result, null);
          }
        }];
        requestCallbacks._loading = true;
        Telemetry.CACHE[url] = requestCallbacks; // Mark the URL as being requested but not yet loaded
        var pendingRequest = request.get(url).retry(5).buffer().end(function(err, res) { // Make the request for the JSON result
          requestCallbacks.forEach(function(requestCallback) { requestCallback(err, res); }); // Dispatch callbacks
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
