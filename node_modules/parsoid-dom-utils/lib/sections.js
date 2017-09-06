'use strict';

var domino = require('domino');

/**
 * Get a node or parentNode that's a direct child of body.
 *
 * @param {Node} node
 * @return {Node} child of body, possibly a parent of forNode.
 */
function getWrapper(forNode) {
    var node = forNode;
    while (node && node.parentNode && node.parentNode.nodeName !== 'BODY') {
        node = node.parentNode;
    }
    return node;
}

function isEmpty(node) {
    return node.childNodes.length === 0 || /^\s*$/.test(node.innerHTML);
}


/**
 * Wrap headings into sections elements, resulting in a sequence of sections
 * wrapping all children of body.
 *
 * @param {Document} doc
 * @return {Document} doc
 */
function wrapSections(doc) {
    var headings = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6');

    // Build up a list of top-level section delimiter nodes.
    var level;
    var delimiters = [];
    var lastWrapper;
    headings.forEach(function(hNode) {
        if (!level || hNode.nodeName <= level) {
            level = hNode.nodeName;
            var wrapper = getWrapper(hNode);
            if (wrapper !== lastWrapper) {
                lastWrapper = wrapper;
                delimiters.push({
                    node: hNode,
                    wrapper: wrapper,
                });
            }
        } else if (hNode.parentNode.nodeName === 'BODY') {
            lastWrapper = hNode;
            delimiters.push({
                node: hNode,
                wrapper: hNode,
            });
        }
        // Don't wrap nested headings of a lower level for now.
    });

    // Now walk the children of body, and wrap each section into a <section>
    // element.
    var nextDelim = delimiters.shift();
    var sections = [{
        node: doc.createElement('section'),
        level: ''
    }];
    var section = sections[0];
    var node = doc.body.firstChild;
    while (node) {
        var nextNode = node.nextSibling;

        if (nextDelim && node === nextDelim.wrapper) {

            // If end of lead section, or new section is higher level
            if (!section.level || node.nodeName <= section.level) {
                // Try to combine previous sections
                while (sections.length > 1
                        && sections[sections.length - 2].level >= node.nodeName) {
                    section = sections[sections.length - 2];
                    section.node.appendChild(sections.pop().node);
                }
                // Attach previous sections to DOM
                if (sections.length > 1) {
                    // Append nested section to parent section's node
                    section = sections[sections.length - 2];
                    section.node.appendChild(sections.pop().node);
                } else {
                    // Top level section. Append to the document.
                    section = sections.pop();
                    doc.body.insertBefore(section.node, node);
                }
            }
            if (!section.level && isEmpty(section.node)) {
                // Reuse empty or ws-only lead section, avoiding empty lead
                // sections while preserving whitespace.
                section.level = node.nodeName;
            } else {
                // Start a new section
                section = {
                    node: doc.createElement('section'),
                    level: node.nodeName,
                };
            }
            sections.push(section);
            nextDelim = delimiters.shift();
        }

        section.node.appendChild(node);

        if (!nextNode) {
            while (sections.length > 1) {
                section = sections[sections.length - 2];
                section.node.appendChild(sections.pop().node);
            }
            doc.body.appendChild(section.node);
        }

        node = nextNode;
    }
    return doc;
}



module.exports = {
    wrap: wrapSections,
};
