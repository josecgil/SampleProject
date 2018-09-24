// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if (!Array.prototype.forEach) {

    Array.prototype.forEach = function forEach(callback, thisArg) {
        'use strict';
        var T, k;

        if (this == null) {
            throw new TypeError("this is null or not defined");
        }

        var kValue,
            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            O = Object(this),

            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            len = O.length >>> 0; // Hack to convert O.length to a UInt32

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if ({}.toString.call(callback) !== "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length >= 2) {
            T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as the this value and
                // argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}(function(exports) {

    exports.RayNS=exports.RayNS || {};

    var Document=function(eventsToListen){
        this.callbacks=[];
        this.eventNamesToListen=eventsToListen;
        var self=this;
        this._notified=false;

        this.listener = function () {
            self._notifyReady(self.callbacks);
        };

    };

    Document.prototype.begin=function() {
        document.addEventListener(this.eventNamesToListen.document, this.listener);
        window.addEventListener(this.eventNamesToListen.window, this.listener);
    };

    Document.prototype.end=function() {
        this._notified=false;
        document.removeEventListener(this.eventNamesToListen.document, this.listener);
        window.removeEventListener(this.eventNamesToListen.window, this.listener);
        this.callbacks=[];
    };

    Document.prototype.ready=function(callback) {
        //if (this._documentIsReady()) {
        //    callback();
        //} else {
        this.callbacks.push(callback);
        //}
    };

    Document.prototype._notifyReady=function(callbacks) {
        if (this._notified) return;
        this._notified=true;
        callbacks.forEach(function(callback){
            callback();
        });
        callbacks=[];
    };

    Document.prototype._documentIsReady=function() {
        var readyState = document.readyState;
        var isScrolling = document.documentElement.doScroll;
        var isComplete=readyState === 'complete';
        var isLoading=readyState === 'loading';
        if (isComplete) return true;
        if ( (!isLoading) && (!isScrolling) ) {
            return true;
        }
        return false;
    };

    exports.RayNS.Document=Document;
})(window);




(function (exports) {

    exports.RayNS=exports.RayNS || {};

    var CommandDispatcher=function(eventBus)
    {
        this.eventBus = eventBus;
    };

    CommandDispatcher.prototype.loadNewComponents = function() {
        function getComponentName(dataRayComponent) {
            var namespaces = dataRayComponent.split(".");
            return namespaces.pop();
        }

        function getLastCallableObject(dataRayComponent) {
            var namespaces = dataRayComponent.split(".");
            namespaces.pop();

            var obj=window;
            namespaces.forEach(function(namespace){
                obj=obj[namespace];
            });
            return obj;
        }

        var DATA_RAY_ATTR= "data-ray-component";
        var self = this;
        return document.querySelectorAll("["+DATA_RAY_ATTR+"]").forEach(function(domElement){
            try {
                var EXECUTED_ATTRIBUTE = 'data-ray-component-executed';
                if (domElement.hasAttribute(EXECUTED_ATTRIBUTE)) {
                    return;
                }
                domElement.setAttribute(EXECUTED_ATTRIBUTE, '');
                var dataRayComponentAttrValue = domElement.getAttribute(DATA_RAY_ATTR);
                var componentName = getComponentName(dataRayComponentAttrValue);
                var lastNamespaceObject = getLastCallableObject(dataRayComponentAttrValue);
                var component = lastNamespaceObject[componentName];
                var data = {DOMElement: domElement, bus: self.eventBus, commandDispatcher: self};
                if (component==undefined) {
                    throw new Error("<"+componentName+"> JS object not Found");
                }
                new component(data);
            } catch (e) {
                self.eventBus.trigger("ray.error", e);
                console.log("RayJS: Error loading components: "+ e.message);
            }
        });
    };

    exports.RayNS.CommandDispatcher=CommandDispatcher;
})(window);


//Adapted from https://gist.github.com/fatihacet/1290216

