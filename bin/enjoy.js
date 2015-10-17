/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 Using.js - Simple JavaScript module loader.

 Copyright (c) 2015 Jonathan Steinbeck
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

 * Neither the name using.js nor the names of its contributors 
   may be used to endorse or promote products derived from this software 
   without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* global document, console */

var using = (function () {
    
    "use strict";
    
    var modules = {}, loadedScripts = {}, dependencies = {}, definitions = {}, dependingOn = {};
    var runners = [], selectors = {}, runnersCheckInProgress = false;
    
    function updateModule (moduleName) {
        
        var deps = [], depNames = dependencies[moduleName], moduleResult;
        var currentSelectors = selectors[moduleName];
        
        if (modules[moduleName]) {
            return;
        }
        
        if (depNames.length === 0) {
            
            moduleResult = definitions[moduleName]();
            
            if (!moduleResult) {
                console.error("Module '" + moduleName + "' returned nothing");
            }
            
            modules[moduleName] = moduleResult;
            
            dependingOn[moduleName].forEach(updateModule);
        }
        else if (allModulesLoaded(depNames)) {
            
            //console.log("currentSelectors, depNames:", currentSelectors, depNames);
            
            depNames.forEach(function (name, i) {
                deps.push(select(name, currentSelectors[i]));
            });
            
            moduleResult = definitions[moduleName].apply(undefined, deps);
            
            if (!moduleResult) {
                console.error("Module '" + moduleName + "' returned nothing.");
            }
            
            modules[moduleName] = moduleResult;
            
            dependingOn[moduleName].forEach(updateModule);
        }
        
        startRunnersCheck();
    }
    
    function startRunnersCheck () {
        
        if (runnersCheckInProgress) {
            return;
        }
        
        runnersCheckInProgress = true;
        
        checkRunners();
    }
    
    function checkRunners () {
        
        runners.forEach(function (runner) {
            runner();
        });
        
        if (runners.length) {
            setTimeout(checkRunners, 20);
        }
        else {
            runnersCheckInProgress = false;
        }
    }
    
    function allModulesLoaded (moduleNames) {
        
        var loaded = true;
        
        moduleNames.forEach(function (name) {
            if (!modules[name]) {
                loaded = false;
            }
        });
        
        return loaded;
    }
    
    function select (moduleName, selectors) {
        
        var argSelectors, mod;
        
        mod = modules[moduleName];
        
        if (!selectors) {
            console.log("Module has no selectors:", moduleName);
            return mod;
        }
        
        argSelectors = selectors.slice();
        
        while (argSelectors.length) {
            
            if (typeof mod !== "object" || mod === null) {
                throw new TypeError("Module '" + moduleName + "' has no property '" +
                    argSelectors.join("::") + "'.");
            }
            
            mod = mod[argSelectors.shift()];
        }
        
        return mod;
    }
    
    function using (/* module names */) {
        
        var args, moduleNames, moduleSelectors, capabilityObject;
        
        moduleNames = [];
        moduleSelectors = [];
        args = [].slice.call(arguments);
        
        args.forEach(function (arg, index) {
            
            var selector, moduleName;
            var parts = arg.split("::");
            var protocolParts = parts[0].split(":");
            var protocol = protocolParts.length > 1 ? protocolParts[0] : "";
            
            parts[0] = protocolParts.length > 1 ? protocolParts[1] : protocolParts[0];
            
            selector = parts.slice(1);
            moduleName = parts[0];
            
            if (protocol === "ajax") {
                moduleNames.push(arg);
            }
            else {
                moduleNames.push(moduleName);
            }
            
            moduleSelectors.push(selector);
            
            if (!(moduleName in dependencies) && !(moduleName in modules)) {
                
                if (protocol === "ajax") {
                    
                    dependencies[arg] = [];
                    
                    if (!dependingOn[arg]) {
                        dependingOn[arg] = [];
                    }
                    
                    using.ajax(using.ajax.HTTP_METHOD_GET, arg.replace(/^ajax:/, ""),
                        null, ajaxResourceSuccessFn, ajaxResourceSuccessFn);
                }
                else {
                    
                    dependencies[moduleName] = [];
                    
                    if (!dependingOn[moduleName]) {
                        dependingOn[moduleName] = [];
                    }
                    
                    loadModule(moduleName);
                }
            }
            
            function ajaxResourceSuccessFn (request) {
                modules[arg] = request;
                dependingOn[arg].forEach(updateModule);
            }
        });
        
        
        capabilityObject = {
            run: run,
            define: define
        };
        
        return capabilityObject;
        
        
        function run (callback) {
            
            if (!runner(true)) {
                runners.push(runner);
            }
            
            startRunnersCheck();
            
            return capabilityObject;
            
            function runner (doNotRemove) {
                
                var deps = [];
                
                if (allModulesLoaded(moduleNames)) {
                    
                    //console.log("moduleSelectors, moduleNames:", moduleSelectors, moduleNames);
                    
                    moduleNames.forEach(function (name, i) {
                        deps.push(select(name, moduleSelectors[i]));
                    });
                    
                    callback.apply(undefined, deps);
                    
                    if (!doNotRemove) {
                        runners.splice(runners.indexOf(runner), 1);
                    }
                    
                    return true;
                }
                
                return false;
            }
        }
        
        function define (moduleName, callback) {
            
            if (moduleName in definitions) {
                throw new Error("Module '" + moduleName + "' is already defined.");
            }
            
            definitions[moduleName] = callback;
            dependencies[moduleName] = moduleNames;
            selectors[moduleName] = moduleSelectors;
            
            if (!dependingOn[moduleName]) {
                dependingOn[moduleName] = [];
            }
            
            moduleNames.forEach(function (name) {
                
                if (!dependingOn[name]) {
                    dependingOn[name] = [];
                }
                
                dependingOn[name].push(moduleName);
            });
            
            updateModule(moduleName);
            
            return capabilityObject;
            
        }
    }
    
    using.path = "";
    
    (function () {
        
        var scripts = document.getElementsByTagName("script");
        
        using.path = scripts[scripts.length - 1].src.replace(/using\.js$/, "");
        
    }());
    
    using.modules = {};
    
    function loadModule (moduleName) {
        
        if (!(moduleName in using.modules)) {
            throw new Error("Unknown module '" + moduleName + "'.");
        }
        
        using.loadScript(using.modules[moduleName]);
    }
    
    using.loadScript = function (url) {
        
        var script = document.createElement("script");
        var scriptId = "using_script_" + url;
        
        if (loadedScripts[url] || document.getElementById(scriptId)) {
            return;
        }
        
        script.setAttribute("id", scriptId);
        
        script.src = url;
        
        document.body.appendChild(script);
    };
    
    return using;
    
}());

