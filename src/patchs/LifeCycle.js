import { Dispatcher } from "./Dispatcher.js";

export function LifeCycle(root) {
    
    this.root = root;

    function _beforeRender() {
        this.dispatch("before:render");
    };

    function _render(sourcefn) {
        sourcefn.bind(this)();
        this.dispatch("render");
    };

    function _afterRender() {
        this.dispatch("after:render");
    };

    let render_sourcefn = root.render;
    root.render = function() {
        _beforeRender.bind(root)();
        _render.bind(root)(render_sourcefn);
        _afterRender.bind(root)();
    };

    function _beforeDettach() {
        this.dispatch("before:dettach");
    };

    function _dettach(sourcfn) {
        sourcfn.bind(this)();
        this.dispatch("dettach");
    };

    function _afterDettach() {
        this.dispatch("after:dettach");
    };

    let dettach_sourcefn = root.dettach;
    root.dettach = function() {
        _beforeDettach.bind(root)();
        _dettach.bind(root)(dettach_sourcefn);
        _afterDettach.bind(root)();
    };

    function _beforeRemove() {
        this.dispatch("before:remove");
    };

    function _remove(sourcefn) {
        sourcefn.bind(this)();
        this.dispatch("remove");
    };

    function _afterRemove() {
        this.dispatch("after:remove");
    };

    let remove_sourcefn = root.dettach;
    root.remove = function() {
        _beforeRemove.bind(root)();
        _remove.bind(root)(remove_sourcefn);
        _afterRemove.bind(root)();
    }

    if (typeof this.root.dispatch != "function") {
        new Dispatcher(this.root);
    }

    return this;
};