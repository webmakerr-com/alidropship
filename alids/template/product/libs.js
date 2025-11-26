/* layzr.js */
(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?module.exports=factory():typeof define==='function'&&define.amd?define(factory):(global.Layzr=factory())}(this,(function(){'use strict';var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key]}}}
    return target};var knot=function knot(){var extended=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var events=Object.create(null);function on(name,handler){events[name]=events[name]||[];events[name].push(handler);return this}
    function once(name,handler){handler._once=!0;on(name,handler);return this}
    function off(name){var handler=arguments.length>1&&arguments[1]!==undefined?arguments[1]:!1;handler?events[name].splice(events[name].indexOf(handler),1):delete events[name];return this}
    function emit(name){var _this=this;for(var _len=arguments.length,args=Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){args[_key-1]=arguments[_key]}
        var cache=events[name]&&events[name].slice();cache&&cache.forEach(function(handler){handler._once&&off(name,handler);handler.apply(_this,args)});return this}
    return _extends({},extended,{on:on,once:once,off:off,emit:emit})};var layzr=(function(){var options=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var prevLoc=getLoc();var ticking=void 0;var nodes=void 0;var windowHeight=void 0;var settings={normal:options.normal||'data-normal',retina:options.retina||'data-retina',srcset:options.srcset||'data-srcset',threshold:options.threshold||0};var srcset=document.body.classList.contains('srcset')||'srcset' in document.createElement('img');var dpr=window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI;var instance=knot({handlers:handlers,check:check,update:update});return instance;function getLoc(){return window.scrollY||window.pageYOffset}
    function requestScroll(){prevLoc=getLoc();requestFrame()}
    function requestFrame(){if(!ticking){window.requestAnimationFrame(function(){return check()});ticking=!0}}
    function getOffset(node){return node.getBoundingClientRect().top+prevLoc}
    function inViewport(node){
        var viewTop=prevLoc;var viewBot=viewTop+windowHeight;var nodeTop=getOffset(node);var nodeBot=nodeTop+node.offsetHeight;var offset=settings.threshold/100*windowHeight;
        const nodeRect = node.getBoundingClientRect();
        return (nodeRect.y != 0) && nodeBot>=viewTop-offset&&nodeTop<=viewBot+offset}
    function setSource(node){instance.emit('src:before',node);if(srcset&&node.hasAttribute(settings.srcset)){node.setAttribute('srcset',node.getAttribute(settings.srcset))}else{var retina=dpr>1&&node.getAttribute(settings.retina);
        if(retina||node.getAttribute(settings.normal)){
            node.setAttribute('src',retina||node.getAttribute(settings.normal))
        }
    }
        instance.emit('src:after',node);[settings.normal,settings.retina,settings.srcset].forEach(function(attr){return node.removeAttribute(attr)});update()}
    function handlers(flag){var action=flag?'addEventListener':'removeEventListener';['scroll','resize'].forEach(function(event){return window[action](event,requestScroll)});return this}
    function check(){windowHeight=window.innerHeight;nodes.forEach(function(node){return inViewport(node)&&setSource(node)});ticking=!1;return this}
    function update(){nodes=Array.prototype.slice.call(document.querySelectorAll('['+settings.normal+']'));return this}});return layzr})))