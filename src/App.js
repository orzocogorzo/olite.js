import { Router } from './url/Router.js;'
import { BaseView } from './views/BaseView.js';

export const App = (function () {
  // PRIVATE CODE BLOCK
  let _ready;

  //PUBLIC CODE BLOCK
  class App extends BaseView {
    constructor (config) {
      config = Object.assign({
        id: "app",
        data: {
          "initialized": false
        }
      },config);

      super(config);

      if (config.router) {
        this.router = new Router(this,routes);
      };

      _ready = this.ready;
      delete this.ready;

      _ready(_ => {
        this.data.initialized = true;
      });

      return this;

    };

    setRouter (routes) {
      this.router = new Router(this,routes);
      return this;
    };

    start (callback) {
      let _init = () => {
        this.router && this.router.start();
        this.render();
        callback(this);
      };

      if (this.initialized) {
        _init()
      } else {
        this.on("ready", _init);
      };

      return this;
    }

  }

  return App;
})();