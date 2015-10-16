    
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
    
    
    function perform (fn, times) {
        for (var i = 0; i < times; i += 1) {
            fn();
        }
    }
    
    Object.defineProperty(out, "perform", {value: perform});
    
    
    function loop (fn) {
        while (fn()) {
            // do nothing
        }
    }
    
    Object.defineProperty(out, "loop", {value: loop});
    
