telemetry.js for node.js
========================

The `telemetry-js-node` module loads `telemetry.js` from `anthony-zhang.me/telemetry-dashboard/v2/telemetry.js`
and make the functions available in node.js, so that telemetry dashboard aggregates can be analyzed server-side.

This version of telemetry-js-node uses Telemetry.js v2, which is built on top of
the v4 Telemetry aggregation pipeline. The original version of the project uses
Telemetry.js v1, which is built on top of the v2 pipeline. Telemetry.js v2 is
not API compabitible with Telemetry.js v1.

**Warning**, this module downloads and **loads Javascript code** via HTTPS
from `anthony-zhang.me/telemetry-dashboard/v2/telemetry.js`.
This **poses a security risk**, do not run this in mission critical places.
Run it somewhere fairly isolated, under docker, a non-privileged user or in a LXC container.
You have been duly warned.

The reasoning behind the decision to load `telemetry.js` dynamically is that the storage
format used server-side is unstable and we will update `telemetry.js` as changes to the
server-side storage format occurs. For this reason, it is a good idea to call the `init`
method occasionally (every day, for example) to account for any changes in the API.

Usage
-----
This module can be used exactly like Telemetry.js v2 in the browser. Below is just a small example.

```js
var Telemetry = require('telemetry-js-node');

// Initialize telemetry.js
Telemetry.init(function() {
  // Find a version
  var version = Telemetry.getVersions()[0];

  // Load measures
  var parts = version.split("/");
  var channel = parts[0], version = parts[1];
  Telemetry.getFilterOptions(channel, version, function(filters) {
    // Print measures available
    console.log("Measures available:");
    filters.metric.forEach(function(measure) {
      console.log(measure);
    });
  });
});
```

**Remark**, until `Telemetry.init(callback)` have executed, this module will
not have other methods than `Telemetry.init`. In the browser these methods will
be available, but they will throw an exception if `Telemetry.init` have not
completed yet. This is a minor difference, that users who don't like trivial
exceptions won't notice.

**Reloading**, just like `telemetry.js` you can reload the version information
by calling `Telemetry.init()` again. This may also help, if server-side data
has been updated (which happens multiple times as day). Further more, this will
also download `telemetry.js` again, hence, potentially loading new code.
This can help if you have long running code using this module, though long
running code using this module is not recommended.

License
-------
The `telemetry-js-node` library is released on the MPL license,
see the `LICENSE` for details.
