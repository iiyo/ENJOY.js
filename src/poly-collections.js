//
// ## Polymorphic versions (methods) of ENJOY collection functions
//
    
    var p_each = method(each);
    
    Object.defineProperty(out, "p_each", {value: p_each});
    Object.defineProperty(out.poly, "each", {value: p_each});
    
    var p_some = method(some);
    
    Object.defineProperty(out, "p_some", {value: p_some});
    Object.defineProperty(out.poly, "some", {value: p_some});
    
    var p_every = method(every);
    
    Object.defineProperty(out, "p_every", {value: p_every});
    Object.defineProperty(out.poly, "every", {value: p_every});
    