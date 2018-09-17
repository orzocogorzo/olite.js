export const Router = (function() {

  const _routes = new Array();

  function _initRoutes(routes) {
    Object.keys(routes).map(k => {
      let pathParams = k.split('/:');
      let path = pathParams.splice(0,1);

      for (let idx in pathParams) {
        pathParams[idx] = '/(.+)';
      };

      let route = new RegExp(['^'].concat(path).concat(pathParams).concat(['$']).join(''));

      _routes.push({rex:route,fn:routes[k]});

    });
  };

  function _matchRoute(hash) {
    const _hash = hash.replace(/\#/,'');
    let route = _routes.find(r => {
      return r.rex.exec(_hash);
    });

    route && route.fn(route.rex.exec(_hash).map(d => d).slice(1));
  }

  function _start() {

    window.onpopstate = function(state) {
      _matchRoute(window.location.hash);
    };

    _matchRoute(location.hash);
  }

  function _stop() {
    window.onpopstate = void(0);
  }

  class _Router {

    constructor(constroller) {
      _initRoutes.call(this,constroller.routes);
    }

    start() {
      _start.call(this);
    }

    stop() {
      _stop.call(this);
    }
  }

  return _Router;

})();
