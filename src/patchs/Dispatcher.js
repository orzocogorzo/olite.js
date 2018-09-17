export function Dispatcher(root) {
        
    const _eventStore = new Object();

    this.root = root;
    
    this.dispatch = function(event,data) {
        if (!_eventStore[event]) return;
        _eventStore[event].map(callback => {
            callback(data);
        });
    }; 

    this.on = function(event,callback) {
        if (!_eventStore[event]) {
            _eventStore[event] = new Array();
        }
        _eventStore[event].push(callback);
    };

    this.off = function(event,callback){
        if (!_eventStore[event]) return;
        if (!callback) {
            delete !_eventStore[event];
            return;
        }
        let index;
        !_eventStore[event].map((_callback,i) => {
            if (_callback == callback) {
                index = i;
            }
        });
        if (index) !_eventStore[event].splice(index,1);
    };

    this.root.on = this.on.bind(this);
    // (function(event,callback) {
    //     return this.on;
    // }).bind(this)();

    this.root.off = this.off.bind(this);
    // (function(event,callback) {
    //     return this.off;
    // }).bind(this)();

    this.root.dispatch = this.dispatch.bind(this);
    // (function(event,data) {
    //     return this.dispatch
    // }).bind(this)();

    return this;
};