/* global describe, it */

var assert = require("assert");

var enjoy = require("../bin/enjoy-core.js");
var apply = enjoy.apply;
var call = enjoy.call;
var bind = enjoy.bind;
var partial = enjoy.partial;
var pipe = enjoy.pipe;
var piped = enjoy.piped;


function add (arg1, arg2, arg3) {
    return arg1 + arg2 + arg3;
}

function addOne (n) {
    return n + 1;
}

function double (n) {
    return 2 * n;
}

describe("Core functions", function () {
    
    describe("call(f, arg1, ..., argN)", function () {
        it("should execute a function given some arguments", function () {
            assert.equal(call(add, "foo", "bar", "baz"), add("foo", "bar", "baz"));
            assert.equal(call(add, 1, 1, 1), add(1, 1, 1));
        });
    });
    
    describe("apply(f, args)", function () {
        it("should call a function with an array as the arguments", function () {
            assert.equal(apply(add, ["foo", "bar", "baz"]), add("foo", "bar", "baz"));
            assert.equal(apply(add, [1, 2, 3]), add(1, 2, 3));
        });
    });
    
    describe("bind(f, arg1, ..., argN)", function () {
        
        it("should bind a function to the given arguments", function () {
            
            var o1 = {name: "object_1"}, o2 = {name: "object_2"};
            
            var add1 = bind(add, "foo", "bar", "baz");
            var add2 = bind(add, 1, 2, 3);
            var add3 = bind(add, 1, 2);
            
            var test1 = bind(test, o1, o2);
            var test2 = bind(test, o1);
            
            function test (a1, a2) {
                assert.equal(o1, a1);
                assert.equal(o2, a2);
            }
            
            assert.equal(add1(), add("foo", "bar", "baz"));
            assert.equal(add2(), add(1, 2, 3));
            assert.equal(add3(3), add(1, 2, 3));
            assert.equal(add3(5), add(1, 2, 5));
            
            test1();
            test2(o2);
        });
    });
    
    describe("partial(f, arg1, ..., argN)", function () {
        it("should bind only non-undefined arguments to a function", function () {
            assert.equal(partial(add, 1, undefined, 3)(2), add(1, 2, 3));
            assert.equal(partial(add, undefined, "bar", "baz")("foo"), add("foo", "bar", "baz"));
        });
    });
    
    describe("pipe(value, f1, ..., fN)", function () {
        it("should call each function with the previous function's return value", function () {
           assert.equal(pipe(1, addOne, double), 4);
           assert.equal(pipe(2, addOne, double), 6);
        });
    });
    
    describe("piped(f1, ..., fN)", function () {
        it("should bind functions to pipe()", function () {
           assert.equal(piped(addOne, double)(1), 4);
           assert.equal(piped(addOne, double)(2), 6);
        });
    });
    
});
