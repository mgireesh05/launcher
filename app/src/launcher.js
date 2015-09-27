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

  var self = this;

  var pullImage = function(tag, cb, onProgress) {

    var opts = {
      "authconfig": {
        "username": "", //add credentials if pulling from a private repo
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

      pullAll(pulls, function(err, results) {
        if (err) {
          return callback(err);
        } else {
          callback();
        }
      });
    };
  };

  var runContainer = function(containerOptions) {

    return function(callback) {

      var createOptions = {};
      createOptions.Env = containerOptions.envVarArray;
      createOptions.Volumes = {};
      createOptions.Volumes[containerOptions.containerMountPath] = {};
      createOptions.ExposedPorts = {};
      createOptions.ExposedPorts[containerOptions.containerPort] = {};

      var startOptions = {};
      startOptions.Binds = [containerOptions.hostMountPath + ":" + containerOptions.containerMountPath];
      startOptions.PortBindings = {};
      startOptions.PortBindings[containerOptions.containerPort] = [{
        "HostPort": containerOptions.hostPort
      }];

      var containerName = containerOptions.containerName + ":" + containerOptions.containerVersionTag;
      console.info("createOptions:", util.inspect(createOptions, false, null));
      console.info("startOptions:", util.inspect(startOptions, false, null));

      docker.run(containerName, null, process.stdout, createOptions, startOptions, function(err, data, container) {
        if (err) {
          console.error("err: ", err);
          callback(err);
        } else {
          console.info("data: ", data);
          console.info("container: ", container);
          callback();
        }
      });
    };
  };

  var runAll = function(containers, callback) {
    var runs = [];

    containers.forEach(function(containerOptions) {
      runs.push(runContainer(containerOptions));
    });

    async.parallel(runs, function(err, results) {
      if (!err) {
        console.info("All containers started");
        callback();
      } else {
        console.info("Error starting containers");
        return callback(err);
      }
    });
  };

  var runContainers = function(containerList) {

    return function(callback) {
      var runs = [];

      for (var i in containerList) {
        runs.push(containerList[i]);
      }

      runAll(runs, function(err, results) {
        if (err) {
          return callback(err);
        } else {
          callback();
        }
      });
    };
  };

  self.launchContainers = function(containerList) {

    async.series([
      pullImages(containerList),
      runContainers(containerList)
    ], function(err) {
      if (!err) {
        console.info("Done!");
      } else {
        console.error("Failed to update, err: ", err);
      }
    });
  };
};