(function (exports) {

    exports.RayNS=exports.RayNS || {};

    var EventBus=function() {
        this._init();
    };

    EventBus.prototype._init=function() {
        this.topics = {};
        this.id = 0;
    };

    EventBus.prototype.on = function(topic, callback) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        this.id++;
        this.topics[topic].push({
            id: this.id,
            callback: callback
        });
        return this.id;
    };

    EventBus.prototype.off = function(id) {
        for (var m in this.topics) {
            if (!this.topics[m]) return false;
            for (var i = 0, len = this.topics[m].length; i < len; i++) {
                if (this.topics[m][i].id === id) {
                    this.topics[m].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    };

    EventBus.prototype.end = function() {
        this._init();
    };

    EventBus.prototype.trigger = function(topic, args) {
        if (!this.topics[topic]) {
            return false;
        }
        var self=this;
        setTimeout(function() {
            var subscribers = self.topics[topic];
            if (!subscribers) return;
            subscribers.forEach(function(suscriber){
                suscriber.callback(args);
            });
        }, 0);
        return true;
    };

    exports.RayNS.EventBus=EventBus;
})(window);


(function (exports) {

    exports.RayNS=exports.RayNS || {};

    var Ray=function(eventNamesToListen) {
        this.eventNamesToListen=eventNamesToListen || {document:'DOMContentLoaded', window:'load'};
        this.raydocument=new RayNS.Document(this.eventNamesToListen);
        this.eventBus=new RayNS.EventBus();
        this.commandDispatcher = new RayNS.CommandDispatcher(this.eventBus);
    };

    Ray.prototype.begin=function() {
        this.raydocument.begin();
        var self = this;
        this.raydocument.ready(function(){
            self.commandDispatcher.loadNewComponents();
        });
        setInterval(function(){
            self.commandDispatcher.loadNewComponents();
        },400);
    };

    Ray.prototype.end=function() {
        this.raydocument.end();
        this.eventBus.end();
    };

    Ray.prototype.getCommandDispatcher=function() {
        return this.commandDispatcher;
    };

    exports.RayNS.Ray=Ray;
})(window);

(function(exports){

    var HtmlFixture=function()
    {
        this.root=null;
    };

    HtmlFixture.prototype.create=function() {
        if (this.root!=null) {
            this.destroy();
        }
        var div = document.createElement("div");
        div.setAttribute("id","html-fixture-"+this._newGUID());
        div.setAttribute("style","display:none");
        this.root=document.body.appendChild(div);
    };

    HtmlFixture.prototype._newGUID=function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    HtmlFixture.prototype.destroy=function() {
        this.root.parentNode.removeChild(this.root);
        this.root=null;
    };

    HtmlFixture.prototype.isEmpty=function() {
        if (this.root == null) return true;
        if (this.root.innerHTML.trim().length===0) return true;
        return false;
    };


    HtmlFixture.prototype.getRootElement=function() {
        return this.root;
    };

    HtmlFixture.prototype._parseFunctionComment=function (fn) {
        var reCommentContents = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//;
        var match = reCommentContents.exec(fn.toString());
        if (!match) { throw new TypeError('Multiline comment missing.'); }
        return match[1];
    };

    HtmlFixture.prototype._isFunction=function(param) {
        return typeof param === 'function';
    };

    HtmlFixture.prototype._isDomNode=function(param) {
        return param.outerHTML != undefined;
    };

    HtmlFixture.prototype._paramToString=function(param) {
        if (this._isFunction(param)) {
            return this._parseFunctionComment(param);
        }

        if (this._isDomNode(param)) {
            return param.outerHTML;
        }
        return param.toString();
    };

    HtmlFixture.prototype._parseHTML = function(str) {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp.body.children;
    };

    HtmlFixture.prototype.add=function(param) {
        var html=this._paramToString(param);
        return this.root.innerHTML=this.root.innerHTML+html;
    };

    HtmlFixture.prototype._replaceAll = function(str, search, replacement) {
        return str.replace(new RegExp(search, 'g'), replacement);
    };

    HtmlFixture.prototype._replaceAllDoubleSpaces= function(str) {
        var oldLength;
        var newLength;
        do {
            oldLength = str.length;
            str = this._replaceAll(str, "  ", " "); //double spaces
            newLength = str.length;
        } while (oldLength != newLength);
        return str;
    };

    HtmlFixture.prototype._replaceSpacesBetweenTags=function(str) {
        return this._replaceAll(str, "> <", "><");
    };

    HtmlFixture.prototype._normalizeHtml=function(html) {
        var normalizedHtml="";
        var nodes=this._parseHTML(html);
        for(var i=0; i<nodes.length; i++) {
            var node=nodes[i];
            normalizedHtml=normalizedHtml+node.outerHTML;
        }
        normalizedHtml = this._replaceAllDoubleSpaces(normalizedHtml);
        normalizedHtml = this._replaceSpacesBetweenTags(normalizedHtml);
        return normalizedHtml;
    };

    HtmlFixture.prototype.isEqual=function(param) {
        var myHtml=this._normalizeHtml(this.root.innerHTML);
        var otherHtml=this._paramToString(param);
        otherHtml=this._normalizeHtml(otherHtml);
        return myHtml===otherHtml;
    };

    HtmlFixture.prototype.asString=function() {
        return this._normalizeHtml(this.root.innerHTML);
    };

    exports.RaySimNS=exports.RaySimNS || {};
    exports.RaySimNS.HtmlFixture=HtmlFixture;
})(window);
(function (exports) {

    exports.RaySimNS=exports.RaySimNS || {};

    function RaySim() {
        this.EVENT_NAMES_IN_SIM = {
            document: 'DOMContentLoadedTest',
            window: 'loadTest'
        };
        this.fixture=new RaySimNS.HtmlFixture();
        this.fixture.create();
        this.ray=new RayNS.Ray(this.EVENT_NAMES_IN_SIM);
        this.bus=this.ray.eventBus;
    }

    RaySim.prototype.fireEvent=function(element, name) {
        var event = document.createEvent("Event");
        event.initEvent(name, true, true);
        element.dispatchEvent(event);
    };

    RaySim.prototype._fireDOMReady=function() {
        this.fireEvent(window.document, this.EVENT_NAMES_IN_SIM.document);
        this.fireEvent(window, this.EVENT_NAMES_IN_SIM.window);
    };

    RaySim.prototype.setHtml=function(html) {
        this.fixture.add(html);
    };

    RaySim.prototype.hasHTML=function(html) {
        return this.fixture.isEqual(html);
    };

    RaySim.prototype.start=function() {
        this.ray.begin();
        this._fireDOMReady();
    };

    RaySim.prototype.end=function() {
        this.ray.end();
        this.fixture.destroy();
    };



    exports.RaySimNS.RaySim=RaySim;
})(window);

