var fs = require('fs');
var CodeGen = require('swagger-js-codegen').CodeGen;
var https = require('http');
var path = require('path');

const HOST_URL = ''; // specify host here
const SWAGGER_JSON_SUB_URL = '/api/doc?format=openapi'; // specify swagger here
const OP_SERVICE_FILE_NAME = 'common_service.js'; // specify path of output service resource js file here

/**
 * Gets JSON spec from a given host and path (url)
 * @param host
 * @param path
 * @param callback
 */
function getSpec(host, path, callback) {
  console.log('Calling ', host + path);
  var noProtocolHost = host.match(/[http|https]:\/\/(.+)/)[1];
  var options = {
    host: noProtocolHost,
    path: path
  };
  console.log("## options ##", options);
  var req = https['get'](options, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    }).on('end', function() {
      var data = null;
      var error = null;
      try {
        data = JSON.parse(body);
      } catch (e) {
        error = e;
      }

      callback(data, error);
    });
  });

  req.on('error', function(e) {
    callback(null, e);
  });
}

function handleSwaggerResponse(swagger) {
  var angularjsSourceCode = CodeGen.getAngularCode({
    className: 'CommonSwagger',
    swagger: swagger
  });
  //console.log(angularjsSourceCode);
  fs.writeFileSync(path.join(__dirname, OP_SERVICE_FILE_NAME), angularjsSourceCode);
}

getSpec(HOST_URL, SWAGGER_JSON_SUB_URL, function(swagger, error) {
  if (error) {
    console.log(error);
  } else {
    handleSwaggerResponse(swagger);
  }
});
