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
      assert(Telemetry.getVersions, "No versions method available");
    });
  });

  it('have versions > 0', function() {
    return new Promise(function(accept) {
      Telemetry.init(accept);
    }).then(function() {
      assert(Telemetry.getVersions().length > 0, "No versions available");
    });
  });

  it('be reloadable', function() {
    var versionFunction = null;
    return new Promise(function(accept) {
      Telemetry.init(accept);
    }).then(function() {
      versionFunction = Telemetry.getVersions;
      assert(Telemetry.getVersions, "No versions method available");
      return new Promise(function(accept) {
        Telemetry.init(accept);
      });
    }).then(function() {
      assert(Telemetry.getVersions, "No versions method available");
      assert(Telemetry.getVersions !== versionFunction,
             "versions() functions should not be the same");
    });
  });

  it('can filter()', function() {
    var version = "nightly/41";
    var measure = "GC_MS";
    return new Promise(function(accept) {
      Telemetry.init(accept);
    }).then(function() {
      assert(Telemetry.getVersions()[0], "Should be a version");
      return new Promise(function(accept) {
        var parts = version.split("/");
        return Telemetry.getFilterOptions(parts[0], parts[1], accept);
      });
    }).then(function(filters) {
      assert(filters.metric[0], "Should have a measure");
      return new Promise(function(accept) {
        var parts = version.split("/");
        return Telemetry.getEvolution(parts[0], parts[1], measure, {}, false, accept);
      });
    }).then(function(evolutionMap) {
      var evolution = evolutionMap[""];
      assert(evolution.dates, "Has dates");
    });
  });
});