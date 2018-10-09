export function Dispatcher(root) {
        
  const _eventStore = new Object();

  function Dispatcher () {
    this.root = root;
  
    this.dispatch = function(event,data) {
        if (!_eventStore[event]) return;
        _eventStore[event].map(callback => {
            callback(data);
        });
    }
  
    this.on = function(event,callback) {
        if (!_eventStore[event]) {
            _eventStore[event] = new Array();
        }
        _eventStore[event].push(callback);
    }
  
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
    }
  }

  if (root) {
    let _ = new Dispatcher();
    this.root.$on = _.on.bind(_);
    this.root.$off = _.off.bind(_);
    this.root.$dispatch = _.dispatch.bind(_);
    // void
  } else {
    return new Dispatcher();
  }
}