    
    var METHOD_PRECEDENCE_SCORE_FN = 10;
    var METHOD_PRECEDENCE_SCORE_ID = 8;
    var METHOD_PRECEDENCE_SCORE_EQ = 6;
    var METHOD_PRECEDENCE_SCORE_IS_A = 4;
    
    function method (defaultFn) {
        
        var dispatchers = [].slice.call(arguments, 1);
        
        function fn () {
            
            var argsLength = arguments.length;
            var implementation = fn.$__default__;
            var highestScore = 0;
            
            var dispatchValues = map(arguments, function (arg, i) {
                
                var dispatcher = fn.$__dispatchers__[i] || id;
                
                //console.log(dispatcher);
                
                return call(dispatcher, arg);
            });
            
            //console.log("dispatchValues:", dispatchValues);
            
            some(fn.$__implementations__, function (impl) {
                
                var currentScore = 0;
                var predicateMatches = 0;
                
                if (argsLength < impl.$__comparators__.length) {
                    return false;
                }
                
                var match = every(dispatchValues, function (dispatchValue, i) {
                    
                    var comparator = impl.$__comparators__[i];
                    var comparatorIsFunction = typeof comparator === "function";
                    var argumentOrderModificator = dispatchValues.length - i;
                    
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
                    
                    if (is_a(dispatchValue, comparator)) {
                        currentScore += METHOD_PRECEDENCE_SCORE_IS_A * argumentOrderModificator;
                        return true;
                    }
                    
                    return false;
                });
                
                if (currentScore > highestScore) {
                    highestScore = currentScore;
                    implementation = impl.$__implementation__;
                }
                
                //console.log("currentScore:", currentScore);
                
                if (predicateMatches > 0 && predicateMatches === dispatchValues.length) {
                    //console.log("Found full predicate match. Stopping implementation search.");
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
        
        dispatchers.unshift(fn);
        
        apply(dispatch, dispatchers);
        
        return fn;
    }
    
    out.method = method;
    
    function dispatch (method) {
        
        var dispatchers = [].slice.call(arguments, 1);
        
        each(dispatchers, function (dispatcher, index) {
            
            var dtype = typeof dispatcher;
            
            console.log("dispatcher:", dtype, dispatcher);
            
            if (dtype !== "function" && (dtype === "string" || dtype === "number")) {
                dispatcher = partial(pluck, undefined, dispatcher);
            }
            else if (dtype !== "function") {
                throw new TypeError("Dispatchers must be strings, numbers or functions.");
            }
            
            dispatchers[index] = dispatcher;
        });
        
        method.$__dispatchers__ = dispatchers;
    }
    
    out.dispatch = dispatch;
        
    function specialize () {
        
        var args = [].slice.call(arguments);
        var method = args.shift();
        var implementation = args.pop();
        var comparators = args.slice();
        var specialization;
        
        var old = find(
            method.$__implementations__,
            function (impl) {
                return every(impl.$__comparators__, function (comp, i) {
                    return equal(comp, comparators[i]);
                });
            }
        );
        
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
    
    out.hidden_properties.push("$__comparators__");
    out.hidden_properties.push("$__default__");
    out.hidden_properties.push("$__dispatchers__");
    out.hidden_properties.push("$__implementation__");
    out.hidden_properties.push("$__implementations__");
    
    out.specialize = specialize;
    