/* global using, XMLHttpRequest, ActiveXObject */

using.ajax = (function () {
    
    var HTTP_STATUS_OK = 200;
    var READY_STATE_UNSENT = 0;
    var READY_STATE_OPENED = 1;
    var READY_STATE_HEADERS_RECEIVED = 2;
    var READY_STATE_LOADING = 3;
    var READY_STATE_DONE = 4;
    
    function ajax (method, url, data, onSuccess, onError, timeout) {
        
        var requestObject = XMLHttpRequest ?
            new XMLHttpRequest() :
            new ActiveXObject("Microsoft.XMLHTTP");
        
        requestObject.open(method, url + "?random=" + Math.random(), true);
        
        if (timeout) {
            
            requestObject.timeout = timeout;
            
            requestObject.ontimeout = function () {
                
                requestObject.abort();
                
                if (!onError) {
                    return;
                }
                
                onError(new Error("Connection has reached the timeout of " + timeout + " ms."));
            };
        }
        
        requestObject.onreadystatechange = function() {
            
            var done, statusOk;
            
            done = requestObject.readyState === READY_STATE_DONE;
            
            if (done) {
                
                try {
                    statusOk = requestObject.status === HTTP_STATUS_OK;
                }
                catch (error) {
                    console.error(error);
                    statusOk = false;
                }
                
                if (statusOk) {
                    onSuccess(requestObject);
                }
                else {
                    onError(requestObject);
                }
            }
        };
        
        if (data) {
            requestObject.send(data);
        }
        else {
            requestObject.send();
        }
        
        return requestObject;
    }
    
    ajax.HTTP_STATUS_OK = HTTP_STATUS_OK;
    
    ajax.READY_STATE_UNSENT = READY_STATE_UNSENT;
    ajax.READY_STATE_OPENED = READY_STATE_OPENED;
    ajax.READY_STATE_HEADERS_RECEIVED = READY_STATE_HEADERS_RECEIVED;
    ajax.READY_STATE_LOADING = READY_STATE_LOADING;
    ajax.READY_STATE_DONE = READY_STATE_DONE;
    
    ajax.HTTP_METHOD_GET = "GET";
    ajax.HTTP_METHOD_POST = "POST";
    ajax.HTTP_METHOD_PUT = "PUT";
    ajax.HTTP_METHOD_DELETE = "DELETE";
    ajax.HTTP_METHOD_HEAD = "HEAD";
    
    return ajax;
    
}());
/* global using, define, window, module */

