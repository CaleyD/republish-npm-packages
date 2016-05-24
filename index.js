'use strict';
var args = require('yargs').argv;
var request = require('request');
var asnc = require('async');
var fs = require('fs');
var npm = new (require('npm-registry-client'))({});

var source = args.source;
var destination = args.destination;
var packageName = args.package;

var packageMetaDataUrl = source + (source[source.length-1] === '/' ? '' : '/') + packageName;

request(packageMetaDataUrl, function(error, response, body) {
  if(!error && response.statusCode === 200) {
    var packageMetaData = JSON.parse(body);

    asnc.each(packageMetaData.versions, function(versionInfo, callback) {
      var filename = getTarballFileName(versionInfo.version);
      var writeStream = fs.createWriteStream(filename);
      request(versionInfo.dist.tarball).
        on('error', function(err) {
          if(callback) { callback(err); callback = null; }
        }).
        pipe(writeStream);
      writeStream.on('close', function() {
        if(callback) { callback(); callback = null; }
      });
    }, function done(err) {
      if(err) {
        console.error(err);
        process.exit(1);
      }

      // publish tarballs to new registry
      // this COULD be done in parallel but there's a bug in ProGet that pins
      //    the most recently published version to @latest
      asnc.eachSeries(packageMetaData.versions, function(versionInfo, callback) {
        npm.publish(destination, {
            metadata: cleanupMetadata(versionInfo),
            access: 'public',
            body: fs.createReadStream(getTarballFileName(versionInfo.version)),
            auth: {
              username: args.username,
              password: args.password,
              email: args.email
            }
          }, callback);
      }, function(err) {
        if(err) {
          console.error(err);
          console.error(JSON.stringify(err));
          process.exit(1);
        }

        // TODO: delete all downloaded tarballs

        console.log('SUCCESS');
      });
    });

  } else {
    console.error('Error getting ' + packageMetaDataUrl + ' - response status code: ' + response.statusCode);
    console.error(error);
    process.exit(1);
  }
});

function getTarballFileName(version) {
  return packageName + '-' + version + '.tgz';
}

function cleanupMetadata(metadata) {
  return {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
    main: metadata.main,
    scripts: metadata.scripts,
    publishConfig: metadata.publishConfig,
    repository: metadata.repository,
    peerDependencies: metadata.peerDependencies,
    readmeFilename: metadata.readmeFilename,
    maintainers: metadata.maintainers
  };
}
