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

  it('can filter()', function() {
    var version = null;
    var measure = null;
    return new Promise(function(accept) {
      Telemetry.init(accept);
    }).then(function() {
      version = Telemetry.versions()[0];
      assert(version, "Should be a version");
      return new Promise(function(accept) {
        return Telemetry.measures(version, accept);
      });
    }).then(function(measures) {
      measure = Object.keys(measures)[0];
      assert(measure, "Should have a measure");
      return new Promise(function(accept) {
        return Telemetry.loadEvolutionOverBuilds(version, measure, accept);
      });
    }).then(function(hgramEvo) {
      var option = hgramEvo.filterOptions()[0];
      assert(option, "Has filter options");
      hgramEvo.filter(option);
    });
  });
});