telemetry.js for node.js
========================

The `telemetry-js-node` module loads `telemetry.js` from
`telemetry.mozilla.org/v1/telemetry.js` and make the functions available in
node.js, so that telemetry dashboard aggregates can be analyzed server-side.

**Warning**, this module downloads and **loads Javascript code** from
`telemetry.mozilla.org/v1/telemetry.js`. This **poses a security risk**,
do not run this in mission critical places. Run it somewhere fairly isolated,
under docker, a non-privileged user or in a LXC container. You have been
duly warned.

The reasoning behind the decision to load `telemetry.js` dynamically is that
the storage format used server-side is unstable and we will update
`telemetry.js` as changes to the server-side storage format occurs.

Usage
-----
This module can be used exactly like `telemetry.js`, refer to the official
[documentation](http://telemetry.mozilla.org/docs.html) for details on how
to use it.

```js
var Telemetry = require('telemetry-js-node');

// Initialize telemetry.js
Telemetry.init(function() {
  // Find a version
  var version = Telemetry.versions()[0];

  // Load measures
  Telemetry.measures(version, function(measures) {

    // Print measures available
    console.log("Measures available:");
    Object.keys(measures).forEach(function(measure) {
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
also reload `telemetry.js` from `telemetry.mozilla.org/v1/telemetry.js`, hence,
potentially loading new code. This can help if you have long running code using
this module, though long running code using this module is not recommended.

License
-------
The `telemetry-js-node` library is released on the MPL license,
see the `LICENSE` for details.
