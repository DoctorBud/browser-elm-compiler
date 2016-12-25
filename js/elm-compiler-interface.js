var q = require('q');
var XMLHttpRequest = XMLHttpRequest || require('xmlhttprequest').XMLHttpRequest;
var btoa = btoa || require('btoa');
var elmBasicCompile = require('./elm-basic-compile');
var elmPackage = require('./elm-package');
var githubSource = require('./github-source');

var baseURL = 'http://superheterodyne.net/files/';
var compile = { };

var jsprelude = [
  "(function() {",
  "'use strict';",
  "function F2(fun)",
  "{",
  "function wrapper(a) { return function(b) { return fun(a,b); }; }",
  "wrapper.arity = 2;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "",
  "function F3(fun)",
  "{",
  "function wrapper(a) {",
  "return function(b) { return function(c) { return fun(a, b, c); }; };",
  "}",
  "wrapper.arity = 3;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "",
  "function F4(fun)",
  "{",
  "function wrapper(a) { return function(b) { return function(c) {",
  "return function(d) { return fun(a, b, c, d); }; }; };",
  "}",
  "wrapper.arity = 4;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "",
  "function F5(fun)",
  "{",
  "function wrapper(a) { return function(b) { return function(c) {",
  "return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };",
  "}",
  "wrapper.arity = 5;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "",
  "function F6(fun)",
  "{",
  "function wrapper(a) { return function(b) { return function(c) {",
  "return function(d) { return function(e) { return function(f) {",
  "return fun(a, b, c, d, e, f); }; }; }; }; };",
  "}",
  "wrapper.arity = 6;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "",
  "function F7(fun)",
  "{",
  "function wrapper(a) { return function(b) { return function(c) {",
  "return function(d) { return function(e) { return function(f) {",
  "return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };",
  "}",
  "wrapper.arity = 7;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "",
  "function F8(fun)",
  "{",
  "function wrapper(a) { return function(b) { return function(c) {",
  "return function(d) { return function(e) { return function(f) {",
  "return function(g) { return function(h) {",
  "return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };",
  "}",
  "wrapper.arity = 8;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "function F9(fun)",
  "{",
  "function wrapper(a) { return function(b) { return function(c) {",
  "return function(d) { return function(e) { return function(f) {",
  "return function(g) { return function(h) { return function(i) {",
  "return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };",
  "}",
  "wrapper.arity = 9;",
  "wrapper.func = fun;",
  "return wrapper;",
  "}",
  "",
  "function A2(fun, a, b)",
  "{",
  "return fun.arity === 2",
  "? fun.func(a, b)",
  ": fun(a)(b);",
  "}",
  "function A3(fun, a, b, c)",
  "{",
  "return fun.arity === 3",
  "? fun.func(a, b, c)",
  ": fun(a)(b)(c);",
  "}",
  "function A4(fun, a, b, c, d)",
  "{",
  "return fun.arity === 4",
  "? fun.func(a, b, c, d)",
  ": fun(a)(b)(c)(d);",
  "}",
  "function A5(fun, a, b, c, d, e)",
  "{",
  "return fun.arity === 5",
  "? fun.func(a, b, c, d, e)",
  ": fun(a)(b)(c)(d)(e);",
  "}",
  "function A6(fun, a, b, c, d, e, f)",
  "{",
  "return fun.arity === 6",
  "? fun.func(a, b, c, d, e, f)",
  ": fun(a)(b)(c)(d)(e)(f);",
  "}",
  "function A7(fun, a, b, c, d, e, f, g)",
  "{",
  "return fun.arity === 7",
  "? fun.func(a, b, c, d, e, f, g)",
  ": fun(a)(b)(c)(d)(e)(f)(g);",
  "}",
  "function A8(fun, a, b, c, d, e, f, g, h)",
  "{",
  "return fun.arity === 8",
  "? fun.func(a, b, c, d, e, f, g, h)",
  ": fun(a)(b)(c)(d)(e)(f)(g)(h);",
  "}",
  "function A9(fun, a, b, c, d, e, f, g, h, i)",
  "{",
  "return fun.arity === 9",
  "? fun.func(a, b, c, d, e, f, g, h, i)",
  ": fun(a)(b)(c)(d)(e)(f)(g)(h)(i);",
  "}"
];

var footer = [
    "var Elm = {};",
    "Elm['Main'] = Elm['Main'] || {};",
    "_elm_lang$core$Native_Platform.addPublicModule(Elm['Main'], 'Main', typeof _elm_lang$test$Main$main === 'undefined' ? null : _elm_lang$test$Main$main);",
    "",
    "if (typeof define === 'function' && define['amd'])",
    "{",
    "  define([], function() { return Elm; });",
    "  return;",
    "}",
    "",
    "if (typeof module === 'object')",
    "{",
    "  module['exports'] = Elm;",
    "  return;",
    "}",
    "",
    "var globalElm = this['Elm'];",
    "if (typeof globalElm === 'undefined')",
    "{",
    "  this['Elm'] = Elm;",
    "  return;",
    "}",
    "",
    "for (var publicModule in Elm)",
    "{",
    "  if (publicModule in globalElm)",
    "  {",
    "    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');",
    "  }",
    "  globalElm[publicModule] = Elm[publicModule];",
    "}",
    "",
    "}).call(this);"
];

