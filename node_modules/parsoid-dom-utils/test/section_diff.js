'use strict';

const assert = require('assert');
const sectionDiff = require('../').sectionDiff;

const origIds = ['a','b','c','d','e','f'];

// Basic tests
module.exports = {
    'Section diff': {
        'No change': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id:'a'},
                        {id:'b'},
                        {id:'c'},
                        {id:'d'},
                        {id:'e'},
                        {id:'f'}
            ]), {});
        },
        'Single deleted section': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id:'b'},
                        {id:'c'},
                        {id:'d'},
                        {id:'e'},
                        {id:'f'}
            ]), {a:[]});
        },
        'Single deleted section, middle': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id:'a'},
                        {id:'c'},
                        {id:'d'},
                        {id:'e'},
                        {id:'f'}
            ]), {'b':[]});
        },
        'Delete everything': () => {
            assert.deepEqual(sectionDiff(origIds, []), {a:[],b:[],c:[],d:[],e:[],f:[]});
        },
        'Replace first section': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {html:'foo'},
                        {id:'b'},
                        {id:'c'},
                        {id:'d'},
                        {id:'e'},
                        {id:'f'}
            ]), {mw0:[{html: 'foo'}],a:[]});
        },
        'Edit + section replacement': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id:'a'},
                        {id:'b', html: 'bar'},
                        {id:'d', html: 'deee'},
                        {id:'e'},
                        {id:'f'}
            ]), {b:[{id:'b',html:'bar'}],c:[],d:[{id:'d',html:'deee'}]});
        },
        'Delete last section': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id:'a'},
                        {id:'b'},
                        {id:'c'},
                        {id:'d'},
                        {id:'e'}
            ]), {f:[]});
        },
        'Delete and replace': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id:'a'},
                        {id:'b'},
                        {id:'c'},
                        {id:'f', html: 'foo'},
                        {id:'e'}
            ]), {d:[],e:[],f:[{id: 'f', html: 'foo'},{id:'e'}]});
        },
        'Delete and replace 2': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id: 'a'},
                        {id: 'b'},
                        {id: 'd', html: 'deee'},
                        {id: 'c'},
                        {id: 'e'},
                        {id: 'f'},
                        {id: 'c', html: 'ceee'},
            ]), {c:[],d:[{id: 'd', html: 'deee'},{id:'c'}],f:[{id: 'f'},{id: 'c', html: 'ceee'}]});
        },
        'Prepend & delete last section': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {html: 'foo'},
                        {id:'a'},
                        {id:'b'},
                        {id:'c'},
                        {id:'d'},
                        {id:'e'}
            ]), {'mw0':[{html:'foo'}],f: []});
        },
        'Reorder sections 1': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id:'a'},
                        {id: 'b'},
                        {html: 'foo'},
                        {id:'e'},
            ]), {'b':[{id:'b'},{html:'foo'}], c:[], d:[], f:[]});
        },
        'Reorder sections 2': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id: 'b'},
                        {id: 'a'},
                        {id: 'c'},
                        {id: 'e'},
                        {html: 'foo'},
            ]), {'a':[],'b':[{id:'b'},{id: 'a'}], d:[], e:[{id: 'e'},{html: 'foo'}], f: []});
        },
        'Reorder sections 3': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id: 'a'},
                        {id: 'b'},
                        {html: 'foo'},
                        {id: 'e'},
                        {id: 'c'},
            ]), {'b':[{id:'b'},{html: 'foo'}], c:[], d:[], e:[{id: 'e'},{id: 'c'}], f: []});
        },
        'Reorder sections 4': () => {
            assert.deepEqual(sectionDiff(origIds, [
                        {id: 'f'},
                        {id: 'b'},
                        {id: 'e'},
                        {html: 'foo'},
                        {id: 'a'},
            ]), {mw0: [{id: 'f'}],a:[],c:[],d:[],e:[{id: 'e'},{html: 'foo'},{id: 'a'}],f:[]});
        }
    }
};
