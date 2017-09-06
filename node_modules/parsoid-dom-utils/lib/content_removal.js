'use strict';

/**
 * Temporary parking ground for misc content removal utilities.
 *
 * TODO: Structure this better.
 */


/**
 * Remove transclusion data-mw provided by Parsoid.
 *
 * @param {document} doc
 * @param {Object} names, an object with truthy values for all template names
 * to remove.
 */
function rmTransclusions(doc, names) {
    var nodes = doc.querySelectorAll('[typeof~=mw:Transclusion]');
    var dataMW;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        dataMW = node.getAttribute('data-mw');
        if (dataMW) {
            var name;
            try {
                name = JSON.parse(dataMW).parts[0].template.target.wt.trim().toLowerCase();
            } catch (e) {}
            if (name && names[name]) {
                // remove siblings if the about matches
                var about = node.getAttribute('about');
                var next = node.nextSibling;
                while (next
                && ( // Skip over inter-element whitespace
                next.nodeType === doc.TEXT_NODE && /^\w+$/.test(next.nodeValue))
                    // same about
                || next.getAttribute && next.getAttribute('about') === about) {
                    if (next.nodeType !== 3) {
                        node.parentNode.removeChild(next);
                    }
                    next = node.nextSibling;
                }
                // finally, remove the transclusion node itself
                node.parentNode.removeChild(node);
            }
        }
    }
}

