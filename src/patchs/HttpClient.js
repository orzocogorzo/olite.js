export function HttpClient (Class) {

  function gen () {
    const xmlR = new XMLHttpRequest();
    Object.keys(this).map(k => {
      xmlR[k] = typeof this[k] == "function" ? this[k].bind(xmlR) : this[k];
    });
    xmlR.headers = new Object();
    return xmlR;
  };

  this._then = function () {
    return this;
  };

  this.then = function (callback, context) {
    const child = gen.call(new HttpClient());
    this._then = function (res) {
      child._then(callback.bind(context || this)(res));
      return child
    };

    return child;
  };
  
  this._catch = function () {
    return this;
  };

  this.catch = function (callback, context) {
    const child = gen.call(new HttpClient());
    this._catch = function (err) {
      child._catch(callback.bind(context || this)(err));
      return child;
    };
    return child;
  };
  
  this.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        this._then(this._json && JSON.parse(this.response) || this.response);
      } else {
        this._catch(new Error(`message: ${this.statusText}, code: ${this.status}`));
      }
    }
  };

  this.get = function (url, params) {
    const _this = gen.bind(this)();
    try {
      params = params || {};
      const paramsUrl = Object.keys(params).map(k => k + '=' + params[k]).join('&');
      _this.open('GET', url + '.php?' + paramsUrl);
      setTimeout(() => _this.send(), 0);
    } catch (error) {
      _this._catch(error);
    }

    return _this;
  }

  this.post = function (url, data) {
    const _this = gen.bind(this)();
    try {
      _this.open('POST', url + '.php');
      setTimeout(() => _this.headers["Content-Type"] === "application/json" ? 
        _this.send(JSON.stringify(data)) : _this.send(data)
      , 0);
    } catch (err) {
      _this._catch(err);
    }

    return _this;
  }

  this.setHeader = function (key, val) {
    this.headers[key] = val;
    this.setRequestHeader(key, val);
    return this;
  }

  this.json = function () {
    this._json = true;
    return this;
  }

  this.onprogress = function (e) {
    if (e.lengthComputable && this._showProgress) {
      this.el.innerHTML = "Loading: " + (e.loaded / e.total) + "<span>%</span>"
    }
  }

  this.onloadend = function (e) {
    this._showProgress = false;
    this._json = false;
    if (this.el) {
      this.el.parentElement.removeChild(this.el);
    }
  }

  this.onloadstart = function () {
    if (this._showProgress) {
      this.el = document.createElement('div');
      this.el.id = "ajaxLoader";
      this.el.innerHTML = "Loading: 0<span>%</span>"
      document.body.appendChild(this.el);
    }
  }

  this.showProgress = function () {
    this._showProgress = true;
  }
  
  if (Class) {
    Class.prototype.$http;
  } else {
    return this;
  }
}