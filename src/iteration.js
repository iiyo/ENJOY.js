    
    function each (collection, fn) {
        
        if (Array.isArray(collection)) {
            return collection.forEach(fn);
        }
        
        if (typeof collection.length === "number" && collection.length > 0) {
            return eachIterable(collection, fn);
        }
        
        return eachObject(collection, fn);
    }
    
    out.each = each;
    
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
    
    out.every = every;
    
    
    function some (collection, fn) {
        return Array.isArray(collection) ? someArray(collection, fn) : someObject(collection, fn);
    }
    
    out.some = some;
    
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
        
        var key, value;
        
        for (key in collection) {
            
            value = fn(collection[key], key, collection);
            
            if (value) {
                return true;
            }
        }
        
        return false;
    }
    
