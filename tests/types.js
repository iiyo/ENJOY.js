/* global require, describe, it */

var assert = require("assert");
var enjoy = require("../bin/enjoy-core.js");

var type = enjoy.type;
var is_a = enjoy.is_a;
var is_null = enjoy.is_null;
var is_undefined = enjoy.is_undefined;
var is_boolean = enjoy.is_boolean;
var is_number = enjoy.is_number;
var is_integer = enjoy.is_integer;
var is_float = enjoy.is_float;

describe("types", function () {
    
    describe("predicates", function () {
        
        it("is_null(a)", function () {
            
            assert(is_null(null), "is_null(null)");
            
            [
                NaN, undefined, -10, -1.1, -1, 0, 1, 1.2, 10, "foo", "bar",
                {}, {a: 1, b: 2}, [], [1, 2, 3, "foo"], false, true, Infinity, -Infinity, /^abc/
            ].
            forEach(function (value) {
                assert(is_null(value) === false, "is_null(" + value + ")");
            });
        });
        
        it("is_undefined(a)", function () {
            
            assert(is_undefined(undefined), "is_undefined(undefined)");
            
            [
                NaN, null, -10, -1.1, -1, 0, 1, 1.2, 10, "foo", "bar",
                {}, {a: 1, b: 2}, [], [1, 2, 3, "foo"], false, true, Infinity, -Infinity, /^abc/
            ].forEach(function (value) {
                assert(is_undefined(value) === false, "is_undefined(" + value + ")");
            });
        });
        
        it("is_boolean(a)", function () {
            
            assert(is_boolean(true), "is_boolean(true)");
            assert(is_boolean(false), "is_boolean(false)");
            
            [
                NaN, null, undefined, -10, -1.1, -1, 0, 1, 1.2, 10, "foo", "bar",
                {}, {a: 1, b: 2}, [], [1, 2, 3, "foo"], Infinity, -Infinity, /^abc/
            ].forEach(function (value) {
                assert(is_boolean(value) === false, "is_boolean(" + value + ")");
            });
        });
        
        it("is_number(a)", function () {
            
            [
                -5e13, -20, -10, -5, -1, 0, 1, 2, 3, 10, 20, 5e10, 0x0888, NaN,
                -10.223, -5.4, -1.111, -1.000, 0.000, 0.002, Math.PI, Infinity, -Infinity
            ].forEach(function (value) {
                assert(is_number(value) === true, "is_number(" + value + ")");
            });
            
            [
                null, "foo", "bar", true, false, {}, {a: 1, b: 2}, [], [1, 2, 3, "foo"], /^abc/
            ].forEach(function (value) {
                assert(is_number(value) === false, "is_number(" + value + ")");
            });
        });
    });
    
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
        
        it("should work with predicate functions as the checker", function () {
            
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
        
        it("should work with schemas as the checker", function () {
            
            var t_something = type({
                a: is_integer,
                b: 3
            });
            
            function c (a, b) {
                return {a: a, b: b};
            }
            
            function d (a, b, c) {
                return {a: a, b: b, c: c};
            }
            
            [
                c(1, 3), c(-10, 3), c(0, 3), c(1, 3), c(-1, 3), c(100, 3), c(1023, 3), d(4, 3, 14)
            ].
            forEach(function (value) {
                assert(is_a(value, t_something) === true, "values: " + value.a + ", " + value.b);
            });
            
            [
                c(1.01, 3), c(-1.2, 3), c(-1, 4), c("foo", 3), c(-1.1, 3.4), c([], {}), d(2.2, 3, 1)
            ].
            forEach(function (value) {
                assert(is_a(value, t_something) === false, "values: " + value.a + ", " + value.b);
            });
        });
    });
    
});
