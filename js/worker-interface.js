function initCompiler(callback) {
  var action = h$c2(h$ap1_e, h$mainZCJSInterfaceziinitCompiler, h$c1(h$ghcjszmprimZCGHCJSziPrimziJSVal_con_e, callback));
  h$run(action);
}

var compiler = null

self.addEventListener('message', function (event) {
  if (event.data.type === 'load') {
    self.postMessage({ type: 'load' })
    initCompiler(function(cbs) {
      var parse = cbs[0];
      var compile = cbs[1];
      compiler = {
          parse: function(name,source) {
            return new Promise(function (resolve) {
              parse([name,source,resolve]);
            })
          },
          compile: function(name,exposed,source,ifaces) {
            return new Promise(function (resolve) {
              compile([name,exposed ? "true" : "false",source,ifaces,resolve]);
            })
          }
      };
      self.postMessage({ type: 'load' })
    })
  } else if (event.data.type === 'ready') {
    self.postMessage({ type: 'ready' })
  } else if (event.data.type === 'compile') {
    var oldLog = console.log
    console.log = function (message) {
      self.postMessage({ id: event.data.id, type: 'compile', success: false, message: message })
      console.log = oldLog
    }
    compiler.compile.apply(compiler, event.data.args)
      .then(function (result) {
        self.postMessage({ id: event.data.id, type: 'compile', success: true, result: result })
        console.log = oldLog
      })
      .catch(function (error) {
        self.postMessage({ id: event.data.id, type: 'compile', success: false, message: error.message })
        console.log = oldLog
      })
  } else if (event.data.type === 'parse') {
    var oldLog = console.log
    console.log = function (message) {
      self.postMessage({ id: event.data.id, type: 'parse', success: false, message: message })
      console.log = oldLog
    }
    compiler.parse.apply(compiler, event.data.args)
      .then(function (result) {
        self.postMessage({ id: event.data.id, type: 'parse', success: true, result: result })
        console.log = oldLog
      })
      .catch(function (error) {
        self.postMessage({ id: event.data.id, type: 'parse', success: false, message: error.message })
        console.log = oldLog
      })
  }
})

self.postMessage({ type: 'ready' })
