    
    var METHOD_PRECEDENCE_SCORE_FN = 10;
    var METHOD_PRECEDENCE_SCORE_ID = 8;
    var METHOD_PRECEDENCE_SCORE_EQ = 6;
    var METHOD_PRECEDENCE_SCORE_IS_A = 4;
    
    function method (defaultFn) {
        
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
                    
                    if (isA(dispatchValue, comparator)) {
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
    
    out.hiddenProperties.push("$__comparators__");
    out.hiddenProperties.push("$__default__");
    out.hiddenProperties.push("$__dispatchers__");
    out.hiddenProperties.push("$__implementation__");
    out.hiddenProperties.push("$__implementations__");
    
    Object.defineProperty(out, "specialize", {value: specialize});
    