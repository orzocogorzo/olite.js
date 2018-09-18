import { LifeCycle } from "../patchs/LifeCycle.js";
import { Dispatcher } from "../patchs/Dispatcher.js";
import { Reactive } from "../patchs/Reactive.js";

export const BaseView = (function() {

    // PRIVATE CODE BLOCK    
    function _bindDOMReady() {
        const promise = {
            done: function(callback) {
                this.done = function(event) {
                    callback(event);
                };
            }
        };

        document.addEventListener("DOMContentLoaded", function(e) {
            promise.done(e);
        }); 

        return promise;
    };

    function _idGen () {
      return Array.apply(null,Array(15)).map(_ => "abcdefghijklmnopqrstvwxyxABCDEFGHIJKLMNOPQRSTVWXYZ1234567890_-"[Math.floor(Math.random()*62)]).join("");
    };

    function _initializer(config) {

        if (config.el instanceof HTMLElement) {
            this.el = config.el;
        } else if (typeof config.el == "string") {
            config.el = document.querySelector(config.el);
            if (config.el instanceof HTMLElement) {
                this.el = config.el;
            } else {
                throw new Error("Not el defined");
            }
        } else {
            throw new Error("Not el defined");
        }

        this.dispatch("ready");
        typeof _ready == "function" && _ready();
    };

    function _styleEncapsulator () {
      return `<style id="${_id}">${this.styleText}</style>`
    };

    function _htmlParser (templateStr) {
      let parser = document.createElement("template");
      parser.innerHTML = templateStr;
      return parser.content
    };

    let _id, _content, _ready;

    // PUBLIC CODE BLOCK
    class BaseView {
        constructor(config) {
            if (!window.__root_attached) {
                _bindDOMReady().done((function(self) {
                    return function() {
                        _initializer.bind(self)(config);
                        window.__root_attached = true; 
                    };
                })(this));                           
            } else if (!config.home) {
                throw new Error("Only one view can exist in as a root viewClass");
            } else {
                _initializer.bind(this)(config);
            };

            new Dispatcher(this);
            new LifeCycle(this);

            _id = _idGen();
            this.id = config.id || _id;
            this.template = config.template;
            this.style = config.style;
            this.data = new Reactive(config.data || new Object(), () => {
              if (this.rendered) this.render
            });
            return this;
        };

        ready (callback) { 
          _ready = callback
        };

        render () {
            let templateString;
            if (!this.template) {
              templateString = "";
            } else if (typeof this.template == "string") {
                templateString = this.template;
            } else if (typeof this.template == "function") {
                templateString = this.template(this.data);
            } else {
                throw new Error("Unrecognized template format");
            };
    
            document.head.appendChild(_htmlParser(_styleEncapsulator.bind(this)()));
            
            this.el.innerHTML = "";
            _content = _htmlParser(templateString);
            this.el.appendChild(_content);
            this.el.setAttribute("vbid",this.id);
            this.rendered = true;

            return this; 
        }

        detach () {
            this.el.innerHTML = "";
            this.el.setAttribute("vbid","");
            document.head.removeChild(document.getElementById(_id));
            return this;
        }

        remove () {
            if (this.parent) {
                this.parent.removeChild(this);
            } else {
                throw new Error("You cant remove the app root view");
            }
        }

        addChild(Child,config) {
            config.home = this;
            config.id = config.id || _idGen();
            let child = new Child(config);
            _childs[config._id] = child;
            return child;
        };

        detachChild (child) {
            child.detach();
            return child;
        };

        removeChild (child) {
            child.detach();
            delete _childs[child._id];
        };

        get _id() {
            return _id;
        }

        get content() {
            return _content;
        }
    }

    return BaseView;

})();
