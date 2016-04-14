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



  function timeoutKiller (proxy, time) {
    global.setTimeout(function() {
      proxy.revoke();
    }, time);
  }



  selfDestruct.killers = {
    'killAfter': timeoutKiller
  };


  /*--- EXPORT ---*/

  (window || self || {}).selfDestruct = selfDestruct;

  if (typeof(define) == 'function' && typeof(define.amd) == 'object' && define.amd) {
    define(function() {
      return selfDestruct;
    });

  } else if (module && module.exports) {
    module.exports = selfDestruct;

  } else {
    global.selfDestruct = selfDestruct;
  }

})(this);