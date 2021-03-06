export const TemplateParser = function (root) {
  
  function _parser (str) {
    Object.keys(this).map(k => {
      eval(`k = ${this[k]}`);
    });
    str = str.replace(/[\n\t\r]/g, ' ').replace(/\s\s+/g, ' ');
    str = forDirective(str);
    str = ifDirective(str);
    str = onDirective(str);
    str = eval("`" + str.replace(/{{/g, '${').replace(/}}/g,"}") + '`');
    return str;
  }

  function chunker (str) {
    let tags = str.match(/<[^>]+>/g),
        childCounter = 0,
        head,
        bottom;

    if (tags) {
      if (tags.length > 1) {
        let closed = false;
        head = tags.splice(0,1)[0];
        childrens = str.match(RegExp(tags.map(tag => {
          let closer = tag.match(/<\/|\/>/);
          childCounter += (closer ? -1 : 1);
          let returnString = closed ? "" : tag;
          closed = closed || childCounter == 0;
          if (childCounter == -1) {
            bottom = tag;
          }
          return returnString;
        }).filter(d => d).reduce((m,d,i,a) => {
            m += (i < a.length-1 ? d + '[^<|>]*' : d);
            return m;
        }, new String())))[0];
        return {
          head: head,
          childrens: childrens,
          bottom: bottom
        }
      } else {
        return {
          head: tags[0],
          children: undefined
        }
      }
    } else {
      throw new Error("Template string cant be parsed");
    }
  }

  function bindEvents (el) {
    Array.apply(null, el.querySelectorAll('[$binded]')).map(el => {
      let eventCallback = el.getAttribute('$binded').split('%/%');
      el.addEventListener(eventCallback[0], eval(`${eventCallback[1]}`));
    });
  }

  function onDirective (str) {
    directive = str.match(/vb-on:([^=]+)="([^"]+)"/);
    while (directive) {
      str = str.replace(/vb-on:[^=]+=/, '$binded='+directive[1]+'%/%'+directive[2]);
      directive = str.match(/vb-on:([^=]+)="([^"]+)"/);
    }
  }

  function ifDirective (str) {
    let directive = str.match(/<[^>]*vb-if="([^"]+)"[^>]*>/);
    while (directive) {
      let chunked = chunker(str.slice(directive.index));
      if (eval(directive[1])) {
        str = str.replace(/\s*vb-if="([^"]+)"/, '');
      } else {
        str = str.replace(RegExp(chunked.head + '\s*' + chunked.childrens + '\s*' + chunked.bottom), '');
      }
      directive = str.match(/<[^>]+vb-if="([^"]+)"[^>]*>/);
    }
    return str;
  }

  function forDirective (str) {
    let directive = str.match(/<[^>]+vb-for="([^"]+)"[^>]*>/);
    while (directive) {
      let chunked = chunker(str.slice(directive.index));
      let matchedExpr = directive[1].match(/\s*([^\s]+)\s+(in|of)\s+(.*)/);
      
      let name = matchedExpr[1],
          type = matchedExpr[2],
          values = eval(matchedExpr[3]);

      dynamicContent = chunked.head + values.map((d,i) => {
          return eval('`' + chunked.childrens.replace(`${name}`, `${type==='in'?'i':'d'}`).replace(/{{/g,'${').replace(/}}/g,'}') + '`');
        }).join("") + chunked.bottom;

      before = str.slice(0, str.indexOf(chunked.head));
      after = str.slice(str.indexOf(chunked.childrens) + chunked.childrens.length);
      str = before + dynamicContent + after;
      
      str = str.replace(/vb-for="[^"]*"/, '');
      directive = str.match(/<[^>]+vb-for="([^"]+)"[^>]*>/);
    }

    return str;
  }

  this.htmlParser = function (str) {
    let parserNode = document.createElement("template");
    parserNode.innerHTML = str;
    bindEvents(parserNode);
    return parserNode.content;
  }

  this.parser = function (str, data) {
    if (data instanceof Object === false || Array.isArray(data)) {
      throw new Error("Data must be an object");
    }

    return _parser.call(Object.assign(this, data), str);
  }

  this.parse = function (str, data) {
    return this.htmlParser(this.parser(str, (this.data || data || {})));
  }

  if (!root) {
    return this;
  } else {
    // root.$template = parser.bind(root);
    // root.$html = htmlParser.bind(root);
    root.$html = parse.bind(root);
    //void
  }
}