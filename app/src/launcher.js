var Docker = require('dockerode');
var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
var JSONStream = require('JSONStream');
var async = require('async');
var _ = require('underscore');
var util = require('util');
var semver = require("semver");

module.exports = function() {
  var pullImage = function(tag, cb, onProgress) {
    var opts = {
      "authconfig": {
        "username": "",
        "password": ""
      }
    };
    docker.pull(tag, opts, function(err, cmdOutStream) {
      if (err) {
        console.error("err ", err);
        return cb(err);
      } else {
        var parser = JSONStream.parse();
        var output = [];
        var error = null;

        var onStreamEvent = function(evt) {
          console.info("Event ", evt);
          output.push(evt);

          if (evt.error) {
            return onStreamError(evt.error);
          }
          if (onProgress) {
            onProgress(evt);
          }
        };

        var onStreamError = function(err) {
          error = err;
          console.error("pulling  ", tag, " Failed calling callback with error ", err);
          parser.removeListener('root', onStreamEvent);
          parser.removeListener('error', onStreamError);
          parser.removeListener('end', onStreamEnd);
          cb(err);
        };

        var onStreamEnd = function() {
          console.info("pulling  ", tag, " Ended ");
          cb(error, output);
        };

        parser.on('root', onStreamEvent);
        parser.on('error', onStreamError);
        parser.on('end', onStreamEnd);

        cmdOutStream.pipe(parser);
      }
    });
  };

  var pull = function(containerName) {
    return function(callback) {
      console.info("Pulling ", containerName);

      pullImage(containerName, function onCompleted(err, output) {
        if (err) {
          console.error('failed to pull image:', err, " for container ", containerName);
          return callback(err);
        } else {
          console.info('done!', containerName);
          callback(null, "Success");
        }
      }, function onProgress(evt) {
        console.info('pulling progress:', evt);
      });
    };
  };

  var pullAll = function(containers, callback) {
    var pulls = [];
    containers.forEach(function(containerName) {
      pulls.push(pull(containerName));
    });
    async.parallel(pulls, function(err, results) {
      if (!err) {
        console.info("All images pulled");
        callback();
      } else {
        console.info("Error pulling images");
        return callback(err);
      }
    });
  };

  var pullImages = function(containerList) {
    return function(callback) {
      var pulls = [];
      for (var i in containerList) {
        pulls.push(containerList[i].containerName + ":" + containerList[i].containerVersionTag);
      }

      console.info("List of containers to pull:", pulls);
      pullAll(pulls, function(err, results) {
        if (err) {
          return callback(err);
        } else {
          callback(null);
        }
      });
    };
  };

  this.launchContainers = function(containerList) {
    console.log("ContainerList: ", containerList);
    async.series([
      pullImages(containerList),
    ], function(err) {
      if (!err) {
        console.log("Done!");
      } else {
        console.log("Failed to update, err: ", err);
      }
    });
  };
};