require('superagent-retry')(require('superagent'));
var request = require('superagent');
var vm      = require('vm');

/** Load and patch telemetry.js for use under node.js */
exports.init = function(cb) {
  request
    .get('http://telemetry.mozilla.org/v1/telemetry.js')
    .buffer()
    .end(function(err, res) {
      // Handle errors
      if (err || !res.ok) {
        throw new Error("Failed to load telemetry.js");
      }

      // Load telemetry.js
      vm.runInThisContext(res.text);

      // Patch telemetry.js to work under node.js
      Telemetry.getUrl = function(url, cb) {
        request
          .get(url)
          .retry(5)
          .end(function(err, res) {
            // Check for error
            if (err) {
              return cb(err);
            }
            // Check if request is OK
            if (!res.ok) {
              var err = new Error(res.text);
              err.status = res.status;
              return cb(err);
            }
            // Return body
            cb(null, JSON.parse(res.text));
        });
      };

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