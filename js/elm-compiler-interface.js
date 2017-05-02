var q = require('q');
var btoa = btoa || require('btoa');
var elmBasicCompile = require('../dist/browser-elm-compiler');
var elmPackage = require('./elm-package');
var githubSource = require('./github-source');

var compiler = null;
var compilerPromise = null;

module.exports.init = function() {
    var d = q.defer();

    if (compiler != null) {
        d.resolve(compiler);
        return d.promise;
    }

    if (compilerPromise) {
        return compilerPromise;
    }

    elmBasicCompile.initCompiler(
        function(cbs) {
            var parse = cbs[0];
            var compile = cbs[1];
            var compiler = {
                parse: function(name,source) {
                    var d = q.defer();
                    parse([name,source,d.resolve]);
                    return d.promise;
                },
                compile: function(name,exposed,source,ifaces) {
                    var d = q.defer();
                    compile([name,exposed ? "true" : "false",source,ifaces,d.resolve]);
                    return d.promise;
                }
          	};
            d.resolve(compiler);
        }
    );

    compilerPromise = d.promise;
    return compilerPromise;
}
