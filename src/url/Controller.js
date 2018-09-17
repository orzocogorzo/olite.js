export const Controller = (function() {

  // private code block

  var _app;
  
  return class Controller {
    
    constructor( appInstance ) {
      // class public properties
      this.routes = {
        '': this.redirectToDefault.bind( this ),
        'home': this.renderHome.bind( this ),  
        'map/:section': this.renderSection.bind( this ),
      };

      this.currentSection = undefined;
      this.initialized = false;

      _app = appInstance;
    };

    // class public methods
    redirectToDefault() {
      this.initialized = true;
      location.hash = 'map'
    };
  
    renderHome() {
      if (!this.initialized) {
        location.hash = '';
        return;
      }

      _app.dettach();
      this.currentSection = _app.appendChild(Child,{});
      location.hash = 'map/home';
    };
  
    renderSection(args) {
      if (!this.initialized) {
        location.hash = '';
        return;
     };

    };
  };

})();
