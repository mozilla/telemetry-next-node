describe('telemetry-js-node', function() {
  var Telemetry = require('./');
  var Promise   = require('promise');
  var assert    = require('assert');

  // Set timeout
  this.timeout(10 * 1000);

  it('should load', function() {
    return new Promise(function(accept) {
      Telemetry.init(accept);
    }).then(function() {
      assert(Telemetry.versions, "No versions method available");
    });
  });

  it('have versions > 0', function() {
    return new Promise(function(accept) {
      Telemetry.init(accept);
    }).then(function() {
      assert(Telemetry.versions().length > 0, "No versions available");
    });
  });

  it('be reloadable', function() {
    var versionFunction = null;
    return new Promise(function(accept) {
      Telemetry.init(accept);
    }).then(function() {
      versionFunction = Telemetry.versions;
      assert(Telemetry.versions, "No versions method available");
      return new Promise(function(accept) {
        Telemetry.init(accept);
      });
    }).then(function() {
      assert(Telemetry.versions, "No versions method available");
      assert(Telemetry.versions !== versionFunction,
             "versions() functions should not be the same");
    });
  });
});