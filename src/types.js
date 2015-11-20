    
    function isNull (a) {
        return a === null;
    }
    
    function isUndefined (a) {
        return typeof a === "undefined";
    }
    
    function isBoolean (a) {
        return typeof a === "boolean";
    }
    
    function isNumber (a) {
        return typeof a === "number";
    }
    
    function isInteger (n) {
        return isNumber(n) && n % 1 === 0;
    }
    
    function isFloat (n) {
        return isNumber(n) && n % 1 !== 0;
    }
    
    function isString (a) {
        return typeof a === "string";
    }
    
    function isChar (a) {
        return isString(a) && a.length === 1;
    }
    
    function isCollection (a) {
        return isObject(a) || isArray(a);
    }
    
    function isObject (a) {
        return typeof a === "object" && a !== null;
    }
    
    function isArray (a) {
        return Array.isArray(a);
    }
    
    function isFunction (a) {
        return typeof a === "function";
    }
    
    function isPrimitive (a) {
        return isNull(a) || isUndefined(a) || isNumber(a) || isString(a) || isBoolean(a);
    }
    
    function isType (a) {
        return isObject(a) && a.$__type__ === "type";
    }
    
    function isDerivable (a) {
        return isObject(a) && "$__children__" in a && Array.isArray(a.$__children__);
    }
    
    function isMethod (a) {
        return isObject(a) && a.$__type__ === "method";
    }
    
    function valid (data, schema) {
        
        var key;
        
        if (!isObject(data)) {
            
            if (isType(schema)) {
                return isA(data, schema);
            }
            
            if (isFunction(schema)) {
                return schema(data);
            }
            
            return identical(data, schema);
        }
        else {
            
            for (key in schema) {
                
                if (isType(schema[key])) {
                    
                    if (!isA(data[key], schema[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (isFunction(schema[key])) {
                    
                    if (!schema[key](data[key])) {
                        return false;
                    }
                    
                    continue;
                }
                
                if (isObject(schema[key])) {
                    
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
        
        if (!isFunction(checker)) {
            checker = validator(checker);
        }
        
        Object.defineProperty(obj, "$__type__", {value: "type"});
        Object.defineProperty(obj, "toString", {value: function () { return "[object Type]"; }});
        Object.defineProperty(obj, "$__checker__", {value: checker});
        makeDerivable(obj);
        
        Object.freeze(obj);
        
        return obj;
    }
    
    function makeDerivable (obj) {
        
        if (!isObject(obj) || !Object.isExtensible(obj)) {
            throw new TypeError("Argument 'obj' is not derivable in call to make_derivable(obj).");
        }
        
        Object.defineProperty(obj, "$__children__", {value: []});
    }
    
    function derive (child, parent) {
        
        if (!isDerivable(child)) {
            makeDerivable(child);
        }
        
        if (!isDerivable(parent)) {
            makeDerivable(parent);
        }
        
        if (descendantOf(child, parent)) {
            throw new Error("Child is already a descendent of this parent.");
        }
        
        parent.$__children__.push(child);
    }
    
    function descendantOf (a, b) {
        
        if (!isDerivable(a)) {
            throw new TypeError("Parameter 'a' must be derivable.");
        }
        
        if (!isDerivable(b)) {
            throw new TypeError("Parameter 'b' must be derivable.");
        }
        
        return b.$__children__.some(function (c) {
            return (c === a ? true : c.$__children__.some(bind(descendantOf, a)));
        });
    }
    
    function isA (a, t) {
        
        if (!isDerivable(t)) {
            
            if (typeof t !== "function") {
                return false;
            }
            
            return a instanceof t;
        }
        
        if (isDerivable(a) && descendantOf(a, t)) {
            return true;
        }
        
        if (!isType(t)) {
            return false;
        }
        
        if (t.$__checker__(a)) {
            return true;
        }
        
        return t.$__children__.some(function (child) {
            return isA(a, child);
        });
    }
    
    var t_primitive = type(isPrimitive);
    var t_composite = type(isObject);
    
    var t_null = type(isNull);
    var t_undefined = type(isUndefined);
    
    var t_boolean = type(isBoolean);
    
    var t_char = type(isChar);
    var t_string = type(isString);
    
    var t_number = type(isNumber);
    var t_float = type(isFloat);
    var t_integer = type(isInteger);
    
    var t_object = type(isObject);
    var t_array = type(isArray);
    
    var t_function = type(isFunction);
    
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
    Object.defineProperty(out, "makeDerivable", {value: makeDerivable});
    Object.defineProperty(out, "valid", {value: valid});
    Object.defineProperty(out, "validator", {value: validator});
    
    Object.defineProperty(out, "isA", {value: isA});
    Object.defineProperty(out, "isNull", {value: isNull});
    Object.defineProperty(out, "isUndefined", {value: isUndefined});
    Object.defineProperty(out, "isBoolean", {value: isBoolean});
    Object.defineProperty(out, "isNumber", {value: isNumber});
    Object.defineProperty(out, "isInteger", {value: isInteger});
    Object.defineProperty(out, "isFloat", {value: isFloat});
    Object.defineProperty(out, "isString", {value: isString});
    Object.defineProperty(out, "isChar", {value: isChar});
    Object.defineProperty(out, "isColllection", {value: isCollection});
    Object.defineProperty(out, "isObject", {value: isObject});
    Object.defineProperty(out, "isArray", {value: isArray});
    Object.defineProperty(out, "isFunction", {value: isFunction});
    Object.defineProperty(out, "isPrimitive", {value: isPrimitive});
    Object.defineProperty(out, "isType", {value: isType});
    Object.defineProperty(out, "isDerivable", {value: isDerivable});
    Object.defineProperty(out, "isMethod", {value: isMethod});
    
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
    