import { Dispatcher } from "./Dispatcher.js";

export function LifeCycle(root) {
    
    this.root = root;

    function _beforeRender() {
        this.dispatch("before:render");
    };

    function _render(sourcefn) {
        sourcefn.call(this);
        this.dispatch("render");
    };

    function _afterRender() {
        this.dispatch("after:render");
    };

    let render_sourcefn = root.render;
    root.render = function() {
        _beforeRender.call(root);
        _render.call(root, render_sourcefn);
        _afterRender.bind(root);
    };

    function _beforeDettach() {
        this.dispatch("before:dettach");
    };

    function _dettach(sourcfn) {
        sourcfn.call(this);
        this.dispatch("dettach");
    };

    function _afterDettach() {
        this.dispatch("after:dettach");
    };

    let dettach_sourcefn = root.dettach;
    root.dettach = function() {
        _beforeDettach.call(root);
        _dettach.call(root, dettach_sourcefn);
        _afterDettach.call(root);
    };

    function _beforeRemove() {
        this.dispatch("before:remove");
    };

    function _remove(sourcefn) {
        sourcefn.call(this);
        this.dispatch("remove");
    };

    function _afterRemove() {
        this.dispatch("after:remove");
    };

    let remove_sourcefn = root.dettach;
    root.remove = function() {
        _beforeRemove.call(root);
        _remove.call(root, remove_sourcefn);
        _afterRemove.call(root);
    }

    if (typeof this.root.dispatch != "function") {
        new Dispatcher(this.root);
    }

    return this;
};