function promiseOneObject(name) {
    var d = q.defer();
    if (name == '') {
        d.resolve('');
        return d.promise;
    }
    var request = new XMLHttpRequest();
    request.addEventListener('error', function() {
        d.resolve('throw "could not load ' +name+ '";');
    });
    request.addEventListener('load', function() {
        d.resolve(request.responseText);
    });
    var fileNameGuess = name;
    var url = baseURL + fileNameGuess;
    request.open('GET', url);
    request.send();
    return d.promise;
}

function textFilesRequest(req) {
    var requests = req[0];
    var loaded = req[1];
    function promiseOneModule(name) {
        return promiseOneObject(name[1]).then(function(text) {
            return [name[0], text];
        });
    }
    q.all(requests.map(promiseOneModule)).then(function(modules) {
        loaded(modules);
    });
}

function binaryFilesRequest(req) {
    var requests = req[0];
    var loaded = req[1];
    function promiseOneModule(name) {
        return promiseOneObject(name[0]).then(function(text) {
            return [name[1], btoa(text)];
        });
    }
    q.all(requests.map(promiseOneModule)).then(function(modules) {
        loaded(modules);
    });
}

module.exports.init = function() {
    var d = q.defer();

    var currentPackage = {
        "version": "1.0.0",
        "summary": "package compiled via ghcjs and javascript",
        "repository": "https://github.com/prozacchiwawa/test.git",
        "license": "BSD3",
        "source-directories": ["src"],
        "exposed-modules": [],
        "dependencies": {"elm-lang/core": "5.0.0 <= v < 6.0.0"},
        "elm-version": "0.18.0 <= v < 0.19.0"
    };
    var packageSpec = {
        user: "prozacchiwawa",
        project: "test",
        version: "1.0.0"
    };
    var ps = new elmPackage.PackageSolver(new githubSource.GithubSource());
    ps.injectPackage(packageSpec, currentPackage);
    ps.fillTree(packageSpec).then(function() {
        return ps.solve(packageSpec);
    }).then(function(exactDeps) {
        var deps = [];
        for (var i in exactDeps) {
            deps.push([i.split('/'),exactDeps[i]]);
        }
        return deps;
    }).then(function(deps) {
        var mods = q.all(
            deps.map(function(nameAndVersion) {
                var packageName = nameAndVersion[0].join('/');
                var data = ps.versions[packageName][nameAndVersion[1]];
                var exposedModules = data['exposed-modules'];
                var modsWithNames = exposedModules.map(function(modName) {
                    return [[nameAndVersion[0], modName.split('.')], nameAndVersion[1]];
                });
                return modsWithNames;
            })
        );
        return q.all([deps, mods]);
    }).then(function(depsAndMods) {
        return [depsAndMods[0], Array.prototype.concat.apply([], depsAndMods[1])];
    }).then(function(depsAndMods) {
        var deps = depsAndMods[0];
        var mods = depsAndMods[1];
        var toBuildModules = deps.map(function(nameAndVersion) {
            return {user: nameAndVersion[0][0], project: nameAndVersion[0][1], version: nameAndVersion[1]};
        });
        return q.all(
            deps.map(function(nameAndVersion) {
                var fileName = 'elm-stuff/build-artifacts/0.18.0/' + nameAndVersion[0].join('/') + '/' + nameAndVersion[1] + '/graph.dat';
                return promiseOneObject(fileName).then(function(text) {
                    return [nameAndVersion, btoa(text)];
                });
            })
        ).then(function(graphs) {
          return [mods, graphs];
        });
    }).then(function(modsAndGraphs) {
        elmBasicCompile.initCompiler(
          	modsAndGraphs,
            textFilesRequest,
            binaryFilesRequest,
          	function(parseAndCompile) {
                var parse = parseAndCompile[0];
                var compile = parseAndCompile[1];
          	    d.resolve({
                    parse: function(name,source) {
                        var d = q.defer();
                        parse([name,source,d.resolve]);
                        return d.promise;
                    },
              		compile: function(source) {
              		    var d = q.defer();
                        var dd = d.promise.then(function(res) {
                            return [jsprelude.join('\n'),res,footer.join('\n')].join('\n');
                        });
              		    compile([source, d.resolve]);
              		    return dd;
              		}
          	    });
            }
        );
    });

    return d.promise;
}
