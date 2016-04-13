(function (global) {
  'use strict';

  var Proxy = global.Proxy,
      Error = global.Error,
      hasOwn = global.Object.prototype.hasOwnProperty,
      toArray = global.Array.prototype.slice;


  var ERRORS = {
    NO_PROXY: 'self destruct uses Proxy'
  };


  if (!Proxy) {
    throw new Error(ERRORS.NO_PROXY);
  }


  global.selfDestruct = selfDestruct;

  selfDestruct.killers = {};


  function selfDestruct (obj) {
    obj = obj || {};

    var proxy = Proxy.revocable(obj, {});

    return getKillers(proxy);
  }

  function getKillers (proxy) {
    var killers = {};

    for (var key in selfDestruct.killers) {
      if (hasOwn.call(selfDestruct.killers, key) && typeof selfDestruct.killers[key] === 'function') {
        killers[key] = function killer() {
          var args = toArray.call(arguments);

          args.unshift(proxy);

          selfDestruct.killers[key].apply(selfDestruct.killers, args);

          return proxy.proxy;
        }
      }
    }

    return killers;
  }


  selfDestruct.killers.killAfter = timeoutKiller;
  function timeoutKiller (proxy, time) {
    global.setTimeout(function() {
      proxy.revoke();
    }, time);
  }

})(window);