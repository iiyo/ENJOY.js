    
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
    
