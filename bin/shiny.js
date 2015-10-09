

var $__ShinyScripts = document.getElementsByTagName('script');
var $__ShinyPath = $__ShinyScripts[$__ShinyScripts.length - 1].src;

using.modules['shiny.apply'] = $__ShinyPath;
using.modules['shiny.bind'] = $__ShinyPath;
using.modules['shiny.call'] = $__ShinyPath;
using.modules['shiny.contains'] = $__ShinyPath;
using.modules['shiny.each'] = $__ShinyPath;
using.modules['shiny.every'] = $__ShinyPath;
using.modules['shiny.expose'] = $__ShinyPath;
using.modules['shiny.filter'] = $__ShinyPath;
using.modules['shiny.has'] = $__ShinyPath;
using.modules['shiny.head'] = $__ShinyPath;
using.modules['shiny.keys'] = $__ShinyPath;
using.modules['shiny.map'] = $__ShinyPath;
using.modules['shiny.partial'] = $__ShinyPath;
using.modules['shiny.pipe'] = $__ShinyPath;
using.modules['shiny.piped'] = $__ShinyPath;
using.modules['shiny.pluck'] = $__ShinyPath;
using.modules['shiny.privatize'] = $__ShinyPath;
using.modules['shiny.reduce'] = $__ShinyPath;
using.modules['shiny.some'] = $__ShinyPath;
using.modules['shiny.tail'] = $__ShinyPath;
using.modules['shiny.values'] = $__ShinyPath;

/* global using */

using().define("shiny.apply", function () {
    
    function apply (fn, args) {
        return fn.apply(undefined, args);
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
        
        return fn.apply(undefined, args);
    }
    
    return call;
    
});


/* global using */

using("shiny.some").define("shiny.contains", function (some) {
    
    function contains (collection, item) {
        return some(collection, function (currentItem) {
            return item === currentItem;
        }) || false;
    }
    
    return contains;
    
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

using("shiny.some").define("shiny.every", function (some) {
    
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
    
    return every;
    
});


//
// Turns an array of objects into an object where the keys are the
// values of a property of the objects contained wihtin the original array.
//
// Example:
//
//     [{name: "foo"},{name: "bar"}] => {foo: {name: "foo"}, bar: {name: "bar"}}
//

/* global using */

using("shiny.each").define("shiny.expose", function (each) {
    
    function expose (collection, key) {
        
        var result = {};
        
        each(collection, function (item) {
            result[item[key]] = item;
        });
        
        return result;
    }
    
    return expose;
    
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
        }) || false;
    }
    
    return has;
    
});


/* global using */

using().define("shiny.head", function () {
    
    function head (iterable) {
        return iterable[0];
    }
    
    return head;
    
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

using("shiny.apply").define("shiny.partial", function (apply) {
    
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
    
    return partial;
    
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

using("shiny.each").define("shiny.pluck", function (map) {
    
    function pluck (collection, key) {
        
        var result = [];
        
        map(collection, function (item) {
            if (key in item) {
                result.push(item[key]);
            }
        });
        
        return result;
    }
    
    return pluck;
    
});


//
// Turns an object into an array by putting its keys into the objects
// contained within the array.
//
// Example:
//
//     {foo: {}, bar: {}} => [{name: "foo"},{name: "bar"}]
//

/* global using */

using("shiny.each").define("shiny.privatize", function (each) {
    
    function privatize (collection, key) {
        
        var result = [];
        
        each(collection, function (item, currentKey) {
            
            item[key] = currentKey;
            
            result.push(item);
        });
        
        return result;
    }
    
    return privatize;
    
});


/* global using */

using("shiny.each").define("shiny.reduce", function (each) {
    
    function reduce (collection, fn, value) {
        
        each(collection, function (item, key) {
            value = fn(value, item, key, collection);
        });
        
        return value;
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
        
        return false;
    }
    
    function someObject (collection, fn) {
        
        var key, value;
        
        for (key in collection) {
            
            value = fn(collection[key], key, collection);
            
            if (value) {
                return value;
            }
        }
        
        return false;
    }
    
});


/* global using */

using().define("shiny.tail", function () {
    
    function tail (iterable) {
        return iterable.slice(1);
    }
    
    return tail;
    
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
