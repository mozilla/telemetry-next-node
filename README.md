Telemetry.js v2 for Node
========================

The `telemetry-next-node` module loads `telemetry.js` from `https://anthony-zhang.me/telemetry-dashboard/v2/telemetry.js` and make the functions available in node.js, so that telemetry dashboard aggregates can be analyzed server-side.

**Warning**, this module downloads and **loads Javascript code** from `https://anthony-zhang.me/telemetry-dashboard/v2/telemetry.js` via HTTPS. If security is very important, run this inside an isolated environment such as a Docker container.

For long-running applications, it is recommended that the module be re-initialized every so often in order to obtain new data and account for any aggregate API changes. This can be done by calling `Telemetry.init()` again - see below for details.

Usage
-----

A simple usage example:

```js
var Telemetry = require('telemetry-next-node');

// Initialize library
Telemetry.init(function() {
  var version = Telemetry.getVersions()[0]; // Get the first available version

  // Optain a mapping from filter names to possible values of those filters
  var parts = version.split("/");
  Telemetry.getFilterOptions(parts[0], parts[1], function(filters) {
    console.log("Measures available:");
    filters.metric.forEach(function(measure) {
      console.log(measure);
    });
  });
});
```

Note that until `Telemetry.init(callback)` executes, this module will not have other methods than `Telemetry.init`. In the browser, these methods will be available, but they will throw an exception if `Telemetry.init` has not completed yet. This is a minor difference, but it may show up if testing for the existance of specific methods in the library.

### Reloading

Just like `telemetry.js` in the browser, you can reload version information by calling `Telemetry.init()` again. This also causes the code to be reloaded from `https://anthony-zhang.me/telemetry-dashboard/v2/telemetry.js`. Reloading is necessary in order to get updated information, such as aggregates published after the module has been loaded.

Reloading is necessary for long-running applications to obtain fresh data. An application that does not reload may behave erratically if changes are made to the backend.

License
-------

The `telemetry-next-node` library is released on the MPL license - see `LICENSE` for details.
