'use strict';
var assert = require('assert');

/**
 * Simple utility for full-document editing with the section API introduced in
 * https://phabricator.wikimedia.org/T94890.
 */

function idIsNearby(id, oldIds, startIdx) {
    // Heuristic: Bound look-ahead, so that moving up a piece of content is
    // not encoded as a large deletion of all preceding ids.
    var maxIdx = Math.min(startIdx + 4, oldIds.length);
    for (var i = startIdx; i < maxIdx; i++) {
        if (oldIds[i] === id) { return true; }
    }
    return false;
}

/**
 * Compute section changes from an array of original IDs & an array of
 * modified nodes.
 *
 * @param {Array<string>} oldIds, the array of original section ids.
 * @param {Array<object>} newNodes, objects with
 *   - {string} id: The id of the node. Absent for new and copy/pasted
 *   (including moved) content.
 *   - {string} html, the outerHTML of this section. Should exclude ID
 *   attributes for copy/pasted (duplicated) content, but can include the ids
 *   for moved content.
 * @return {object} Object with changes to the document, ready to be sent to
 * the REST section to wikitext transform API.
 */
function sectionDiff(oldIds, newNodes) {
    var changes = {};
    var oldIdx = 0;
    var prevNode = {id: 'mw0', changes: []};
    for (var n = 0; n < newNodes.length; n++) {
        // New content / out of order content: Add to prevNode
        while (n < newNodes.length
                && (!newNodes[n].id
                    || !idIsNearby(newNodes[n].id, oldIds, oldIdx))) {
            prevNode.changes.push(newNodes[n]);
            changes[prevNode.id] = prevNode.changes;
            n++;
        }
        if (n === newNodes.length) { break; }

        // Modified sections
        var newNode = newNodes[n];
        if (newNode.html !== undefined) { changes[newNode.id] = [newNode]; }

        // Deletions
        while (oldIds[oldIdx] !== newNode.id && oldIdx < oldIds.length) {
            changes[oldIds[oldIdx]] = [];
            oldIdx++;
        }
        oldIdx++;
        prevNode = {
            id: newNode.id,
            changes: [newNode]
        };
    }
    for (;oldIdx < oldIds.length; oldIdx++) { changes[oldIds[oldIdx]] = []; }
    return changes;
}

module.exports = sectionDiff;
