'use strict';
var domino = require('domino');
var domUtils = require('../index');
var assert = require('assert');
var yaml = require('js-yaml');
var fs = require('fs');
var testData = yaml.safeLoad(fs.readFileSync(__dirname + '/sections.yaml'));

var tests = {};
Object.keys(testData).forEach(function(name) {
    var test = testData[name];
    tests[name] = function() {
        var doc = domino.createDocument(test.input.trim());
        var processed = domUtils.sections[test.symbol](doc).outerHTML;
        assert.equal(processed, test.output.trim());
    };
});


module.exports = {
    sections: tests,
};
