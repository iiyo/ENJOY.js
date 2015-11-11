/* global require, describe, it */

var assert = require("assert");
var enjoy = require("../bin/enjoy-core.js");

var type = enjoy.type;
var is_a = enjoy.is_a;
var is_number = enjoy.is_number;
var is_integer = enjoy.is_integer;
var is_float = enjoy.is_float;

describe("types", function () {
    
    describe("type(checker)", function () {
        
        it("is_a() should always return false with a type that has no checker", function () {
            
            var t = type();
            
            [
                -12.2, -12, -5, -1, 0, 1, 2, 3, 5, 20, 100, 20000,
                "foo", "bar", "baz",
                {}, {a: 1}, {a: 1, b: null},
                null,
                undefined,
                NaN,
                [], [1], [1, 2, 3], [null, null], [undefined, null], [{a: 1}, {a: null}],
                /^a/, /args/i
            ].
            forEach(function (value) {
                assert.equal(is_a(value, t), false);
            });
        });
        
        it("work with predicate functions as the checker", function () {
            
            var t_int = type(is_integer);
            
            [
                -2000000, -20, -10, -1, 0, 1, 2, 3, 5, 10, 20, 100, 1000000
            ].
            forEach(function (value) {
                assert(is_a(value, t_int) === true, "value: " + value);
            });
            
            [
                -2000000.324, -20.5676, -10.0001, -1.11132, 0.01, 1.002, 2.02, 10.33, 1000000.01
            ].
            forEach(function (value) {
                assert(is_a(value, t_int) === false, "value: " + value);
            });
        });
    });
    
});
