export const WebAPI = (function() {
	const xmlRq = new XMLHttpRequest();
	xmlRq.responseType = "json";
	const promiser = new Object();
	
	class _API {
		constructor( base_url ) {
			this.root = base_url || '/';
		}

		get( url, callback, error ) {
			let _id = new Date().getTime() + "abcdefghijklmnopqrstvwxyz"[Math.floor(Math.random()*25+1)];
			
			promiser[_id] = new Object();

			promiser[_id].done = (function(callback) {
				promiser[_id].done = function(result) {
					callback && callback(result);
				}
			});

			xmlRq.open("GET",url,true);

			xmlRq.onload = (function(self) {
				return function() {
					(callback && callback(this.response)) || promiser[_id].done(this.response);
					delete promiser[_id];
				};
			})(this);

			xmlRq.onerror = (function(self) {
				return function() {
					(error && error(this)) || promiser[_id].done(this);
					delete promiser[_id];
				};
			})(this);

			xmlRq.send();

			return promiser[_id];	
		}
	}

	return _API;

})();