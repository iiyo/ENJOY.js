

var $__ShinyScripts = document.getElementsByTagName('script');
var $__ShinyPath = $__ShinyScripts[$__ShinyScripts.length - 1].src;

using.modules['shiny.apply'] = $__ShinyPath;
using.modules['shiny.bind'] = $__ShinyPath;
using.modules['shiny.call'] = $__ShinyPath;
using.modules['shiny.each'] = $__ShinyPath;
using.modules['shiny.filter'] = $__ShinyPath;
using.modules['shiny.has'] = $__ShinyPath;
using.modules['shiny.keys'] = $__ShinyPath;
using.modules['shiny.map'] = $__ShinyPath;
using.modules['shiny.pipe'] = $__ShinyPath;
using.modules['shiny.piped'] = $__ShinyPath;
using.modules['shiny.reduce'] = $__ShinyPath;
using.modules['shiny.some'] = $__ShinyPath;
using.modules['shiny.values'] = $__ShinyPath;

/* global using */

using().define("shiny.apply", function () {
    
    function apply (fn, args) {
        return fn.apply(args);
    }
    
    return apply;
    
});


/* global using */

using("shiny.apply").define("shiny.bind", function (apply) {
    
    function bind (fn) {
        
        var args = [].slice.call(arguments);
        
        args[0] = undefined;
        args.unshift(undefined);
        
        return apply(fn.bind, args);
    }
    
    return bind;
    
});


/* global using */

using().define("shiny.call", function () {
    
    function call (fn) {
        
        var args = [].slice.call(arguments);
        
        args.shift();
        
        return fn.apply(args);
    }
    
    return call;
    
});


/* global using */

using().define("shiny.each", function () {
    
    function each (collection, fn) {
        
        if (Array.isArray(collection)) {
            return collection.forEach(fn);
        }
        
        if (typeof collection.length === "number" && collection.length > 0) {
            return eachIterable(collection, fn);
        }
        
        return eachObject(collection, fn);
    }
    
    return each;
    
    function eachIterable (collection, fn) {
        for (var index = 0; index < collection.length; index += 1) {
            fn(collection[index], index, collection);
        }
    }
    
    function eachObject (collection, fn) {
        for (var key in collection) {
            fn(collection[key], key, collection);
        }
    }
    
});


/* global using */

using("shiny.each").define("shiny.filter", function (each) {
    
    function filter (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            if (fn(item, key, collection)) {
                items.push(item);
            }
        });
        
        return items;
    }
    
    return filter;
    
});


/* global using */

using("shiny.some").define("shiny.has", function (some) {
    
    function has (collection, key) {
        return some(collection, function (item, currentKey) {
            return key === currentKey;
        });
    }
    
    return has;
    
});


/* global using */

using("shiny.map").define("shiny.keys", function (map) {
    
    function keys (collection) {
        return map(collection, function (item, key) {
            return key;
        });
    }
    
    return keys;
    
});


/* global using */

using("shiny.each").define("shiny.map", function (each) {
    
    function map (collection, fn) {
        
        var items = [];
        
        each(collection, function (item, key) {
            items.push(fn(item, key, collection));
        });
        
        return items;
    }
    
    return map;
});


/* global using */

using("shiny.each").define("shiny.pipe", function (each) {
    
    function pipe (value) {
        
        each(arguments, function (fn, index) {
            if (index > 0) {
                value = fn(value);
            }
        });
        
        return value;
    }
    
    return pipe;
    
});


/* global using */

using("shiny.pipe", "shiny.apply").define("shiny.piped", function (pipe, apply) {
    
    function piped () {
        
        var functions = [].slice.call(arguments);
        
        return function (value) {
            
            var args = functions.slice();
            
            args.unshift(value);
            
            return apply(pipe, args);
        };
    };
    
    return piped;
});


/* global using */

using("shiny.each").define("shiny.reduce", function (each) {
    
    function reduce (collection, fn, value) {
        each(collection, function (item, key) {
            value = fn(value, item, key, collection);
        });
    }
    
    return reduce;
    
});


/* global using */

using().define("shiny.some", function () {
    
    function some (collection, fn) {
        return Array.isArray(collection) ? someArray(collection, fn) : someObject(collection, fn);
    }
    
    return some;
    
    function someArray (collection, fn) {
        
        var index, length, value;
        
        for (index = 0, length = collection.length; index < length; index += 1) {
            
            value = fn(collection[index], index, collection);
            
            if (value) {
                return value;
            }
        }
    }
    
    function someObject (collection, fn) {
        
        var key, value;
        
        for (key in collection) {
            
            value = fn(collection[key], key, collection);
            
            if (value) {
                return value;
            }
        }
    }
    
});


/* global using */

using("shiny.map").define("shiny.values", function (map) {
    
    function values (collection) {
        return map(collection, function (item) {
            return item;
        });
    }
    
    return values;
    
});
