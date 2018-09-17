function _arrayComparator(old,prop) {
    let isEqual = true;
    if (old.length != prop.length) {
        isEqual = false;
    } else {
        old.forEach((d,i) => {
            type = typeof d

            if (typeof prop[i] != type) {
                isEqual = false;
                return;
            };
            
            if (type == "string" || type == "number" || type == "function") {
                isEqual = isEqual && d == prop[i];
            } else if (type == "object") {
                if (Array.isArray(d)) {
                    isEqual = isEqual && _arrayComparator(d,prop[i]);
                } else {
                    isEqual = isEqual && _objectComparator(d,prop[i]);
                };
            };
        });
    };

    return isEqual;
};

function _objectComparator(old,prop) {
    let isEqual = true;
    if (Object.keys(old).length != Object.keys(prop).length) {
        isEqual = false;
    } else {
        Object.keys(old).forEach((k,i) => {
            type = typeof old[k];
            
            if (typeof prop[k] != type) {
                isEqual = false;
                return;
            };

            if (type == "string" || type == "number" || type == "function") {
                isEqual = isEqual && old[k] == prop[k];
            } else if (type == "object") {
                if (Array.isArray(old[k])) {
                    isEqual = isEqual && _arrayComparator(old[k],prop[k]);
                } else {
                    isEqual = isEqual && _objectComparator(old[k],prop[k]);
                };
            };
        });
    };

    return isEqual;
};

function _comparator(old,prop) {
    if ( typeof old != typeof prop ) {
        return false;
    } else {
        let type = typeof prop
        if (type == "string" || type == "number" || type == "function") {
            return old == prop;
        };
        if (type == "object") {
            if (Array.isArray(prop)) {
                return _arrayComparator(old,prop);
            } else {
                return _objectComparator(old,prop);
            };
        };
    };
};

export function Reactive(data,callback) {

    if (!data || !callback) {
        throw new Error("data or callback not defined");
    }

    const Handler = function(callback,parent,key) {

        this.key = key;
        this._setter = (function(self) {
            return function(obj,prop,value) {
                if (_comparator(obj[prop],value)) return;
        
                if (value instanceof Object && typeof value === "object") {
                    let handler = new Handler(callback,self,prop);
                    handler._propagateHandler(value);
                    obj[prop] = new Proxy(value,handler);
                } else {
                    obj[prop] = value;
                };
        
                this._react(prop,value);
            }
        })(this);

        this._callback = callback;
        this._react = function(prop,value,child_key) {
            if (parent) {
                console.log(parent.key,key);
                parent._react(prop,value,(child_key&&`${key}:${child_key}`||`${key}`));
            } else {
                callback(prop,value,child_key);
            }
        };

        this._propagateHandler = (function(self) {
            return function(data) {
                Object.keys(data).map((k) => {
                    if (data[k] instanceof Object && typeof data[k] == "object") {
                        let handler = new Handler(callback,self,k);
                        self._propagateHandler(data[k]);
                        data[k] = new Proxy(data[k],handler);
                    };
                });
            };
        })(this);

        let handler = {
            set: (function(self){
                return function(obj,prop,value) {
                    self._setter(obj,prop,value,key);
                };
            })(this),
            _propagateHandler: (function(self) {
                return self._propagateHandler.bind(self);
            })(this)
        };

        return handler;
    };

    if (data instanceof Object && typeof data == "object") {
        let handler = new Handler(callback);
        handler._propagateHandler(data);
        return new Proxy(data,handler);
    } else {
        throw new Error("Reactive only accept objects as data");
    }
}