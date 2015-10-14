    
    
    //
    // We use a bit-partitioned vector trie to implement efficient persistent vectors.
    //
    
    var V_BITS = 5;
    var V_WIDTH = 1 << V_BITS;
    var V_MASK = V_WIDTH - 1;
    
    function v () {
        
        var index;
        var level = 0;
        var obj = {};
        var root = [];
        var tail = root;
        var length = arguments.length;
        
        for (index = 0; index < length; index += 1) {
            
        }
        
        Object.defineProperty(obj, "$__type__", {value: "vector"});
        Object.defineProperty(obj, "$__root__", {value: root});
        Object.defineProperty(obj, "$__tail__", {value: tail});
        
        Object.freeze(obj);
        
        return obj;
    }
    
    Object.freeze(v);
    
    Object.defineProperty(out, "V_BITS", {value: V_BITS});
    Object.defineProperty(out, "V_WIDTH", {value: V_WIDTH});
    Object.defineProperty(out, "V_MASK", {value: V_MASK});
    Object.defineProperty(out, "v", {value: v});
    