import { BaseView } from '../views/BaseView.js';

export const Router = (function() {

  // private code block
  var _app,
    routerView;
  
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
      return r.rex.exec(this,_hash);
    });

    route && _beforeNavigate() && route.fn(this,route.rex.exec(_hash).map(d => d).slice(1));
  }

  function _start() {

    window.onpopstate = function(state) {
      _matchRoute.call(this,window.location.hash);
    };

    _matchRoute.call(this,location.hash);
  };

  function _stop() {
    window.onpopstate = void(0);
  };

  function _beforeNavigate (fn) {
    if (!this.initialized) {
      location.hash = '';
      return false;
    };
    return true;
  }

  class Router {

    constructor(appInstance,routes) {
      routes[""] = routes[""] || this.redirectToDefault;
      _initRoutes.call(this,routes);

      this.currentSection = undefined;
      this.initialized = false;

      _app = appInstance;

    }

    start () {
      const routerEl = document.createElement("div");
      routerEl.id = "router";
      _app.el.appendChild(routerEl);
      routerView = new BaseView(routerEl, {
        "template": "",
        "style": "#router{display:flex;flex:1;}"
      });
      _start.call(this);
    };

    stop () {
      _stop.call(this);
    };

    render (Child,config) {
      routerView.el.innerHTML = "";
      config.home = _app;
      this.currentSection = new Child(routerView.el,config);
      return this
    };

    remove () {
      routerView.el.parentNode.removeChild(routerView.el);
      this.stop();
      delete _app.router;
    };

    redirectToDefault () {
      this.initialized = true;
      location.hash = 'vuebone'
    };
  }

  return Router;

})();