(function () {
    
    var out = {
        hidden_properties: [],
        poly: {}, /* methods for basic functions */
        core: {} /* basic functions */
    };
    
        
    function apply (fn, args) {
        
        if (typeof fn !== "function") {
            throw new TypeError("Argument 'fn' must be a function.");
        }
        
        return fn.apply(undefined, args);
    }
    
    out.apply = apply;
    
    function bind (fn) {
        
        var args = [].slice.call(arguments);
        
        args.shift();
        
        return function () {
            
            var allArgs = args.slice(), i;
            
            for (i = 0; i < arguments.length; i += 1) {
                allArgs.push(arguments[i]);
            }
            
            fn.apply(undefined, allArgs);
        };
    }
    
    out.bind = bind;
    
    function call (fn) {
        
        var args = [].slice.call(arguments);
        
        args.shift();
        
        return fn.apply(undefined, args);
    }
    
    out.call = call;
    
    function partial (fn) {
        
        var args = [].slice.call(arguments, 1);
        
        return function () {
            
            var callArgs = [].slice.call(arguments);
            
            var allArgs = args.map(function (arg, index) {
                
                if (typeof arg === "undefined") {
                    return callArgs.shift();
                }
                
                return arg;
            });
            
            if (callArgs.length) {
                callArgs.forEach(function (arg) {
                    allArgs.push(arg);
                });
            }
            
            return apply(fn, allArgs);
        };
    }
    
    out.partial = partial;
    
    function pipe (value) {
        
        each(arguments, function (fn, index) {
            if (index > 0) {
                value = fn(value);
            }
        });
        
        return value;
    }
    
    out.pipe = pipe;
    
    function piped () {
        
        var functions = [].slice.call(arguments);
        
        return function (value) {
            
            var args = functions.slice();
            
            args.unshift(value);
            
            return apply(pipe, args);
        };
    };
    
    out.piped = piped;
        
    var METHOD_PRECEDENCE_SCORE_FN = 10;
    var METHOD_PRECEDENCE_SCORE_ID = 8;
    var METHOD_PRECEDENCE_SCORE_EQ = 6;
    var METHOD_PRECEDENCE_SCORE_IS_A = 4;
    
    function method (defaultFn) {
        
        var dispatchers = [].slice.call(arguments, 1);
        
        function fn () {
            
            var argsLength = arguments.length;
            var implementation = fn.$__default__;
            var highestScore = 0;
            
            var dispatchValues = [].map.call(arguments, function (arg, i) {
                
                var dispatcher = fn.$__dispatchers__[i] || id;
                
                return call(dispatcher, arg);
            });
            
            fn.$__implementations__.some(function (impl) {
                
                var currentScore = 0;
                var predicateMatches = 0;
                
                if (argsLength < impl.$__comparators__.length) {
                    return false;
                }
                
                var match = dispatchValues.every(function (dispatchValue, i) {
                    
                    var comparator = impl.$__comparators__[i];
                    var comparatorIsFunction = typeof comparator === "function";
                    var argumentOrderModificator = dispatchValues.length - i;
                    
                    if (i >= impl.$__comparators__.length) {
                        return true;
                    }
                    
                    if (comparatorIsFunction && comparator(dispatchValue)) {
                        predicateMatches += 1;
                        currentScore += METHOD_PRECEDENCE_SCORE_FN * argumentOrderModificator;
                        return true;
                    }
                    
                    if (identical(dispatchValue, comparator)) {
                        currentScore += METHOD_PRECEDENCE_SCORE_ID * argumentOrderModificator;
                        return true;
                    }
                    
                    if (equal(dispatchValue, comparator)) {
                        currentScore += METHOD_PRECEDENCE_SCORE_EQ * argumentOrderModificator;
                        return true;
                    }
                    
                    if (is_a(dispatchValue, comparator)) {
                        currentScore += METHOD_PRECEDENCE_SCORE_IS_A * argumentOrderModificator;
                        return true;
                    }
                    
                    return false;
                });
                
                if (match && currentScore > highestScore) {
                    highestScore = currentScore;
                    implementation = impl.$__implementation__;
                }
                
                if (predicateMatches > 0 && predicateMatches === dispatchValues.length) {
                    return true;
                }
                
                return false;
            });
            
            return apply(implementation, arguments);
        }
        
        if (defaultFn && typeof defaultFn !== "function") {
            throw new TypeError("Argument 1 must be a function.");
        }
        
        Object.defineProperty(fn, "$__default__", {
            value: defaultFn || function () {
                throw new TypeError("No matching implementation found for method arguments.");
            },
            writable: true
        });
        
        Object.defineProperty(fn, "$__dispatchers__", {
            value: [],
            writable: true
        });
        
        Object.defineProperty(fn, "$__implementations__", {
            value: [],
            writable: true
        });
        
        Object.defineProperty(fn, "$__type__", {value: "method"});
        
        dispatchers.unshift(fn);
        
        apply(dispatch, dispatchers);
        
        return fn;
    }
    
    Object.defineProperty(out, "method", {value: method});
    
    function dispatch (method) {
        
        var dispatchers = [].slice.call(arguments, 1);
        
        dispatchers.forEach(function (dispatcher, index) {
            
            var dtype = typeof dispatcher;
            
            if (dtype !== "function" && (dtype === "string" || dtype === "number")) {
                dispatcher = partial(at, undefined, dispatcher);
            }
            else if (dtype !== "function") {
                throw new TypeError("Dispatchers must be strings, numbers or functions.");
            }
            
            dispatchers[index] = dispatcher;
        });
        
        method.$__dispatchers__ = dispatchers;
    }
    
    Object.defineProperty(out, "dispatch", {value: dispatch});
        
    function specialize () {
        
        var args = [].slice.call(arguments);
        var method = args.shift();
        var implementation = args.pop();
        var comparators = args.slice();
        var specialization, old;
        
        method.$__implementations__.some(function (impl) {
            
            var matchesEvery = impl.$__comparators__.every(function (comp, i) {
                return equal(comp, comparators[i]);
            });
            
            if (matchesEvery) {
                old = impl;
                return true;
            }
            
            return false;
        });
        
        if (old) {
            old.$__implementation__ = implementation;
        }
        else {
            
            specialization = {};
            
            Object.defineProperty(specialization, "$__comparators__", {
                value: comparators
            });
            
            Object.defineProperty(specialization, "$__implementation__", {
                value: implementation,
                writable: true
            });
            
            method.$__implementations__.push(specialization);
        }
    }
    
    out.hidden_properties.push("$__comparators__");
    out.hidden_properties.push("$__default__");
    out.hidden_properties.push("$__dispatchers__");
    out.hidden_properties.push("$__implementation__");
    out.hidden_properties.push("$__implementations__");
    
    Object.defineProperty(out, "specialize", {value: specialize});
        
    function is_null (a) {
        return a === null;
    }
    
    function is_undefined (a) {
        return typeof a === "undefined";
    }
    
    function is_boolean (a) {
        return typeof a === "boolean";
    }
    
    function is_number (a) {
        return typeof a === "number";
    }
    
    function is_string (a) {
        return typeof a === "string";
    }
    
    function is_char (a) {
        return is_string(a) && a.length === 1;
    }
    
    function is_collection (a) {
        return is_object(a) || is_array(a);
    }
    
    function is_object (a) {
        return typeof a === "object" && a !== null;
    }
    
    function is_array (a) {
        return Array.isArray(a);
    }
    
    function is_function (a) {
        return typeof a === "function";
    }
    
    function is_primitive (a) {
        return is_null(a) || is_undefined(a) || is_number(a) || is_string(a) || is_boolean(a);
    }
    
    function is_type (a) {
        return is_object(a) && a.$__type__ === "type";
    }
    
    function is_derivable (a) {
        return is_object(a) && "$__children__" in a && Array.isArray(a.$__children__);
    }
    
    function is_method (a) {
        return is_object(a) && a.$__type__ === "method";
    }
    
    function valid (data, schema) {
        
        var key;
        
        if (!is_object(data)) {
            
            if (is_type(schema)) {
                return is_a(data, schema);
            }
            
            if (is_function(schema)) {
                return schema(data);
            }
            
            return identical(data, schema);
        }
        else {
            
            for (key in schema) {
                
                if (is_type(schema[key])) {
                    
                    if (!is_a(data[key], schema[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (is_function(schema[key])) {
                    
                    if (!schema[key](data[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (is_object(schema[key])) {
                    
                    if (!valid(data[key], schema[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (!equal(schema[key], data[key])) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    function validator (schema) {
        return partial(valid, undefined, schema);
    }
    
    function type (checker) {
        
        var obj = Object.create(null);
        
        if (!arguments.length) {
            checker = function () { return false; };
        }
        
        if (!is_function(checker)) {
            checker = validator(checker);
        }
        
        Object.defineProperty(obj, "$__type__", {value: "type"});
        Object.defineProperty(obj, "toString", {value: function () { return "[object Type]"; }});
        Object.defineProperty(obj, "$__checker__", {value: checker});
        make_derivable(obj);
        
        Object.freeze(obj);
        
        return obj;
    }
    
    function make_derivable (obj) {
        
        if (!is_object(obj) || !Object.isExtensible(obj)) {
            throw new TypeError("Argument 'obj' is not derivable in call to make_derivable(obj).");
        }
        
        Object.defineProperty(obj, "$__children__", {value: []});
    }
    
    function derive (child, parent) {
        
        if (!is_derivable(child)) {
            make_derivable(child);
        }
        
        if (!is_derivable(parent)) {
            make_derivable(parent);
        }
        
        if (descendant_of(child, parent)) {
            throw new Error("Child is already a descendent of this parent.");
        }
        
        parent.$__children__.push(child);
    }
    
    function descendant_of (a, b) {
        
        if (!is_derivable(a)) {
            throw new TypeError("Parameter 'a' must be derivable.");
        }
        
        if (!is_derivable(b)) {
            throw new TypeError("Parameter 'b' must be derivable.");
        }
        
        return b.$__children__.some(function (c) {
            return (c === a ? true : c.$__children__.some(bind(descendant_of, a)));
        });
    }
    
    function is_a (a, t) {
        
        if (!is_derivable(t)) {
            
            if (typeof t !== "function") {
                return false;
            }
            
            return a instanceof t;
        }
        
        if (is_derivable(a) && descendant_of(a, t)) {
            return true;
        }
        
        if (!is_type(t)) {
            return false;
        }
        
        if (t.$__checker__(a)) {
            return true;
        }
        
        return t.$__children__.some(function (child) {
            return is_a(a, child);
        });
    }
    
    var t_primitive = type(is_primitive);
    var t_composite = type(is_object);
    
    var t_null = type(is_null);
    var t_undefined = type(is_undefined);
    
    var t_boolean = type(is_boolean);
    
    var t_char = type(is_char);
    var t_string = type(is_string);
    
    var t_number = type(is_number);
    var t_float = type(function (n) { return is_number(n) && n % 1 !== 0; });
    var t_integer = type(function (n) { return is_number(n) && n % 1 === 0; });
    
    var t_object = type(is_object);
    var t_array = type(is_array);
    
    var t_function = type(is_function);
    
    derive(t_null, t_primitive);
    derive(t_undefined, t_primitive);
    derive(t_boolean, t_primitive);
    derive(t_string, t_primitive);
    
    derive(t_char, t_string);
    
    derive(t_float, t_number);
    derive(t_integer, t_number);
    
    derive(t_object, t_composite);
    derive(t_array, t_object);
    derive(t_function, t_object);
    
    Object.defineProperty(out, "type", {value: type});
    Object.defineProperty(out, "derive", {value: derive});
    Object.defineProperty(out, "make_derivable", {value: make_derivable});
    Object.defineProperty(out, "valid", {value: valid});
    Object.defineProperty(out, "validator", {value: validator});
    
    Object.defineProperty(out, "is_a", {value: is_a});
    Object.defineProperty(out, "is_null", {value: is_null});
    Object.defineProperty(out, "is_undefined", {value: is_undefined});
    Object.defineProperty(out, "is_boolean", {value: is_boolean});
    Object.defineProperty(out, "is_number", {value: is_number});
    Object.defineProperty(out, "is_string", {value: is_string});
    Object.defineProperty(out, "is_char", {value: is_char});
    Object.defineProperty(out, "is_colllection", {value: is_collection});
    Object.defineProperty(out, "is_object", {value: is_object});
    Object.defineProperty(out, "is_array", {value: is_array});
    Object.defineProperty(out, "is_function", {value: is_function});
    Object.defineProperty(out, "is_primitive", {value: is_primitive});
    Object.defineProperty(out, "is_type", {value: is_type});
    Object.defineProperty(out, "is_derivable", {value: is_derivable});
    Object.defineProperty(out, "is_method", {value: is_method});
    
    Object.defineProperty(out, "t_primitive", {value: t_primitive});
    Object.defineProperty(out, "t_composite", {value: t_composite});
    Object.defineProperty(out, "t_null", {value: t_null});
    Object.defineProperty(out, "t_undefined", {value: t_undefined});
    Object.defineProperty(out, "t_boolean", {value: t_boolean});
    Object.defineProperty(out, "t_char", {value: t_char});
    Object.defineProperty(out, "t_string", {value: t_string});
    Object.defineProperty(out, "t_number", {value: t_number});
    Object.defineProperty(out, "t_float", {value: t_float});
    Object.defineProperty(out, "t_integer", {value: t_integer});
    Object.defineProperty(out, "t_object", {value: t_object});
    Object.defineProperty(out, "t_array", {value: t_array});
    Object.defineProperty(out, "t_function", {value: t_function});
    
    out.hidden_properties.push("$__type__");
    out.hidden_properties.push("$__children__");
    out.hidden_properties.push("$__checker__");
        
    function contains (collection, item) {
        return some(collection, function (currentItem) {
            return item === currentItem;
        }) || false;
    }
    
    out.contains = contains;
    

//
// Turns an array of objects into an object where the keys are the
// values of a property of the objects contained wihtin the original array.
//
// Example:
//
//     [{name: "foo"},{name: "bar"}] => {foo: {name: "foo"}, bar: {name: "bar"}}
//

    
    function expose (collection, key) {
        
        var result = {};
        
        each(collection, function (item) {
            result[item[key]] = item;
        });
        
        return result;
    }
    
    out.expose = expose;
    
    
    function filter (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            if (fn(item, key, collection)) {
                items.push(item);
            }
        });
        
        return items;
    }
    
    out.filter = filter;
        
    function find (collection, fn) {
        
        var value;
        
        some(collection, function (item, key) {
            
            if (fn(item, key, collection)) {
                value = item;
                return true;
            }
            
            return false;
        });
        
        return value;
    }
    
    out.find = find;
    
    
    function has (collection, key) {
        return some(collection, function (item, currentKey) {
            return key === currentKey;
        }) || false;
    }
    
    out.has = has;
    
    
    function head (iterable) {
        return iterable[0];
    }
    
    out.head = head;
    
    
    var keys = method(function (collection) {
        
        var result = [];
        
        if (Array.isArray(collection)) {
            collection.forEach(function (item, key) {
                result.push(key);
            });
        }
        else if (typeof collection === "object") {
            for (key in collection) {
                result.push(key);
            }
        }
        
        return result;
    });
    
    Object.defineProperty(out, "keys", {value: keys});
    
    
    function map (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            items.push(fn(item, key, collection));
        });
        
        return items;
    }
    
    out.map = map;
    
    
    function pluck (collection, key) {
        
        var result = [];
        
        map(collection, function (item) {
            if (key in item) {
                result.push(item[key]);
            }
        });
        
        return result;
    }
    
    out.pluck = pluck
    

//
// Turns an object into an array by putting its keys into the objects
// contained within the array.
//
// Example:
//
//     {foo: {}, bar: {}} => [{name: "foo"},{name: "bar"}]
//

    
    function privatize (collection, key) {
        
        var result = [];
        
        each(collection, function (item, currentKey) {
            
            item[key] = currentKey;
            
            result.push(item);
        });
        
        return result;
    }
    
    out.privatize = privatize;
    

//
// ### Function reduce(collection, fn[, value])
//
//     collection -> (any -> any -> string|number -> collection) -> any -> any
//
// Reduces a collection to a single value by applying every item in the collection
// along with the item's key, the previously reduced value (or the start value)
// and the collection itself to a reducer function `fn`.
//

    function reduce (collection, fn, value) {
        
        // If the collection is an array, the native .reduce() method is used for performance:
        if (Array.isArray(collection)) {
            return collection.reduce(fn, value);
        }
        
        each(collection, function (item, key) {
            value = fn(value, item, key, collection);
        });
        
        return value;
    }
    
    out.reduce = reduce;
    
    
    function tail (iterable) {
        return iterable.slice(1);
    }
    
    out.tail = tail;
    

//
// ### Function at(collection, key)
//
//     collection -> string | number -> any
//
// Returns a collection's value at `key`.
//

    var at = method(function (collection, key) {
        return collection[key];
    });
    
    Object.defineProperty(out.core, "at", {value: at});
    

//
// ### Function picker(key)
//
//     string | number -> (collection -> any)
//
// Binds `at` to a `key`.
//

    function picker (key) {
        return partial(at, undefined, key);
    }
    
    Object.defineProperty(out.core, "picker", {value: picker});
    Object.defineProperty(out, "picker", {value: picker});
    

//
// ### Function put(collection, key, value)
//
//     collection -> string -> any -> undefined
//
// Puts a `value` into a collection at `key`.
//

    var put = method(function (collection, key, value) {
        collection[key] = value;
        return collection;
    });
    
    Object.defineProperty(out.core, "put", {value: put});
    

//
// ### Function putter(key)
//
//     string -> (collection -> value -> undefined)
//
// Binds `put` to a key.
//

    function putter (key) {
        return partial(put, undefined, key, undefined);
    }
    
    Object.defineProperty(out.core, "putter", {value: putter});
    Object.defineProperty(out, "putter", {value: putter});
    

//
// ### Function values(collection)
//
//     collection -> [any]
//
// Extracts all values from a collection such as `array` or `object`.
//

    function values (collection) {
        return map(collection, function (item) {
            return item;
        });
    }
    
    Object.defineProperty(out.core, "values", {value: values});
    Object.defineProperty(out, "values", {value: values});
        
    function identical (a, b) {
        return a === b;
    }
    
    function equal (a, b) {
        
        var key, index, isArray, isArgumentsObject;
        
        if (a === b) {
            return true;
        }
        
        if (typeof a !== typeof b) {
            return false;
        }
        
        if (a === null && b !== null) {
            return false;
        }
        
        isArray = Array.isArray(a);
        isArgumentsObject = typeof a === "object" && a.toString() === "[object Arguments]";
        
        if (isArray || isArgumentsObject) {
            
            if (isArray && !Array.isArray(b)) {
                return false;
            }
            
            if (isArgumentsObject && b.toString() !== "[object Arguments]") {
                return false;
            }
            
            if (a.length !== b.length) {
                return false;
            }
            
            for (index = 0; index < a.length; index += 1) {
                if (!equal(a[index], b[index])) {
                    return false;
                }
            }
            
            return true;
        }
        
        if (typeof a === "object") {
            
            if (a.prototype !== b.prototype) {
                return false;
            }
            
            for (key in a) {
                if (!equal(a[key], b[key])) {
                    return false;
                }
            }
            
            for (key in b) {
                if (!equal(a[key], b[key])) {
                    return false;
                }
            }
            
            if (some(out.hidden_properties, function (key) { return a[key] !== b[key]; })) {
                return false;
            }
            
            return true;
        }
        
        return false;
    }
    
    out.equal = equal;
    
    
    var each = method(function (collection, fn) {
        
        var index, length, ids = keys(collection);
        
        for (index = 0, length = ids.length; index < length; index += 1) {
            fn(at(collection, ids[index]), ids[index], collection);
        }
    });
    
    specialize(each, is_array, function (collection, fn) {
        return collection.forEach(fn);
    });
    
    Object.defineProperty(out, "each", {value: each});
    
    
    function every (collection, fn) {
        
        var result = true;
        
        some(collection, function (item, key) {
            
            if (!fn(item, key, collection)) {
                result = false;
                return true;
            }
            
            return false;
        });
        
        return result;
    }
    
    Object.defineProperty(out, "every", {value: every});
    
    
    var some = method(someObject);
    
    specialize(some, Array.isArray, someArray);
    
    Object.defineProperty(out, "some", {value: some});
    
    function someArray (collection, fn) {
        
        var index, length, value;
        
        for (index = 0, length = collection.length; index < length; index += 1) {
            
            value = fn(collection[index], index, collection);
            
            if (value) {
                return true;
            }
        }
        
        return false;
    }
    
    function someObject (collection, fn) {
        
        var ids = keys(collection), value, i, length, key;
        
        for (i = 0, length = ids.length; i < length; i += 1) {
            
            key = ids[i];
            value = fn(at(collection, key), key, collection);
            
            if (value) {
                return true;
            }
        }
        
        return false;
    }
    
    function perform (fn, times) {
        for (var i = 0; i < times; i += 1) {
            fn();
        }
    }
    
    Object.defineProperty(out, "perform", {value: perform});
    
    
    function loop (fn) {
        while (fn()) {
            /* do nothing */
        }
    }
    
    Object.defineProperty(out, "loop", {value: loop});
    
    
    function id (thing) {
        return thing;
    }
    
    out.id = id;
    
    
    function measure (fn) {
        
        var time = Date.now();
        
        fn();
        
        return Date.now() - time;
    }
    
    Object.defineProperty(out, "measure", {value: measure});
    
    
    var print = console.log.bind(console);
    
    Object.defineProperty(out, "print", {value: print});
    

    
    (function () {
        
        var scripts;
        
        if (typeof using === "function") {
            
            scripts = document.getElementsByTagName("script");
            using.modules.enjoy = scripts[scripts.length - 1].src;
            
            using().define("enjoy", function () {
                return out;
            });
        }
        else if (typeof module === "object" && module !== null) {
            module.exports = out;
        }
        else if (typeof define === "function") {
            define(function () {
                return out;
            });
        }
        else if (typeof window === "object" && window !== null) {
            window.enjoy = out;
        }
        
    }());
}());

