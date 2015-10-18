    
    
    //
    // We use a bit-partitioned vector trie to implement efficient persistent vectors.
    // This implementation is pretty much the same as the one by Rich Hickey in the
    // Java implementation of Clojure.
    //
    
    var V_BITS = 5;
    var V_WIDTH = 1 << V_BITS;
    var V_MASK = V_WIDTH - 1;
    
    function v () {
        
        var items = [].slice.call(arguments);
        var root = v_node();
        var vec = v_create(0, 0, root, root);
        
        items.forEach(function (item) {
            vec = v_append(vec, item);
        });
        
        return vec;
    }
    
    function is_vector (thing) {
        return is_object(thing) && thing.$__type__ === "vector";
    }
    
    var t_vector = type(is_vector);
    
    function v_at (vec, i) {
        return v_node_at(vec, i).content[i & V_MASK];
    }
    
    specialize(at, t_vector, v_at);
    
    function v_node_at (vec, i) {
        
        var level;
        var node = vec.$__root__;
        var shift = vec.$__shift__;
        
        if (i >= 0 && i < vec.$__count__) {
            
            if (i >= v_tail_off(vec)) {
                return vec.$__tail__;
            }
            
            for (level = shift; level > 0; level -= V_BITS) {
                node = node.content[(i >>> level) & V_MASK];
            }
            
            return node.content;
        }
        
        throw new RangeError("Vector index out of bounds:", i);
    }
    
    function v_tail_off (vec) {
        
        if (vec.$__count__ < V_WIDTH) {
            return 0;
        }
        
        return ((vec.$__count__ - 1) >>> V_BITS) << V_BITS;
    }
    
    function v_create (count, shift, root, tail) {
        
        var vec = Object.create(null);
        
        Object.defineProperty(vec, "$__type__", {value: "vector"});
        Object.defineProperty(vec, "$__count__", {value: count});
        Object.defineProperty(vec, "$__shift__", {value: shift});
        Object.defineProperty(vec, "$__root__", {value: root});
        Object.defineProperty(vec, "$__tail__", {value: tail});
        
        return Object.freeze(vec);
    }
    
    function v_append (vec, value) {
        
        var tail = vec.$__tail__;
        var root = vec.$__root__;
        var count = vec.$__count__;
        var shift = vec.$__shift__;
        var new_tail, new_shift, new_root, expansion;
        
        if (tail.content.length < V_WIDTH) {
            new_tail = v_node(tail.content);
            new_tail.content.push(value);
            return v_create(count + 1, shift, root, new_tail);
        }
        
        expansion = {};
        new_tail = v_node([value]);
        new_shift = shift;
        new_root = v_push_tail(shift - V_BITS, root, tail, expansion);
        
        if (expansion.val !== null) {
            new_root = v_node([new_root, expansion.val]);
            new_shift += V_BITS;
        }
        
        return v_create(count + 1, new_shift, new_root, new_tail);
    }
    
    function v_push_tail (level, root, tail, expansion) {
        
        var new_child, ret;
        
        if (level === 0) {
            new_child = tail;
        }
        else {
            
            new_child = v_push_tail(level - V_BITS, v_node(), tail, expansion);
            
            if (expansion.val === null) {
                ret = v_node(root.content);
                ret.push(new_child);
                return ret;
            }
            else {
                new_child = expansion.val;
            }
        }
        
        if (root.content.length == V_WIDTH) {
            expansion.val = v_node([new_child]);
            return root;
        }
        
        expansion.val = null;
        ret = v_node(root.content);
        
        ret.content.push(new_child);
        
        return ret;
    }
    
    function v_node (content) {
        
        var node = {
            content: content ? content.slice() : []
        };
        
        Object.defineProperty(node, "$__type__", {value: "v_node"});
        
        return Object.freeze(node);
    }
    
    Object.freeze(v);
    
    Object.defineProperty(out, "V_BITS", {value: V_BITS});
    Object.defineProperty(out, "V_WIDTH", {value: V_WIDTH});
    Object.defineProperty(out, "V_MASK", {value: V_MASK});
    Object.defineProperty(out, "v", {value: v});
    Object.defineProperty(out, "is_vector", {value: is_vector});
    Object.defineProperty(out, "t_vector", {value: t_vector});
    