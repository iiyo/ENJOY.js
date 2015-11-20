/* global require, describe, it */

var assert = require("assert");
var enjoy = require("../bin/enjoy-core.js");
var t_string = enjoy.t_string;
var t_integer = enjoy.t_integer;
var t_number = enjoy.t_number;
var valid = enjoy.valid;
var validator = enjoy.validator;

var personSchema = {
    type: "person",
    firstName: t_string,
    lastName: t_string,
    age: t_integer 
};

var validJames = {
    type: "person",
    firstName: "James",
    lastName: "Doe",
    age: 42,
    occupation: "Programmer"
};

var invalidJames = {
    type: "person",
    firstName: 23,
    lastName: "Doe",
    age: "42"
};

var isPerson = validator(personSchema);

var coordinateSchema = [t_number, t_number, t_number];

var validCoordinates = [
    [0, 0, 0],
    [-1, 0, 1],
    [2, 2, 2],
    [2.2, 2.3, 2.1],
    [-3.2, 2, 4.4]
];

var invalidCoordinates = [
    ["foo", 2, 3],
    [1, 2]
];

var isCoordinateTuple = validator(coordinateSchema);


describe("validators", function () {
    
    describe("valid(data, schema)", function () {
        
        it("should validate objects according to a schema", function () {
            assert(valid(validJames, personSchema));
            assert(valid(invalidJames, personSchema) === false);
            assert(valid("23", t_string));
        });
        
        it("should validate arrays according to a schema", function () {
            
            validCoordinates.forEach(function (c) {
                assert(valid(c, coordinateSchema));
            });
            
            invalidCoordinates.forEach(function (c) {
                assert(valid(c, coordinateSchema) === false);
            });
        });
        
        it("should validate primitive values using a type or predicate", function () {
            assert(valid("23", t_string));
            assert(valid(23, t_integer));
            assert(valid("23", t_integer) === false);
            assert(valid(23, t_string) === false);
        });
    });
    
    describe("validator(schema)", function () {
        it("should bind valid() to a schema", function () {
            assert(typeof isPerson === "function");
            assert(isPerson(validJames));
            assert(isPerson(invalidJames) === false);
        });
    });
    
});

    