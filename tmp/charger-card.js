/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = typeof window !== 'undefined' &&
    window.customElements != null &&
    window.customElements.polyfillWrapFlushCallback !==
        undefined;
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */
const removeNodes = (container, start, end = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */
const boundAttributeSuffix = '$lit$';
/**
 * An updatable Template that tracks the location of dynamic parts.
 */
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        const nodesToRemove = [];
        const stack = [];
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        // Keeps track of the last index associated with a part. We try to delete
        // unnecessary nodes, but we never want to associate two different parts
        // to the same index. They must have a constant node between.
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings, values: { length } } = result;
        while (partIndex < length) {
            const node = walker.nextNode();
            if (node === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                if (node.hasAttributes()) {
                    const attributes = node.attributes;
                    const { length } = attributes;
                    // Per
                    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                    // attributes are not guaranteed to be returned in document order.
                    // In particular, Edge/IE can return them out of order, so we cannot
                    // assume a correspondence between part index and attribute index.
                    let count = 0;
                    for (let i = 0; i < length; i++) {
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while (count-- > 0) {
                        // Get the template literal section leading up to the first
                        // expression in this attribute
                        const stringForPart = strings[partIndex];
                        // Find the attribute name
                        const name = lastAttributeNameRegex.exec(stringForPart)[2];
                        // Find the corresponding attribute
                        // All bound attributes have had a suffix added in
                        // TemplateResult#getHTML to opt out of special attribute
                        // handling. To look up the attribute value we also need to add
                        // the suffix.
                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        const attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        const statics = attributeValue.split(markerRegex);
                        this.parts.push({ type: 'attribute', index, name, strings: statics });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            }
            else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                const data = node.data;
                if (data.indexOf(marker) >= 0) {
                    const parent = node.parentNode;
                    const strings = data.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (let i = 0; i < lastIndex; i++) {
                        let insert;
                        let s = strings[i];
                        if (s === '') {
                            insert = createMarker();
                        }
                        else {
                            const match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] +
                                    match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({ type: 'node', index: ++index });
                    }
                    // If there's no text, we must insert a comment to mark our place.
                    // Else, we can trust it will stick around after cloning.
                    if (strings[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    }
                    else {
                        node.data = strings[lastIndex];
                    }
                    // We have a part for each match found
                    partIndex += lastIndex;
                }
            }
            else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                if (node.data === marker) {
                    const parent = node.parentNode;
                    // Add a new marker node to be the startNode of the Part if any of
                    // the following are true:
                    //  * We don't have a previousSibling
                    //  * The previousSibling is already the start of a previous part
                    if (node.previousSibling === null || index === lastPartIndex) {
                        index++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push({ type: 'node', index });
                    // If we don't have a nextSibling, keep this node so we have an end.
                    // Else, we can remove it to save future costs.
                    if (node.nextSibling === null) {
                        node.data = '';
                    }
                    else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                }
                else {
                    let i = -1;
                    while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                        // Comment node has a binding marker inside, make an inactive part
                        // The binding won't work, but subsequent bindings will
                        // TODO (justinfagnani): consider whether it's even worth it to
                        // make bindings in comments work
                        this.parts.push({ type: 'node', index: -1 });
                        partIndex++;
                    }
                }
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const endsWith = (str, suffix) => {
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
};
const isTemplatePartActive = (part) => part.index !== -1;
// Allows `document.createComment('')` to be renamed for a
// small manual size-savings.
const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const lastAttributeNameRegex = 
// eslint-disable-next-line no-control-regex
/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const walkerNodeFilter = 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;
/**
 * Removes the list of nodes from a Template safely. In addition to removing
 * nodes from the Template, the Template part indices are updated to match
 * the mutated Template DOM.
 *
 * As the template is walked the removal state is tracked and
 * part indices are adjusted as needed.
 *
 * div
 *   div#1 (remove) <-- start removing (removing node is div#1)
 *     div
 *       div#2 (remove)  <-- continue removing (removing node is still div#1)
 *         div
 * div <-- stop removing since previous sibling is the removing node (div#1,
 * removed 4 nodes)
 */
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content }, parts } = template;
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while (walker.nextNode()) {
        nodeIndex++;
        const node = walker.currentNode;
        // End removal if stepped past the removing node
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        // A node to remove was found in the template
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            // Track node we're removing
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        // When removing, increment count by which to adjust subsequent part indices
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while (part !== undefined && part.index === nodeIndex) {
            // If part is in a removed node deactivate it by setting index to -1 or
            // adjust the index as needed.
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            // go to the next active part.
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
}
const countNodes = (node) => {
    let count = (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? 0 : 1;
    const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
    while (walker.nextNode()) {
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
    for (let i = startIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        if (isTemplatePartActive(part)) {
            return i;
        }
    }
    return -1;
};
/**
 * Inserts the given node into the Template, optionally before the given
 * refNode. In addition to inserting the node into the Template, the Template
 * part indices are updated to match the mutated Template DOM.
 */
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content }, parts } = template;
    // If there's no refNode, then put node at end of template.
    // No part indices need to be shifted in this case.
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while (walker.nextNode()) {
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
            // If we've inserted the node, simply adjust all subsequent parts
            if (insertCount > 0) {
                while (partIndex !== -1) {
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
const isDirective = (o) => {
    return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */
const nothing = {};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
class TemplateInstance {
    constructor(template, processor, options) {
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        //     method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //    through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //    cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari does not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        const fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        const stack = [];
        const parts = this.template.parts;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        let partIndex = 0;
        let nodeIndex = 0;
        let part;
        let node = walker.nextNode();
        // Loop through all the nodes and parts of a template
        while (partIndex < parts.length) {
            part = parts[partIndex];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.
            while (nodeIndex < part.index) {
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            // We've arrived at our part's node.
            if (part.type === 'node') {
                const part = this.processor.handleTextExpression(this.options);
                part.insertAfterNode(node.previousSibling);
                this.__parts.push(part);
            }
            else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Our TrustedTypePolicy for HTML which is declared using the html template
 * tag function.
 *
 * That HTML is a developer-authored constant, and is parsed with innerHTML
 * before any untrusted expressions have been mixed in. Therefor it is
 * considered safe by construction.
 */
const policy = window.trustedTypes &&
    trustedTypes.createPolicy('lit-html', { createHTML: (s) => s });
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment position.
            //   * For node-position bindings we insert a comment with the marker
            //     sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            //     first binding, so that we support unquoted attribute bindings.
            //     Subsequent bindings can use a comment marker because multi-binding
            //     attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            //     close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.
            const commentOpen = s.lastIndexOf('<!--');
            // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.
            isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                s.indexOf('-->', commentOpen + 1) === -1;
            // Check to see if we have an attribute-like sequence preceding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.
            const attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                // We're only in this branch if we don't have a attribute-like
                // preceding sequence. For comments, this guards against unusual
                // attribute values like <div foo="<!--${'bar'}">. Cases like
                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                // below.
                html += s + (isCommentBinding ? commentMarker : nodeMarker);
            }
            else {
                // For attributes we use just a marker sentinel, and also append a
                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                // that IE and Edge do for style and certain SVG attributes.
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                    attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                    marker;
            }
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        let value = this.getHTML();
        if (policy !== undefined) {
            // this is secure because `this.strings` is a TemplateStringsArray.
            // TODO: validate this when
            // https://github.com/tc39/proposal-array-is-template-object is
            // implemented.
            value = policy.createHTML(value);
        }
        template.innerHTML = value;
        return template;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive = (value) => {
    return (value === null ||
        !(typeof value === 'object' || typeof value === 'function'));
};
const isIterable = (value) => {
    return Array.isArray(value) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attribute. The value is only set once even if there are multiple parts
 * for an attribute.
 */
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        const parts = this.parts;
        // If we're assigning an attribute via syntax like:
        //    attr="${foo}"  or  attr=${foo}
        // but not
        //    attr="${foo} ${bar}" or attr="${foo} baz"
        // then we don't want to coerce the attribute value into one long
        // string. Instead we want to just return the value itself directly,
        // so that sanitizeDOMValue can get the actual value rather than
        // String(value)
        // The exception is if v is an array, in which case we do want to smash
        // it together into a string without calling String() on the array.
        //
        // This also allows trusted values (when using TrustedTypes) being
        // assigned to DOM sinks without being stringified in the process.
        if (l === 1 && strings[0] === '' && strings[1] === '') {
            const v = parts[0].value;
            if (typeof v === 'symbol') {
                return String(v);
            }
            if (typeof v === 'string' || !isIterable(v)) {
                return v;
            }
        }
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text += typeof v === 'string' ? v : String(v);
                }
                else {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
/**
 * A Part that controls all or part of an attribute value.
 */
class AttributePart {
    constructor(committer) {
        this.value = undefined;
        this.committer = committer;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while (isDirective(this.value)) {
            const directive = this.value;
            this.value = noChange;
            directive(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */
class NodePart {
    constructor(options) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    }
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    }
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        if (this.startNode.parentNode === null) {
            return;
        }
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        const value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this.__commitNode(value);
        }
        else if (isIterable(value)) {
            this.__commitIterable(value);
        }
        else if (value === nothing) {
            this.value = nothing;
            this.clear();
        }
        else {
            // Fallback, will render the string representation
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.
        const valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling &&
            node.nodeType === 3 /* Node.TEXT_NODE */) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.data = valueAsString;
        }
        else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance &&
            this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            // Try to reuse an existing part
            itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */
class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = noChange;
    }
}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single =
            (strings.length === 2 && strings[0] === '' && strings[1] === '');
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported = false;
// Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module
(() => {
    try {
        const options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener('test', options, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.removeEventListener('test', options, options);
    }
    catch (_e) {
        // event options not supported
    }
})();
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = (e) => this.handleEvent(e);
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const newListener = this.__pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null ||
            oldListener != null &&
                (newListener.capture !== oldListener.capture ||
                    newListener.once !== oldListener.once ||
                    newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        }
        else {
            this.value.handleEvent(event);
        }
    }
}
// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions = (o) => o &&
    (eventOptionsSupported ?
        { capture: o.capture, passive: o.passive, once: o.once } :
        o.capture);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    // If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content
    const key = result.strings.join(marker);
    // Check if we already have a Template for this key
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        // If we have not seen this key before, create a new Template
        template = new Template(result, result.getTemplateElement());
        // Cache the Template for this key
        templateCache.keyString.set(key, template);
    }
    // Cache all future queries for this TemplateStringsArray
    templateCache.stringsArray.set(result.strings, template);
    return template;
}
const templateCaches = new Map();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
const render$1 = (result, container, options) => {
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */
class DefaultTemplateProcessor {
    /**
     * Create parts for an attribute-position binding, given the event, attribute
     * name, and string literals.
     *
     * @param element The element containing the binding
     * @param name  The attribute name
     * @param strings The string literals. There are always at least two strings,
     *   event for fully-controlled bindings with a single expression.
     */
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const committer = new PropertyCommitter(element, name.slice(1), strings);
            return committer.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        const committer = new AttributeCommitter(element, name, strings);
        return committer.parts;
    }
    /**
     * Create parts for a text-position binding.
     * @param templateFactory
     */
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.4.1');
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// Get a key to lookup in `templateCaches`.
const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
}
else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected. ` +
        `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` +
        `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */
const shadyTemplateFactory = (scopeName) => (result) => {
    const cacheKey = getTemplateCacheKey(result.type, scopeName);
    let templateCache = templateCaches.get(cacheKey);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(cacheKey, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    const key = result.strings.join(marker);
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        const element = result.getTemplateElement();
        if (compatibleShadyCSSVersion) {
            window.ShadyCSS.prepareTemplateDom(element, scopeName);
        }
        template = new Template(result, element);
        templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */
const removeStylesFromLitTemplates = (scopeName) => {
    TEMPLATE_TYPES.forEach((type) => {
        const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.keyString.forEach((template) => {
                const { element: { content } } = template;
                // IE 11 doesn't support the iterable param Set constructor
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach((s) => {
                    styles.add(s);
                });
                removeNodesFromTemplate(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered
 * output.
 */
const prepareTemplateStyles = (scopeName, renderedDOM, template) => {
    shadyRenderSet.add(scopeName);
    // If `renderedDOM` is stamped from a Template, then we need to edit that
    // Template's underlying template element. Otherwise, we create one here
    // to give to ShadyCSS, which still requires one while scoping.
    const templateElement = !!template ? template.element : document.createElement('template');
    // Move styles out of rendered DOM and store.
    const styles = renderedDOM.querySelectorAll('style');
    const { length } = styles;
    // If there are no styles, skip unnecessary work
    if (length === 0) {
        // Ensure prepareTemplateStyles is called to support adding
        // styles via `prepareAdoptedCssText` since that requires that
        // `prepareTemplateStyles` is called.
        //
        // ShadyCSS will only update styles containing @apply in the template
        // given to `prepareTemplateStyles`. If no lit Template was given,
        // ShadyCSS will not be able to update uses of @apply in any relevant
        // template. However, this is not a problem because we only create the
        // template for the purpose of supporting `prepareAdoptedCssText`,
        // which doesn't support @apply at all.
        window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
        return;
    }
    const condensedStyle = document.createElement('style');
    // Collect styles into a single style. This helps us make sure ShadyCSS
    // manipulations will not prevent us from being able to fix up template
    // part indices.
    // NOTE: collecting styles is inefficient for browsers but ShadyCSS
    // currently does this anyway. When it does not, this should be changed.
    for (let i = 0; i < length; i++) {
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    // Remove styles from nested templates in this scope.
    removeStylesFromLitTemplates(scopeName);
    // And then put the condensed style into the "root" template passed in as
    // `template`.
    const content = templateElement.content;
    if (!!template) {
        insertNodeIntoTemplate(template, condensedStyle, content.firstChild);
    }
    else {
        content.insertBefore(condensedStyle, content.firstChild);
    }
    // Note, it's important that ShadyCSS gets the template that `lit-html`
    // will actually render so that it can update the style inside when
    // needed (e.g. @apply native Shadow DOM case).
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    const style = content.querySelector('style');
    if (window.ShadyCSS.nativeShadow && style !== null) {
        // When in native Shadow DOM, ensure the style created by ShadyCSS is
        // included in initially rendered output (`renderedDOM`).
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    }
    else if (!!template) {
        // When no style is left in the template, parts will be broken as a
        // result. To fix this, we put back the style node ShadyCSS removed
        // and then tell lit to remove that node from the template.
        // There can be no style in the template in 2 cases (1) when Shady DOM
        // is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
        // is in use ShadyCSS removes the style if it contains no content.
        // NOTE, ShadyCSS creates its own style so we can safely add/remove
        // `condensedStyle` here.
        content.insertBefore(condensedStyle, content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template, removes);
    }
};
/**
 * Extension to the standard `render` method which supports rendering
 * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
 * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
 * or when the webcomponentsjs
 * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
 *
 * Adds a `scopeName` option which is used to scope element DOM and stylesheets
 * when native ShadowDOM is unavailable. The `scopeName` will be added to
 * the class attribute of all rendered DOM. In addition, any style elements will
 * be automatically re-written with this `scopeName` selector and moved out
 * of the rendered DOM and into the document `<head>`.
 *
 * It is common to use this render method in conjunction with a custom element
 * which renders a shadowRoot. When this is done, typically the element's
 * `localName` should be used as the `scopeName`.
 *
 * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
 * custom properties (needed only on older browsers like IE11) and a shim for
 * a deprecated feature called `@apply` that supports applying a set of css
 * custom properties to a given location.
 *
 * Usage considerations:
 *
 * * Part values in `<style>` elements are only applied the first time a given
 * `scopeName` renders. Subsequent changes to parts in style elements will have
 * no effect. Because of this, parts in style elements should only be used for
 * values that will never change, for example parts that set scope-wide theme
 * values or parts which render shared style elements.
 *
 * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
 * custom element's `constructor` is not supported. Instead rendering should
 * either done asynchronously, for example at microtask timing (for example
 * `Promise.resolve()`), or be deferred until the first time the element's
 * `connectedCallback` runs.
 *
 * Usage considerations when using shimmed custom properties or `@apply`:
 *
 * * Whenever any dynamic changes are made which affect
 * css custom properties, `ShadyCSS.styleElement(element)` must be called
 * to update the element. There are two cases when this is needed:
 * (1) the element is connected to a new parent, (2) a class is added to the
 * element that causes it to match different custom properties.
 * To address the first case when rendering a custom element, `styleElement`
 * should be called in the element's `connectedCallback`.
 *
 * * Shimmed custom properties may only be defined either for an entire
 * shadowRoot (for example, in a `:host` rule) or via a rule that directly
 * matches an element with a shadowRoot. In other words, instead of flowing from
 * parent to child as do native css custom properties, shimmed custom properties
 * flow only from shadowRoots to nested shadowRoots.
 *
 * * When using `@apply` mixing css shorthand property names with
 * non-shorthand names (for example `border` and `border-width`) is not
 * supported.
 */
const render = (result, container, options) => {
    if (!options || typeof options !== 'object' || !options.scopeName) {
        throw new Error('The `scopeName` option is required.');
    }
    const scopeName = options.scopeName;
    const hasRendered = parts.has(container);
    const needsScoping = compatibleShadyCSSVersion &&
        container.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ &&
        !!container.host;
    // Handle first render to a scope specially...
    const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
    // On first scope render, render into a fragment; this cannot be a single
    // fragment that is reused since nested renders can occur synchronously.
    const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
    render$1(result, renderContainer, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
    // When performing first scope render,
    // (1) We've rendered into a fragment so that there's a chance to
    // `prepareTemplateStyles` before sub-elements hit the DOM
    // (which might cause them to render based on a common pattern of
    // rendering in a custom element's `connectedCallback`);
    // (2) Scope the template with ShadyCSS one time only for this scope.
    // (3) Render the fragment into the container and make sure the
    // container knows its `part` is the one we just rendered. This ensures
    // DOM will be re-used on subsequent renders.
    if (firstScopeRender) {
        const part = parts.get(renderContainer);
        parts.delete(renderContainer);
        // ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
        // that should apply to `renderContainer` even if the rendered value is
        // not a TemplateInstance. However, it will only insert scoped styles
        // into the document if `prepareTemplateStyles` has already been called
        // for the given scope name.
        const template = part.value instanceof TemplateInstance ?
            part.value.template :
            undefined;
        prepareTemplateStyles(scopeName, renderContainer, template);
        removeNodes(container, container.firstChild);
        container.appendChild(renderContainer);
        parts.set(container, part);
    }
    // After elements have hit the DOM, update styling if this is the
    // initial render to this container.
    // This is needed whenever dynamic changes are made so it would be
    // safest to do every render; however, this would regress performance
    // so we leave it up to the user to call `ShadyCSS.styleElement`
    // for dynamic changes.
    if (!hasRendered && needsScoping) {
        window.ShadyCSS.styleElement(container.host);
    }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var _a;
/**
 * Use this module if you want to create your own base class extending
 * [[UpdatingElement]].
 * @packageDocumentation
 */
/*
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */
window.JSCompiler_renameProperty =
    (prop, _obj) => prop;
const defaultConverter = {
    toAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                // if the value is `null` or `undefined` pass this through
                // to allow removing/no change behavior.
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    fromAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                // Type assert to adhere to Bazel's "must type assert JSON parse" rule.
                return JSON.parse(value);
        }
        return value;
    }
};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = (value, old) => {
    // This ensures (old==NaN, value==NaN) always returns false
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    hasChanged: notEqual
};
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
/**
 * The Closure JS Compiler doesn't currently have good support for static
 * property semantics where "this" is dynamic (e.g.
 * https://github.com/google/closure-compiler/issues/3177 and others) so we use
 * this hack to bypass any rewriting by the compiler.
 */
const finalized = 'finalized';
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 * @noInheritDoc
 */
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this.initialize();
    }
    /**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     */
    static get observedAttributes() {
        // note: piggy backing on this to ensure we're finalized.
        this.finalize();
        const attributes = [];
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this._classProperties.forEach((v, p) => {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        });
        return attributes;
    }
    /**
     * Ensures the private `_classProperties` property metadata is created.
     * In addition to `finalize` this is also called in `createProperty` to
     * ensure the `@property` decorator can add property metadata.
     */
    /** @nocollapse */
    static _ensureClassProperties() {
        // ensure private storage for property declarations.
        if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
            this._classProperties = new Map();
            // NOTE: Workaround IE11 not supporting Map constructor argument.
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
    }
    /**
     * Creates a property accessor on the element prototype if one does not exist
     * and stores a PropertyDeclaration for the property with the given options.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     *
     * This method may be overridden to customize properties; however,
     * when doing so, it's important to call `super.createProperty` to ensure
     * the property is setup correctly. This method calls
     * `getPropertyDescriptor` internally to get a descriptor to install.
     * To customize what properties do when they are get or set, override
     * `getPropertyDescriptor`. To customize the options for a property,
     * implement `createProperty` like this:
     *
     * static createProperty(name, options) {
     *   options = Object.assign(options, {myOption: true});
     *   super.createProperty(name, options);
     * }
     *
     * @nocollapse
     */
    static createProperty(name, options = defaultPropertyDeclaration) {
        // Note, since this can be called by the `@property` decorator which
        // is called before `finalize`, we ensure storage exists for property
        // metadata.
        this._ensureClassProperties();
        this._classProperties.set(name, options);
        // Do not generate an accessor if the prototype already has one, since
        // it would be lost otherwise and that would never be the user's intention;
        // Instead, we expect users to call `requestUpdate` themselves from
        // user-defined accessors. Note that if the super has an accessor we will
        // still overwrite it
        if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        const descriptor = this.getPropertyDescriptor(name, key, options);
        if (descriptor !== undefined) {
            Object.defineProperty(this.prototype, name, descriptor);
        }
    }
    /**
     * Returns a property descriptor to be defined on the given named property.
     * If no descriptor is returned, the property will not become an accessor.
     * For example,
     *
     *   class MyElement extends LitElement {
     *     static getPropertyDescriptor(name, key, options) {
     *       const defaultDescriptor =
     *           super.getPropertyDescriptor(name, key, options);
     *       const setter = defaultDescriptor.set;
     *       return {
     *         get: defaultDescriptor.get,
     *         set(value) {
     *           setter.call(this, value);
     *           // custom action.
     *         },
     *         configurable: true,
     *         enumerable: true
     *       }
     *     }
     *   }
     *
     * @nocollapse
     */
    static getPropertyDescriptor(name, key, options) {
        return {
            // tslint:disable-next-line:no-any no symbol in index
            get() {
                return this[key];
            },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this
                    .requestUpdateInternal(name, oldValue, options);
            },
            configurable: true,
            enumerable: true
        };
    }
    /**
     * Returns the property options associated with the given property.
     * These options are defined with a PropertyDeclaration via the `properties`
     * object or the `@property` decorator and are registered in
     * `createProperty(...)`.
     *
     * Note, this method should be considered "final" and not overridden. To
     * customize the options for a given property, override `createProperty`.
     *
     * @nocollapse
     * @final
     */
    static getPropertyOptions(name) {
        return this._classProperties && this._classProperties.get(name) ||
            defaultPropertyDeclaration;
    }
    /**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     * @nocollapse
     */
    static finalize() {
        // finalize any superclasses
        const superCtor = Object.getPrototypeOf(this);
        if (!superCtor.hasOwnProperty(finalized)) {
            superCtor.finalize();
        }
        this[finalized] = true;
        this._ensureClassProperties();
        // initialize Map populated in observedAttributes
        this._attributeToPropertyMap = new Map();
        // make any properties
        // Note, only process "own" properties since this element will inherit
        // any properties defined on the superClass, and finalization ensures
        // the entire prototype chain is finalized.
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            // support symbols in properties (IE11 does not support this)
            const propKeys = [
                ...Object.getOwnPropertyNames(props),
                ...(typeof Object.getOwnPropertySymbols === 'function') ?
                    Object.getOwnPropertySymbols(props) :
                    []
            ];
            // This for/of is ok because propKeys is an array
            for (const p of propKeys) {
                // note, use of `any` is due to TypeSript lack of support for symbol in
                // index types
                // tslint:disable-next-line:no-any no symbol in index
                this.createProperty(p, props[p]);
            }
        }
    }
    /**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */
    static _attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false ?
            undefined :
            (typeof attribute === 'string' ?
                attribute :
                (typeof name === 'string' ? name.toLowerCase() : undefined));
    }
    /**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     * @nocollapse
     */
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    /**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's
     * `converter` or `converter.fromAttribute` property option.
     * @nocollapse
     */
    static _propertyValueFromAttribute(value, options) {
        const type = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = (typeof converter === 'function' ? converter : converter.fromAttribute);
        return fromAttribute ? fromAttribute(value, type) : value;
    }
    /**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     * @nocollapse
     */
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute ||
            defaultConverter.toAttribute;
        return toAttribute(value, type);
    }
    /**
     * Performs element initialization. By default captures any pre-set values for
     * registered properties.
     */
    initialize() {
        this._updateState = 0;
        this._updatePromise =
            new Promise((res) => this._enableUpdatingResolver = res);
        this._changedProperties = new Map();
        this._saveInstanceProperties();
        // ensures first update will be caught by an early access of
        // `updateComplete`
        this.requestUpdateInternal();
    }
    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */
    _saveInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this.constructor
            ._classProperties.forEach((_v, p) => {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        });
    }
    /**
     * Applies previously saved instance properties.
     */
    _applyInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        // tslint:disable-next-line:no-any
        this._instanceProperties.forEach((v, p) => this[p] = v);
        this._instanceProperties = undefined;
    }
    connectedCallback() {
        // Ensure first connection completes an update. Updates cannot complete
        // before connection.
        this.enableUpdating();
    }
    enableUpdating() {
        if (this._enableUpdatingResolver !== undefined) {
            this._enableUpdatingResolver();
            this._enableUpdatingResolver = undefined;
        }
    }
    /**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */
    disconnectedCallback() {
    }
    /**
     * Synchronizes property values when attributes change.
     */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
            const attrValue = ctor._propertyValueToAttribute(value, options);
            // an undefined value does not change the attribute.
            if (attrValue === undefined) {
                return;
            }
            // Track if the property is being reflected to avoid
            // setting the property again via `attributeChangedCallback`. Note:
            // 1. this takes advantage of the fact that the callback is synchronous.
            // 2. will behave incorrectly if multiple attributes are in the reaction
            // stack at time of calling. However, since we process attributes
            // in `update` this should not be possible (or an extreme corner case
            // that we'd like to discover).
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
            if (attrValue == null) {
                this.removeAttribute(attr);
            }
            else {
                this.setAttribute(attr, attrValue);
            }
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
        }
    }
    _attributeToProperty(name, value) {
        // Use tracking info to avoid deserializing attribute value if it was
        // just set from a property setter.
        if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
            return;
        }
        const ctor = this.constructor;
        // Note, hint this as an `AttributeMap` so closure clearly understands
        // the type; it has issues with tracking types through statics
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
            const options = ctor.getPropertyOptions(propName);
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] =
                // tslint:disable-next-line:no-any
                ctor._propertyValueFromAttribute(value, options);
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
        }
    }
    /**
     * This protected version of `requestUpdate` does not access or return the
     * `updateComplete` promise. This promise can be overridden and is therefore
     * not free to access.
     */
    requestUpdateInternal(name, oldValue, options) {
        let shouldRequestUpdate = true;
        // If we have a property key, perform property update steps.
        if (name !== undefined) {
            const ctor = this.constructor;
            options = options || ctor.getPropertyOptions(name);
            if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                if (!this._changedProperties.has(name)) {
                    this._changedProperties.set(name, oldValue);
                }
                // Add to reflecting properties set.
                // Note, it's important that every change has a chance to add the
                // property to `_reflectingProperties`. This ensures setting
                // attribute + property reflects correctly.
                if (options.reflect === true &&
                    !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                    if (this._reflectingProperties === undefined) {
                        this._reflectingProperties = new Map();
                    }
                    this._reflectingProperties.set(name, options);
                }
            }
            else {
                // Abort the request if the property should not be considered changed.
                shouldRequestUpdate = false;
            }
        }
        if (!this._hasRequestedUpdate && shouldRequestUpdate) {
            this._updatePromise = this._enqueueUpdate();
        }
    }
    /**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */
    requestUpdate(name, oldValue) {
        this.requestUpdateInternal(name, oldValue);
        return this.updateComplete;
    }
    /**
     * Sets up the element to asynchronously update.
     */
    async _enqueueUpdate() {
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        try {
            // Ensure any previous update has resolved before updating.
            // This `await` also ensures that property changes are batched.
            await this._updatePromise;
        }
        catch (e) {
            // Ignore any previous errors. We only care that the previous cycle is
            // done. Any error should have been handled in the previous update.
        }
        const result = this.performUpdate();
        // If `performUpdate` returns a Promise, we await it. This is done to
        // enable coordinating updates with a scheduler. Note, the result is
        // checked to avoid delaying an additional microtask unless we need to.
        if (result != null) {
            await result;
        }
        return !this._hasRequestedUpdate;
    }
    get _hasRequestedUpdate() {
        return (this._updateState & STATE_UPDATE_REQUESTED);
    }
    get hasUpdated() {
        return (this._updateState & STATE_HAS_UPDATED);
    }
    /**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * You can override this method to change the timing of updates. If this
     * method is overridden, `super.performUpdate()` must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```
     * protected async performUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.performUpdate();
     * }
     * ```
     */
    performUpdate() {
        // Abort any update if one is not pending when this is called.
        // This can happen if `performUpdate` is called early to "flush"
        // the update.
        if (!this._hasRequestedUpdate) {
            return;
        }
        // Mixin instance properties once, if they exist.
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        let shouldUpdate = false;
        const changedProperties = this._changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.update(changedProperties);
            }
            else {
                this._markUpdated();
            }
        }
        catch (e) {
            // Prevent `firstUpdated` and `updated` from running when there's an
            // update exception.
            shouldUpdate = false;
            // Ensure element can accept additional updates after an exception.
            this._markUpdated();
            throw e;
        }
        if (shouldUpdate) {
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update.
     *
     * To await additional asynchronous work, override the `_getUpdateComplete`
     * method. For example, it is sometimes useful to await a rendered element
     * before fulfilling this Promise. To do this, first await
     * `super._getUpdateComplete()`, then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */
    get updateComplete() {
        return this._getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     *   class MyElement extends LitElement {
     *     async _getUpdateComplete() {
     *       await super._getUpdateComplete();
     *       await this._myChild.updateComplete;
     *     }
     *   }
     * @deprecated Override `getUpdateComplete()` instead for forward
     *     compatibility with `lit-element` 3.0 / `@lit/reactive-element`.
     */
    _getUpdateComplete() {
        return this.getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     *   class MyElement extends LitElement {
     *     async getUpdateComplete() {
     *       await super.getUpdateComplete();
     *       await this._myChild.updateComplete;
     *     }
     *   }
     */
    getUpdateComplete() {
        return this._updatePromise;
    }
    /**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    shouldUpdate(_changedProperties) {
        return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined &&
            this._reflectingProperties.size > 0) {
            // Use forEach so this works even if for/of loops are compiled to for
            // loops expecting arrays
            this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
            this._reflectingProperties = undefined;
        }
        this._markUpdated();
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    updated(_changedProperties) {
    }
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    firstUpdated(_changedProperties) {
    }
}
_a = finalized;
/**
 * Marks class as having finished creating properties.
 */
UpdatingElement[_a] = true;

/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
/**
 * Whether the current browser supports `adoptedStyleSheets`.
 */
const supportsAdoptingStyleSheets = (window.ShadowRoot) &&
    (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow) &&
    ('adoptedStyleSheets' in Document.prototype) &&
    ('replace' in CSSStyleSheet.prototype);
const constructionToken = Symbol();
class CSSResult {
    constructor(cssText, safeToken) {
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
    }
    // Note, this is a getter so that it's lazy. In practice, this means
    // stylesheets are not created until the first element instance is made.
    get styleSheet() {
        if (this._styleSheet === undefined) {
            // Note, if `supportsAdoptingStyleSheets` is true then we assume
            // CSSStyleSheet is constructable.
            if (supportsAdoptingStyleSheets) {
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.cssText);
            }
            else {
                this._styleSheet = null;
            }
        }
        return this._styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
/**
 * Wrap a value for interpolation in a [[`css`]] tagged template literal.
 *
 * This is unsafe because untrusted CSS text can be used to phone home
 * or exfiltrate data to an attacker controlled site. Take care to only use
 * this with trusted input.
 */
const unsafeCSS = (value) => {
    return new CSSResult(String(value), constructionToken);
};
const textFromCSSResult = (value) => {
    if (value instanceof CSSResult) {
        return value.cssText;
    }
    else if (typeof value === 'number') {
        return value;
    }
    else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
    }
};
/**
 * Template tag which which can be used with LitElement's [[LitElement.styles |
 * `styles`]] property to set element styles. For security reasons, only literal
 * string values may be used. To incorporate non-literal values [[`unsafeCSS`]]
 * may be used inside a template string part.
 */
const css = (strings, ...values) => {
    const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
    return new CSSResult(cssText, constructionToken);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window['litElementVersions'] || (window['litElementVersions'] = []))
    .push('2.5.1');
/**
 * Sentinal value used to avoid calling lit-html's render function when
 * subclasses do not implement `render`
 */
const renderNotImplemented = {};
/**
 * Base element class that manages element properties and attributes, and
 * renders a lit-html template.
 *
 * To define a component, subclass `LitElement` and implement a
 * `render` method to provide the component's template. Define properties
 * using the [[`properties`]] property or the [[`property`]] decorator.
 */
class LitElement extends UpdatingElement {
    /**
     * Return the array of styles to apply to the element.
     * Override this method to integrate into a style management system.
     *
     * @nocollapse
     */
    static getStyles() {
        return this.styles;
    }
    /** @nocollapse */
    static _getUniqueStyles() {
        // Only gather styles once per class
        if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
            return;
        }
        // Take care not to call `this.getStyles()` multiple times since this
        // generates new CSSResults each time.
        // TODO(sorvell): Since we do not cache CSSResults by input, any
        // shared styles will generate new stylesheet objects, which is wasteful.
        // This should be addressed when a browser ships constructable
        // stylesheets.
        const userStyles = this.getStyles();
        if (Array.isArray(userStyles)) {
            // De-duplicate styles preserving the _last_ instance in the set.
            // This is a performance optimization to avoid duplicated styles that can
            // occur especially when composing via subclassing.
            // The last item is kept to try to preserve the cascade order with the
            // assumption that it's most important that last added styles override
            // previous styles.
            const addStyles = (styles, set) => styles.reduceRight((set, s) => 
            // Note: On IE set.add() does not return the set
            Array.isArray(s) ? addStyles(s, set) : (set.add(s), set), set);
            // Array.from does not work on Set in IE, otherwise return
            // Array.from(addStyles(userStyles, new Set<CSSResult>())).reverse()
            const set = addStyles(userStyles, new Set());
            const styles = [];
            set.forEach((v) => styles.unshift(v));
            this._styles = styles;
        }
        else {
            this._styles = userStyles === undefined ? [] : [userStyles];
        }
        // Ensure that there are no invalid CSSStyleSheet instances here. They are
        // invalid in two conditions.
        // (1) the sheet is non-constructible (`sheet` of a HTMLStyleElement), but
        //     this is impossible to check except via .replaceSync or use
        // (2) the ShadyCSS polyfill is enabled (:. supportsAdoptingStyleSheets is
        //     false)
        this._styles = this._styles.map((s) => {
            if (s instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
                // Flatten the cssText from the passed constructible stylesheet (or
                // undetectable non-constructible stylesheet). The user might have
                // expected to update their stylesheets over time, but the alternative
                // is a crash.
                const cssText = Array.prototype.slice.call(s.cssRules)
                    .reduce((css, rule) => css + rule.cssText, '');
                return unsafeCSS(cssText);
            }
            return s;
        });
    }
    /**
     * Performs element initialization. By default this calls
     * [[`createRenderRoot`]] to create the element [[`renderRoot`]] node and
     * captures any pre-set values for registered properties.
     */
    initialize() {
        super.initialize();
        this.constructor._getUniqueStyles();
        this.renderRoot = this.createRenderRoot();
        // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
        // element's getRootNode(). While this could be done, we're choosing not to
        // support this now since it would require different logic around de-duping.
        if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
            this.adoptStyles();
        }
    }
    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */
    createRenderRoot() {
        return this.attachShadow(this.constructor.shadowRootOptions);
    }
    /**
     * Applies styling to the element shadowRoot using the [[`styles`]]
     * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
     * available and will fallback otherwise. When Shadow DOM is polyfilled,
     * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
     * is available but `adoptedStyleSheets` is not, styles are appended to the
     * end of the `shadowRoot` to [mimic spec
     * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
     */
    adoptStyles() {
        const styles = this.constructor._styles;
        if (styles.length === 0) {
            return;
        }
        // There are three separate cases here based on Shadow DOM support.
        // (1) shadowRoot polyfilled: use ShadyCSS
        // (2) shadowRoot.adoptedStyleSheets available: use it
        // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
        // rendering
        if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s) => s.cssText), this.localName);
        }
        else if (supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets =
                styles.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
        }
        else {
            // This must be done after rendering so the actual style insertion is done
            // in `update`.
            this._needsShimAdoptedStyleSheets = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // Note, first update/render handles styleElement so we only call this if
        // connected after first update.
        if (this.hasUpdated && window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }
    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * @param _changedProperties Map of changed properties with old values
     */
    update(changedProperties) {
        // Setting properties in `render` should not trigger an update. Since
        // updates are allowed after super.update, it's important to call `render`
        // before that.
        const templateResult = this.render();
        super.update(changedProperties);
        // If render is not implemented by the component, don't call lit-html render
        if (templateResult !== renderNotImplemented) {
            this.constructor
                .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
        }
        // When native Shadow DOM is used but adoptedStyles are not supported,
        // insert styling after rendering to ensure adoptedStyles have highest
        // priority.
        if (this._needsShimAdoptedStyleSheets) {
            this._needsShimAdoptedStyleSheets = false;
            this.constructor._styles.forEach((s) => {
                const style = document.createElement('style');
                style.textContent = s.cssText;
                this.renderRoot.appendChild(style);
            });
        }
    }
    /**
     * Invoked on each update to perform rendering tasks. This method may return
     * any value renderable by lit-html's `NodePart` - typically a
     * `TemplateResult`. Setting properties inside this method will *not* trigger
     * the element to update.
     */
    render() {
        return renderNotImplemented;
    }
}
/**
 * Ensure this class is marked as `finalized` as an optimization ensuring
 * it will not needlessly try to `finalize`.
 *
 * Note this property name is a string to prevent breaking Closure JS Compiler
 * optimizations. See updating-element.ts for more information.
 */
LitElement['finalized'] = true;
/**
 * Reference to the underlying library method used to render the element's
 * DOM. By default, points to the `render` method from lit-html's shady-render
 * module.
 *
 * **Most users will never need to touch this property.**
 *
 * This  property should not be confused with the `render` instance method,
 * which should be overridden to define a template for the element.
 *
 * Advanced users creating a new base class based on LitElement can override
 * this property to point to a custom render method with a signature that
 * matches [shady-render's `render`
 * method](https://lit-html.polymer-project.org/api/modules/shady_render.html#render).
 *
 * @nocollapse
 */
LitElement.render = render;
/** @nocollapse */
LitElement.shadowRootOptions = { mode: 'open' };

var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
var twoDigitsOptional = "[1-9]\\d?";
var twoDigits = "\\d\\d";
var threeDigits = "\\d{3}";
var fourDigits = "\\d{4}";
var word = "[^\\s]+";
var literal = /\[([^]*?)\]/gm;
function shorten(arr, sLen) {
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        newArr.push(arr[i].substr(0, sLen));
    }
    return newArr;
}
var monthUpdate = function (arrName) { return function (v, i18n) {
    var lowerCaseArr = i18n[arrName].map(function (v) { return v.toLowerCase(); });
    var index = lowerCaseArr.indexOf(v.toLowerCase());
    if (index > -1) {
        return index;
    }
    return null;
}; };
function assign(origObj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
        var obj = args_1[_a];
        for (var key in obj) {
            // @ts-ignore ex
            origObj[key] = obj[key];
        }
    }
    return origObj;
}
var dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
var monthNamesShort = shorten(monthNames, 3);
var dayNamesShort = shorten(dayNames, 3);
var defaultI18n = {
    dayNamesShort: dayNamesShort,
    dayNames: dayNames,
    monthNamesShort: monthNamesShort,
    monthNames: monthNames,
    amPm: ["am", "pm"],
    DoFn: function (dayOfMonth) {
        return (dayOfMonth +
            ["th", "st", "nd", "rd"][dayOfMonth % 10 > 3
                ? 0
                : ((dayOfMonth - (dayOfMonth % 10) !== 10 ? 1 : 0) * dayOfMonth) % 10]);
    }
};
var globalI18n = assign({}, defaultI18n);
var setGlobalDateI18n = function (i18n) {
    return (globalI18n = assign(globalI18n, i18n));
};
var regexEscape = function (str) {
    return str.replace(/[|\\{()[^$+*?.-]/g, "\\$&");
};
var pad = function (val, len) {
    if (len === void 0) { len = 2; }
    val = String(val);
    while (val.length < len) {
        val = "0" + val;
    }
    return val;
};
var formatFlags = {
    D: function (dateObj) { return String(dateObj.getDate()); },
    DD: function (dateObj) { return pad(dateObj.getDate()); },
    Do: function (dateObj, i18n) {
        return i18n.DoFn(dateObj.getDate());
    },
    d: function (dateObj) { return String(dateObj.getDay()); },
    dd: function (dateObj) { return pad(dateObj.getDay()); },
    ddd: function (dateObj, i18n) {
        return i18n.dayNamesShort[dateObj.getDay()];
    },
    dddd: function (dateObj, i18n) {
        return i18n.dayNames[dateObj.getDay()];
    },
    M: function (dateObj) { return String(dateObj.getMonth() + 1); },
    MM: function (dateObj) { return pad(dateObj.getMonth() + 1); },
    MMM: function (dateObj, i18n) {
        return i18n.monthNamesShort[dateObj.getMonth()];
    },
    MMMM: function (dateObj, i18n) {
        return i18n.monthNames[dateObj.getMonth()];
    },
    YY: function (dateObj) {
        return pad(String(dateObj.getFullYear()), 4).substr(2);
    },
    YYYY: function (dateObj) { return pad(dateObj.getFullYear(), 4); },
    h: function (dateObj) { return String(dateObj.getHours() % 12 || 12); },
    hh: function (dateObj) { return pad(dateObj.getHours() % 12 || 12); },
    H: function (dateObj) { return String(dateObj.getHours()); },
    HH: function (dateObj) { return pad(dateObj.getHours()); },
    m: function (dateObj) { return String(dateObj.getMinutes()); },
    mm: function (dateObj) { return pad(dateObj.getMinutes()); },
    s: function (dateObj) { return String(dateObj.getSeconds()); },
    ss: function (dateObj) { return pad(dateObj.getSeconds()); },
    S: function (dateObj) {
        return String(Math.round(dateObj.getMilliseconds() / 100));
    },
    SS: function (dateObj) {
        return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
    },
    SSS: function (dateObj) { return pad(dateObj.getMilliseconds(), 3); },
    a: function (dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
    },
    A: function (dateObj, i18n) {
        return dateObj.getHours() < 12
            ? i18n.amPm[0].toUpperCase()
            : i18n.amPm[1].toUpperCase();
    },
    ZZ: function (dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return ((offset > 0 ? "-" : "+") +
            pad(Math.floor(Math.abs(offset) / 60) * 100 + (Math.abs(offset) % 60), 4));
    },
    Z: function (dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return ((offset > 0 ? "-" : "+") +
            pad(Math.floor(Math.abs(offset) / 60), 2) +
            ":" +
            pad(Math.abs(offset) % 60, 2));
    }
};
var monthParse = function (v) { return +v - 1; };
var emptyDigits = [null, twoDigitsOptional];
var emptyWord = [null, word];
var amPm = [
    "isPm",
    word,
    function (v, i18n) {
        var val = v.toLowerCase();
        if (val === i18n.amPm[0]) {
            return 0;
        }
        else if (val === i18n.amPm[1]) {
            return 1;
        }
        return null;
    }
];
var timezoneOffset = [
    "timezoneOffset",
    "[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",
    function (v) {
        var parts = (v + "").match(/([+-]|\d\d)/gi);
        if (parts) {
            var minutes = +parts[1] * 60 + parseInt(parts[2], 10);
            return parts[0] === "+" ? minutes : -minutes;
        }
        return 0;
    }
];
var parseFlags = {
    D: ["day", twoDigitsOptional],
    DD: ["day", twoDigits],
    Do: ["day", twoDigitsOptional + word, function (v) { return parseInt(v, 10); }],
    M: ["month", twoDigitsOptional, monthParse],
    MM: ["month", twoDigits, monthParse],
    YY: [
        "year",
        twoDigits,
        function (v) {
            var now = new Date();
            var cent = +("" + now.getFullYear()).substr(0, 2);
            return +("" + (+v > 68 ? cent - 1 : cent) + v);
        }
    ],
    h: ["hour", twoDigitsOptional, undefined, "isPm"],
    hh: ["hour", twoDigits, undefined, "isPm"],
    H: ["hour", twoDigitsOptional],
    HH: ["hour", twoDigits],
    m: ["minute", twoDigitsOptional],
    mm: ["minute", twoDigits],
    s: ["second", twoDigitsOptional],
    ss: ["second", twoDigits],
    YYYY: ["year", fourDigits],
    S: ["millisecond", "\\d", function (v) { return +v * 100; }],
    SS: ["millisecond", twoDigits, function (v) { return +v * 10; }],
    SSS: ["millisecond", threeDigits],
    d: emptyDigits,
    dd: emptyDigits,
    ddd: emptyWord,
    dddd: emptyWord,
    MMM: ["month", word, monthUpdate("monthNamesShort")],
    MMMM: ["month", word, monthUpdate("monthNames")],
    a: amPm,
    A: amPm,
    ZZ: timezoneOffset,
    Z: timezoneOffset
};
// Some common format strings
var globalMasks = {
    default: "ddd MMM DD YYYY HH:mm:ss",
    shortDate: "M/D/YY",
    mediumDate: "MMM D, YYYY",
    longDate: "MMMM D, YYYY",
    fullDate: "dddd, MMMM D, YYYY",
    isoDate: "YYYY-MM-DD",
    isoDateTime: "YYYY-MM-DDTHH:mm:ssZ",
    shortTime: "HH:mm",
    mediumTime: "HH:mm:ss",
    longTime: "HH:mm:ss.SSS"
};
var setGlobalDateMasks = function (masks) { return assign(globalMasks, masks); };
/***
 * Format a date
 * @method format
 * @param {Date|number} dateObj
 * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
 * @returns {string} Formatted date string
 */
var format = function (dateObj, mask, i18n) {
    if (mask === void 0) { mask = globalMasks["default"]; }
    if (i18n === void 0) { i18n = {}; }
    if (typeof dateObj === "number") {
        dateObj = new Date(dateObj);
    }
    if (Object.prototype.toString.call(dateObj) !== "[object Date]" ||
        isNaN(dateObj.getTime())) {
        throw new Error("Invalid Date pass to format");
    }
    mask = globalMasks[mask] || mask;
    var literals = [];
    // Make literals inactive by replacing them with @@@
    mask = mask.replace(literal, function ($0, $1) {
        literals.push($1);
        return "@@@";
    });
    var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
    // Apply formatting rules
    mask = mask.replace(token, function ($0) {
        return formatFlags[$0](dateObj, combinedI18nSettings);
    });
    // Inline literal values back into the formatted value
    return mask.replace(/@@@/g, function () { return literals.shift(); });
};
/**
 * Parse a date string into a Javascript Date object /
 * @method parse
 * @param {string} dateStr Date string
 * @param {string} format Date parse format
 * @param {i18n} I18nSettingsOptional Full or subset of I18N settings
 * @returns {Date|null} Returns Date object. Returns null what date string is invalid or doesn't match format
 */
function parse(dateStr, format, i18n) {
    if (i18n === void 0) { i18n = {}; }
    if (typeof format !== "string") {
        throw new Error("Invalid format in fecha parse");
    }
    // Check to see if the format is actually a mask
    format = globalMasks[format] || format;
    // Avoid regular expression denial of service, fail early for really long strings
    // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
    if (dateStr.length > 1000) {
        return null;
    }
    // Default to the beginning of the year.
    var today = new Date();
    var dateInfo = {
        year: today.getFullYear(),
        month: 0,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        isPm: null,
        timezoneOffset: null
    };
    var parseInfo = [];
    var literals = [];
    // Replace all the literals with @@@. Hopefully a string that won't exist in the format
    var newFormat = format.replace(literal, function ($0, $1) {
        literals.push(regexEscape($1));
        return "@@@";
    });
    var specifiedFields = {};
    var requiredFields = {};
    // Change every token that we find into the correct regex
    newFormat = regexEscape(newFormat).replace(token, function ($0) {
        var info = parseFlags[$0];
        var field = info[0], regex = info[1], requiredField = info[3];
        // Check if the person has specified the same field twice. This will lead to confusing results.
        if (specifiedFields[field]) {
            throw new Error("Invalid format. " + field + " specified twice in format");
        }
        specifiedFields[field] = true;
        // Check if there are any required fields. For instance, 12 hour time requires AM/PM specified
        if (requiredField) {
            requiredFields[requiredField] = true;
        }
        parseInfo.push(info);
        return "(" + regex + ")";
    });
    // Check all the required fields are present
    Object.keys(requiredFields).forEach(function (field) {
        if (!specifiedFields[field]) {
            throw new Error("Invalid format. " + field + " is required in specified format");
        }
    });
    // Add back all the literals after
    newFormat = newFormat.replace(/@@@/g, function () { return literals.shift(); });
    // Check if the date string matches the format. If it doesn't return null
    var matches = dateStr.match(new RegExp(newFormat, "i"));
    if (!matches) {
        return null;
    }
    var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
    // For each match, call the parser function for that date part
    for (var i = 1; i < matches.length; i++) {
        var _a = parseInfo[i - 1], field = _a[0], parser = _a[2];
        var value = parser
            ? parser(matches[i], combinedI18nSettings)
            : +matches[i];
        // If the parser can't make sense of the value, return null
        if (value == null) {
            return null;
        }
        dateInfo[field] = value;
    }
    if (dateInfo.isPm === 1 && dateInfo.hour != null && +dateInfo.hour !== 12) {
        dateInfo.hour = +dateInfo.hour + 12;
    }
    else if (dateInfo.isPm === 0 && +dateInfo.hour === 12) {
        dateInfo.hour = 0;
    }
    var dateWithoutTZ = new Date(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute, dateInfo.second, dateInfo.millisecond);
    var validateFields = [
        ["month", "getMonth"],
        ["day", "getDate"],
        ["hour", "getHours"],
        ["minute", "getMinutes"],
        ["second", "getSeconds"]
    ];
    for (var i = 0, len = validateFields.length; i < len; i++) {
        // Check to make sure the date field is within the allowed range. Javascript dates allows values
        // outside the allowed range. If the values don't match the value was invalid
        if (specifiedFields[validateFields[i][0]] &&
            dateInfo[validateFields[i][0]] !== dateWithoutTZ[validateFields[i][1]]()) {
            return null;
        }
    }
    if (dateInfo.timezoneOffset == null) {
        return dateWithoutTZ;
    }
    return new Date(Date.UTC(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute - dateInfo.timezoneOffset, dateInfo.second, dateInfo.millisecond));
}
var fecha = {
    format: format,
    parse: parse,
    defaultI18n: defaultI18n,
    setGlobalDateI18n: setGlobalDateI18n,
    setGlobalDateMasks: setGlobalDateMasks
};

(function(){try{(new Date).toLocaleDateString("i");}catch(e){return "RangeError"===e.name}return !1})()?function(e,t){return e.toLocaleDateString(t.language,{year:"numeric",month:"long",day:"numeric"})}:function(t){return fecha.format(t,"mediumDate")};(function(){try{(new Date).toLocaleString("i");}catch(e){return "RangeError"===e.name}return !1})()?function(e,t){return e.toLocaleString(t.language,{year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"})}:function(t){return fecha.format(t,"haDateTime")};(function(){try{(new Date).toLocaleTimeString("i");}catch(e){return "RangeError"===e.name}return !1})()?function(e,t){return e.toLocaleTimeString(t.language,{hour:"numeric",minute:"2-digit"})}:function(t){return fecha.format(t,"shortTime")};var m,f;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none";}(m||(m={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24";}(f||(f={}));var A=function(e,t,a,r){r=r||{},a=null==a?{}:a;var n=new Event(t,{bubbles:void 0===r.bubbles||r.bubbles,cancelable:Boolean(r.cancelable),composed:void 0===r.composed||r.composed});return n.detail=a,e.dispatchEvent(n),n};function X(e,t,a){if(t.has("config")||a)return !0;if(e.config.entity){var r=t.get("hass");return !r||r.states[e.config.entity]!==e.hass.states[e.config.entity]}return !1}

var common$5 = {
	name: "Charger Card",
	description: "Charger card allows you to control your EV homecharger (or something else)."
};
var error$5 = {
	missing_entity: "Specifying entity is required!",
	not_available: "Not available",
	missing_config: "Error in config!",
	missing_group: "No entities defined in grou.!"
};
var editor$5 = {
	instruction: "Select your main entity and type/brand. The card will automatically try to detect the other sensors. If you have a brand which is not supported by default, you can choose «Other» and do mapping of entities manually. If anything fails, please verify the YAML configuration (click «Show code editor»).",
	brand: "Brand (Required)",
	entity: "Main Entity (Required)",
	chargerImage: "Built-in images and color",
	customImage: "Custom image (Optional - overrides charger image)",
	theme: "Color theme",
	compact_view: "Compact View",
	compact_view_aria_label_on: "Toggle compact view on",
	compact_view_aria_label_off: "Toggle compact view off",
	show_name: "Show Name",
	show_name_aria_label_on: "Toggle display name on",
	show_name_aria_label_off: "Toggle display name off",
	show_leds: "Show Leds",
	show_leds_aria_label_on: "Toggle animated leds (overlay on image) on",
	show_leds_aria_label_off: "Toggle animated leds (overlay on image) off",
	show_status: "Show Status",
	show_status_aria_label_on: "Toggle display status on",
	show_status_aria_label_off: "Toggle display status off",
	show_stats: "Show Data Table (stats)",
	show_stats_aria_label_on: "Toggle display data table on",
	show_stats_aria_label_off: "Toggle display data table off",
	show_collapsibles: "Show collapsible menu buttons",
	show_collapsibles_aria_label_on: "Toggle display collapsible menus on",
	show_collapsibles_aria_label_off: "Toggle display collapsible menus off",
	show_toolbar: "Show Toolbar",
	show_toolbar_aria_label_on: "Toggle display toolbar on",
	show_toolbar_aria_label_off: "Toggle display toolbar off",
	code_only_note: "Note: Advanced config such as toolbar and datatable (stats) are only in YAML-mode."
};
var easee$1 = {
	status: {
		disconnected: "Disconnected",
		awaiting_start: "Paused/awaiting start",
		charging: "Charging",
		completed: "Completed/awaiting car",
		error: "Error",
		ready_to_charge: "Ready to charge"
	},
	substatus: {
		ok: "Ok",
		pending_schedule: "Pending schedule",
		none: "None",
		max_circuit_current_too_low: "Max circuit current too low",
		max_dynamic_circuit_current_too_low: "Max dynamic circuit current too low",
		max_dynamic_charger_current_too_low: "Max dynamic charger current too low",
		max_dynamic_offline_fallback_circuit_current_too_low: "Max dynamic offline circuit current too low",
		max_charger_current_too_low: "Max charger current too low",
		circuit_fuse_too_low: "Circuit fuse too low",
		waiting_in_queue: "Waiting in queue",
		waiting_in_fully: "Waiting in fully",
		illegal_grid_type: "Illegal grid type",
		no_current_request: "No current request",
		not_requesting_current: "Not requesting current",
		charger_disabled: "Charger Disabled",
		pending_authorization: "Pending Authorization",
		charger_in_error_state: "Charger in error state",
		"undefined": "Undefined"
	},
	common: {
		click_for_group1: "Click for Limits",
		click_for_group2: "Click for Info",
		click_for_group3: "Click for Config",
		start: "Start",
		"continue": "Resume",
		pause: "Pause",
		stop: "Stop",
		resume: "Resume",
		override: "Override schedule",
		update: "Update firmware",
		reboot: "Reboot charger",
		not_available: "Charger not available",
		online: "Online",
		voltage: "Voltage",
		power: "Power",
		current: "Current",
		charger_current: "Charger Current",
		energy_per_hour: "Energy per Hour",
		session_energy: "Session energy",
		lifetime_energy: "Lifetime Energy",
		circuit_current: "Circuit Current",
		dyn_charger_limit: "Dyn Charger Limit",
		dyn_circuit_limit: "Dyn Circuit Limit",
		max_charger_limit: "Max Charger Limit",
		max_circuit_limit: "Max Circuit Limit",
		output_limit: "Allowed current",
		used_limit: "Used limit",
		offline_circuit_limit: "Offline Circuit Limit",
		enabled: "Enabled",
		idle_current: "Idle current",
		cable_locked: "Cable locked",
		perm_cable_locked: "Cable locked permanently",
		smart_charging: "Smart charging",
		cost_per_kwh: "Cost per kWh",
		update_available: "Update available",
		schedule: "Schedule"
	}
};
var vwegolf = {
	status: {
		home: "Home",
		away: "Away"
	},
	substatus: {
		ok: "Ok"
	},
	common: {
		click_for_group1: "Click for Locks",
		click_for_group2: "Click for Info",
		click_for_group3: "Click for Config",
		soc: "%SOC"
	}
};
var test$1 = {
	status: {
		disconnected: "Disconnected",
		awaiting_start: "Paused or awaiting start",
		charging: "Charging",
		completed: "Completed or awaiting car",
		error: "Error",
		ready_to_charge: "Ready to charge"
	},
	substatus: {
		ok: "Ok",
		pending_schedule: "Pending schedule",
		none: "None",
		max_circuit_current_too_low: "Max circuit current too low",
		max_dynamic_circuit_current_too_low: "Max dynamic circuit current too low",
		max_dynamic_charger_current_too_low: "Max dynamic charger current too low",
		max_dynamic_offline_fallback_circuit_current_too_low: "Max dynamic offline circuit current too low",
		max_charger_current_too_low: "Max charger current too low",
		circuit_fuse_too_low: "Circuit fuse too low",
		waiting_in_queue: "Waiting in queue",
		waiting_in_fully: "Waiting in fully",
		illegal_grid_type: "Illegal grid type",
		no_current_request: "No current request",
		not_requesting_current: "Not requesting current",
		charger_disabled: "Charger Disabled",
		pending_authorization: "Pending Authorization",
		charger_in_error_state: "Charger in error state",
		"undefined": "Undefined"
	},
	common: {
		start: "Start",
		"continue": "Resume",
		pause: "Pause",
		stop: "Stop",
		override: "Override schedule",
		reboot: "Reboot charger",
		not_available: "Charger not available",
		online: "Online",
		voltage: "Voltage",
		power: "Power",
		charger_current: "Charger Current",
		energy_per_hour: "Energy per Hour",
		lifetime_energy: "Lifetime Energy",
		circuit_current: "Circuit Energy",
		schedule: "Schedule"
	}
};
var en = {
	common: common$5,
	error: error$5,
	editor: editor$5,
	easee: easee$1,
	vwegolf: vwegolf,
	test: test$1
};

var en$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    common: common$5,
    error: error$5,
    editor: editor$5,
    easee: easee$1,
    vwegolf: vwegolf,
    test: test$1,
    'default': en
});

var common$4 = {
	name: "Charger Card",
	description: "Charger card gir deg mulighet for å styre din elbil hjemmelader (eller noe annet)."
};
var error$4 = {
	missing_entity: "Du må angi en hovedentitet!",
	not_available: "Utilgjengelig",
	missing_config: "Feil i konfigurasjon!",
	missing_group: "No entities defined in grou.!"
};
var editor$4 = {
	instruction: "Velg din hovedentitet og ladertype/merke. Kortet vil automatisk forsøke å finne øvrige sensorer. Hvis du har ett merke som ikke er støttet kan du velge «Template» og gjøre mappingen manuelt selv. Hvis noe feiler, verifiser konfigurasjonen i YAML-editoren (trykk «Vis koderedigering»).",
	brand: "Type/merke (Påkrevd)",
	entity: "Hovedentitet (Påkrevd)",
	chargerImage: "Innebygde bilder og -farger",
	customImage: "Eget bilde (opsjon - overstyrer laderbilde)",
	theme: "Tema",
	compact_view: "Kompakt",
	compact_view_aria_label_on: "Slå på kompakt visning",
	compact_view_aria_label_off: "Slå av kompakt visning",
	show_name: "Vis navn",
	show_name_aria_label_on: "Slå på visning av navn",
	show_name_aria_label_off: "Slå av visning av navn",
	show_leds: "Vis led",
	show_leds_aria_label_on: "Slå på visning av led (over bilde)",
	show_leds_aria_label_off: "Slå av visning av led (over bilde)",
	show_status: "Vis status",
	show_status_aria_label_on: "Slå på visning av status",
	show_status_aria_label_off: "Slå av visning av status",
	show_stats: "Vis datatabell (stats)",
	show_stats_aria_label_on: "Slå på visning av datatabell (stats)",
	show_stats_aria_label_off: "Slå av visning av datatabell (stats)",
	show_collapsibles: "Vis sammenslåbare menyvalg",
	show_collapsibles_aria_label_on: "Slå på visning av sammenslåbare menyer",
	show_collapsibles_aria_label_off: "Slå av visning av sammenslåbare menyer",
	show_toolbar: "Vis verktøylinje",
	show_toolbar_aria_label_on: "Slå på visning av verktøylinje",
	show_toolbar_aria_label_off: "Slå av visning av verktøylinje",
	code_only_note: "Merk: Egendefinerte actions og data tabell (stats) er kun tilgjengelig ved å benytte Code Editor manuelt."
};
var easee = {
	status: {
		disconnected: "Frakoblet",
		awaiting_start: "Pause (avventer start)",
		charging: "Lader",
		completed: "Fullført eller venter på bil",
		error: "Feil",
		ready_to_charge: "Klar til lading"
	},
	substatus: {
		ok: "Ok",
		none: "Ingen",
		max_circuit_current_too_low: "Maks kursstrøm for lav",
		max_dynamic_circuit_current_too_low: "Maks dynamisk kursstrøm for lav",
		max_dynamic_offline_fallback_circuit_current_too_low: "Maks dynamisk offline kursstrøm for lav",
		max_charger_current_too_low: "Maks laderstrøm for lav",
		max_dynamic_charger_current_too_low: "Maks dynamisk laderstrøm for lav",
		circuit_fuse_too_low: "Kurssikring for lav",
		waiting_in_queue: "Venter i kø",
		waiting_in_fully: "Venter i full kø",
		illegal_grid_type: "Ugyldig type nett",
		no_current_request: "Ingen forespørsel om strøm",
		not_requesting_current: "Ingen forespørsel om strøm",
		charger_disabled: "Lader er deaktivert",
		pending_schedule: "Avventer tidsplan",
		pending_authorization: "Avventer autorisasjon",
		charger_in_error_state: "Feil i lader",
		"undefined": "Udefinert"
	},
	common: {
		click_for_group1: "Klikk for limiteringer",
		click_for_group2: "Klikk for info",
		click_for_group3: "Klikk for konfigurasjoner",
		start: "Start",
		"continue": "Fortsett",
		pause: "Pause",
		stop: "Stopp",
		resume: "Fortsett",
		override: "Overstyr tidsplan",
		update: "Oppdater firmware",
		reboot: "Reboot lader",
		not_available: "Lader utilgjengelig",
		online: "Online",
		voltage: "Spenning",
		power: "Effekt",
		current: "Strøm",
		charger_current: "Laderstrøm",
		circuit_current: "Kursstrøm",
		energy_per_hour: "Energi per time",
		session_energy: "Ladeøkt energi",
		lifetime_energy: "Total energi",
		dyn_charger_limit: "Dyn laderstrøm",
		dyn_circuit_limit: "Dyn kursstrøm",
		max_charger_limit: "Maks laderstrøm",
		max_circuit_limit: "Maks kursstrøm",
		output_limit: "Tillatt strøm",
		offline_circuit_limit: "Offline kursstrøm",
		used_limit: "Brukt limitering",
		enabled: "Aktivert",
		idle_current: "Tomgangsstrøm",
		cable_locked: "Kabel låst",
		perm_cable_locked: "Kabel låst permanent",
		smart_charging: "Smart lading",
		cost_per_kwh: "Kostnad per kWh",
		update_available: "Oppdatering tilgjengelig",
		schedule: "Tidsplan"
	}
};
var test = {
	status: {
		disconnected: "Frakoblet",
		awaiting_start: "Pause (avventer start)",
		charging: "Lader",
		completed: "Fullført eller venter på bil",
		error: "Feil",
		ready_to_charge: "Klar til lading"
	},
	substatus: {
		ok: "Ok",
		none: "Ingen",
		max_circuit_current_too_low: "Maks kursstrøm for lav",
		max_dynamic_circuit_current_too_low: "Maks dynamisk kursstrøm for lav",
		max_dynamic_offline_fallback_circuit_current_too_low: "Maks dynamisk offline kursstrøm for lav",
		max_charger_current_too_low: "Maks laderstrøm for lav",
		max_dynamic_charger_current_too_low: "Maks dynamisk laderstrøm for lav",
		circuit_fuse_too_low: "Kurssikring for lav",
		waiting_in_queue: "Venter i kø",
		waiting_in_fully: "Venter i full kø",
		illegal_grid_type: "Ugyldig type nett",
		no_current_request: "Ingen forespørsel om strøm",
		not_requesting_current: "Ingen forespørsel om strøm",
		charger_disabled: "Lader er deaktivert",
		pending_schedule: "Avventer tidsplan",
		pending_authorization: "Avventer autorisasjon",
		charger_in_error_state: "Feil i lader",
		"undefined": "Udefinert"
	},
	common: {
		start: "Start",
		"continue": "Fortsett",
		pause: "Pause",
		stop: "Stopp",
		override: "Overstyr tidsplan",
		reboot: "Reboot lader",
		not_available: "Lader utilgjengelig",
		online: "Online",
		voltage: "Spenning",
		power: "Effekt",
		charger_current: "Laderstrøm",
		circuit_current: "Kursstrøm",
		energy_per_hour: "Energi per time",
		lifetime_energy: "Total energi",
		schedule: "Tidsplan"
	}
};
var nb = {
	common: common$4,
	error: error$4,
	editor: editor$4,
	easee: easee,
	test: test
};

var nb$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    common: common$4,
    error: error$4,
    editor: editor$4,
    easee: easee,
    test: test,
    'default': nb
});

var status$3 = {
	disconnected: "Frånkopplad",
	awaiting_start: "Pausad eller inväntar start",
	charging: "Laddar",
	completed: "Färdig eller inväntar bil",
	error: "Error",
	ready_to_charge: "Klar att ladda"
};
var common$3 = {
	name: "Charger Card",
	description: "Charger card ger dig möjlighet att styra din laddningsrobot.",
	start: "Starta",
	"continue": "Återuppta",
	pause: "Pausa",
	stop: "Stopp",
	override: "Åsidosätt schema",
	reboot: "Starta om laddared",
	not_available: "Laddaren inte tillgänglig",
	click_for_info: "Klicka för info",
	click_for_config: "Klicka för konfigurering",
	click_for_limits: "Klicka för begränsningar",
	online: "Uppkopplad",
	voltage: "Spänning",
	power: "Kraft",
	charger_current: "Laddningsenergi",
	energy_per_hour: "Energi per timme",
	lifetime_energy: "Livstids energi",
	circuit_current: "Kretsenergi"
};
var error$3 = {
	missing_entity: "Entiteten måsta anges!"
};
var editor$3 = {
	entity: "Entitet (Obligatorisk)",
	chargerImage: "Laddar bild och färg",
	customImage: "Egen bild (Frivilligt - åsidosätter laddarbild)",
	theme: "Färgtema",
	compact_view: "Kompakt vy",
	compact_view_aria_label_on: "Toggle compact view on",
	compact_view_aria_label_off: "Toggle compact view off",
	show_name: "Visa namn",
	show_name_aria_label_on: "Toggle display name on",
	show_name_aria_label_off: "Toggle display name off",
	show_leds: "Visa Leds",
	show_leds_aria_label_on: "Toggle animated leds (overlay on image) on",
	show_leds_aria_label_off: "Toggle animated leds (overlay on image) off",
	show_status: "Visa Status",
	show_status_aria_label_on: "Toggle display status on",
	show_status_aria_label_off: "Toggle display status off",
	show_stats: "Visa Data Tabell (stats)",
	show_stats_aria_label_on: "Toggle display data table on",
	show_stats_aria_label_off: "Toggle display data table off",
	show_collapsibles: "Show collapsible menu buttons",
	show_collapsibles_aria_label_on: "Toggle display collapsible menus on",
	show_collapsibles_aria_label_off: "Toggle display collapsible menus off",
	show_toolbar: "Visa verktygsfält",
	show_toolbar_aria_label_on: "Toggle display toolbar on",
	show_toolbar_aria_label_off: "Toggle display toolbar off",
	code_only_note: "Notera: Egendefinierade Custom actions och data tabell (stats) är bara tillgängligt när Code Editorn används manuellt."
};
var charger_status$3 = {
	sessionEnergy: "Sessionsenergi"
};
var charger_substatus$3 = {
	not_requesting_current: "Ingen bil ansluten",
	ok: "Klar"
};
var sv = {
	status: status$3,
	common: common$3,
	error: error$3,
	editor: editor$3,
	charger_status: charger_status$3,
	charger_substatus: charger_substatus$3
};

var sv$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    status: status$3,
    common: common$3,
    error: error$3,
    editor: editor$3,
    charger_status: charger_status$3,
    charger_substatus: charger_substatus$3,
    'default': sv
});

var status$2 = {
	disconnected: "Getrennt",
	awaiting_start: "Pausiert oder warte auf Start",
	charging: "Laden",
	completed: "Fertig oder warte auf Auto",
	error: "Fehler",
	ready_to_charge: "Bereit zum Laden"
};
var common$2 = {
	name: "Charger Card",
	description: "Charger card ermöglicht es dir, deinen Laderoboter zu steuern.",
	start: "Start",
	"continue": "Weiter",
	pause: "Pause",
	stop: "Stopp",
	override: "Zeitplan überschreiben",
	reboot: "Ladegerät neu starten",
	not_available: "Ladegerät nicht verfügbar",
	click_for_info: "Klicken für Infos",
	click_for_config: "Klicken für Konfiguration",
	click_for_limits: "Klicken für Limits",
	online: "Online",
	voltage: "Spannung",
	power: "Leistung",
	charger_current: "Ladestrom",
	energy_per_hour: "Energie pro Stunde",
	lifetime_energy: "Energie gesamt",
	circuit_current: "Aktueller Strom"
};
var error$2 = {
	missing_entity: "Die Angabe der Entität ist erforderlich!"
};
var editor$2 = {
	entity: "Entity (Erforderlich)",
	chargerImage: "Bild und Farbe des Ladegeräts",
	customImage: "Benutzerdefiniertes Bild (Optional - überschreibt das Bild des Ladegeräts)",
	theme: "Farbschema",
	compact_view: "Kompakte Ansicht",
	compact_view_aria_label_on: "Kompakte Ansicht einschalten",
	compact_view_aria_label_off: "Kompakte Ansicht ausschalten",
	show_name: "Name anzeigen",
	show_name_aria_label_on: "Anzeigename einschalten",
	show_name_aria_label_off: "Anzeigename ausschalten",
	show_leds: "Leds anzeigen",
	show_leds_aria_label_on: "Animierte Leds (Überlagerung des Bildes) einschalten",
	show_leds_aria_label_off: "Animierte Leds (Überlagerung des Bildes) ausschalten",
	show_status: "Status anzeigen",
	show_status_aria_label_on: "Statusanzeige einschalten",
	show_status_aria_label_off: "Statusanzeige ausschalten",
	show_stats: "Datentabelle anzeigen (Statistik)",
	show_stats_aria_label_on: "Datentabelle einschalten",
	show_stats_aria_label_off: "Datentabelle ausschalten",
	show_collapsibles: "Zusammenklappbare Menüschaltflächen anzeigen",
	show_collapsibles_aria_label_on: "Zusammenklappbare Menüschaltflächen einschalten",
	show_collapsibles_aria_label_off: "Zusammenklappbare Menüschaltflächen ausschalten",
	show_toolbar: "Symbolleiste anzeigen",
	show_toolbar_aria_label_on: "Symbolleiste einschalten",
	show_toolbar_aria_label_off: "Symbolleiste ausschalten",
	code_only_note: "Hinweis: Die Optionen für benutzerdefinierte Aktionen und Datentabellen (Statistiken) sind ausschließlich über den manuellen Code-Editor verfügbar."
};
var charger_status$2 = {
	sessionEnergy: "Energieaufladung"
};
var charger_substatus$2 = {
	not_requesting_current: "Keine Nachfrage nach Strom",
	ok: "Ok",
	pending_schedule: "Ausstehender Zeitplan",
	none: "None",
	max_circuit_current_too_low: "Maximalstrom zu niedrig",
	max_dynamic_circuit_current_too_low: "Dynamischer Maximalstrom zu niedrig",
	max_dynamic_offline_fallback_circuit_current_too_low: "Dynamischer offline Maximalstrom zu niedrig",
	circuit_fuse_too_low: "Stromkreissicherung zu niedrig",
	waiting_in_queue: "Warten in der Warteschlange",
	waiting_in_fully: "Warten in vollem Umfang",
	illegal_grid_type: "Unzulässiger Grid Typ",
	no_current_request: "Keine aktuelle Anfrage",
	max_charger_current_too_low: "Maximaler Ladestrom zu niedrig",
	max_dynamic_charger_current_too_low: "Maximaler dynamischer Ladestrom zu niedrig",
	charger_disabled: "Ladegerät Deaktiviert",
	pending_authorization: "Ausstehende Autorisierung",
	charger_in_error_state: "Ladegerät im Fehlerzustand",
	"undefined": "Undefiniert"
};
var de = {
	status: status$2,
	common: common$2,
	error: error$2,
	editor: editor$2,
	charger_status: charger_status$2,
	charger_substatus: charger_substatus$2
};

var de$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    status: status$2,
    common: common$2,
    error: error$2,
    editor: editor$2,
    charger_status: charger_status$2,
    charger_substatus: charger_substatus$2,
    'default': de
});

var status$1 = {
	disconnected: "Frakoblet",
	awaiting_start: "Afventer start",
	charging: "Oplader",
	completed: "Gennemført",
	error: "Fejl",
	ready_to_charge: "Klar til opladning"
};
var common$1 = {
	name: "Charger Card",
	description: "Charger card gir dig mulighed for at styre din ladeboks.",
	start: "Start",
	"continue": "Fortsæt",
	pause: "Pause",
	stop: "Stop",
	override: "Overstyr plan",
	reboot: "Genstart ladeboks",
	not_available: "Lader utilgængelig",
	click_for_info: "Klik for info",
	click_for_config: "Klik for konfiguration",
	click_for_limits: "Klik for limiteringer",
	online: "Online",
	voltage: "Spænding",
	power: "Effekt",
	charger_current: "Ladestrøm",
	energy_per_hour: "Energi per time",
	lifetime_energy: "Energi totalt",
	circuit_current: "Kredsløbstrøm"
};
var error$1 = {
	missing_entity: "Du skal angive en entitet!"
};
var editor$1 = {
	entity: "Entitet (obligatorisk)",
	chargerImage: "Billede og -farvevalg",
	customImage: "Valgfrit billede (erstatter billede af laderobot)",
	theme: "Farvevalg",
	compact_view: "Kompakt",
	compact_view_aria_label_on: "Slå kompakt tilstand til",
	compact_view_aria_label_off: "Slå kompakt tilstand fra",
	show_name: "Vis navn",
	show_name_aria_label_on: "Vis navn",
	show_name_aria_label_off: "Vis ikke navn",
	show_leds: "Vis LED lys",
	show_leds_aria_label_on: "Slå animerede LED lys til",
	show_leds_aria_label_off: "Slå animerede LED lys fra",
	show_status: "Vis status",
	show_status_aria_label_on: "Vis status",
	show_status_aria_label_off: "Vis ikke status",
	show_stats: "Vis data tabel (statistik)",
	show_stats_aria_label_on: "Vis data tabel (statistik)",
	show_stats_aria_label_off: "Vis ikke data tabel (statistik)",
	show_collapsibles: "Vis foldbar menu",
	show_collapsibles_aria_label_on: "Vis foldbar menu",
	show_collapsibles_aria_label_off: "Vis ikke foldbar menu",
	show_toolbar: "Vis værktøjslinje",
	show_toolbar_aria_label_on: "Vis værktøjslinje",
	show_toolbar_aria_label_off: "Vis ikke værktøjslinje",
	code_only_note: "Bemærk: Brugerdefinerede actions og data tabel (statistik) funktioner kan kun benyttes ved manuelt at redigere via Code Editor."
};
var charger_status$1 = {
	sessionEnergy: "Energi session"
};
var charger_substatus$1 = {
	not_requesting_current: "Bilen anmoder ikke om strøm",
	ok: "Ok"
};
var da = {
	status: status$1,
	common: common$1,
	error: error$1,
	editor: editor$1,
	charger_status: charger_status$1,
	charger_substatus: charger_substatus$1
};

var da$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    status: status$1,
    common: common$1,
    error: error$1,
    editor: editor$1,
    charger_status: charger_status$1,
    charger_substatus: charger_substatus$1,
    'default': da
});

var status = {
	disconnected: "Desconnectat",
	awaiting_start: "Esperant per començar",
	charging: "Carregant",
	completed: "Completat",
	error: "Error",
	ready_to_charge: "A punt per carregar"
};
var common = {
	name: "Charger Card",
	description: "La Charger Card et permet controlar el teu robot de càrrega.",
	start: "Començar",
	"continue": "Continuar",
	pause: "Pausar",
	stop: "Parar",
	override: "Sobrreescriure la programació",
	reboot: "Reiniciar el carregador",
	not_available: "Carregador no disponible",
	click_for_info: "Fes click per més informació",
	click_for_config: "Fes click per configurar",
	click_for_limits: "Fes click per els límits",
	online: "Disponible",
	voltage: "Voltatge",
	power: "Potència",
	charger_current: "Corrent del carregador",
	energy_per_hour: "Energia per hora",
	lifetime_energy: "Energia de per vida",
	circuit_current: "Circuit d'energia"
};
var error = {
	missing_entity: "És necessari especificar una entitat!"
};
var editor = {
	entity: "Entitat (Obligatori)",
	chargerImage: "Imatge del carregador",
	customImage: "Imatge personalitzada (Opcional - sobreesciu la imatge del carregador)",
	theme: "Tema de color",
	compact_view: "Vista compacta",
	compact_view_aria_label_on: "Activar la vista compacta",
	compact_view_aria_label_off: "Desactivar la vista compacta",
	show_name: "Mostrar el nom",
	show_name_aria_label_on: "Mostrar el nom",
	show_name_aria_label_off: "Ocultar el nom",
	show_leds: "Mostrar els leds",
	show_leds_aria_label_on: "Mostrar els leds animats (sobreposats a la imatge)",
	show_leds_aria_label_off: "Ocultar els leds animats (sobreposats a la imatge)",
	show_status: "Mostar l'estat",
	show_status_aria_label_on: "Mostrar l'estat",
	show_status_aria_label_off: "Ocultar l'estat",
	show_stats: "Mostrar estats",
	show_stats_aria_label_on: "Mostrar la vista dels estats",
	show_stats_aria_label_off: "Ocultar la vista dels estats",
	show_collapsibles: "Mostrar el menú desplegable",
	show_collapsibles_aria_label_on: "Mostar el menu desplegable",
	show_collapsibles_aria_label_off: "Ocultar el menu desplegable",
	show_toolbar: "Mostrar la barra d'eines",
	show_toolbar_aria_label_on: "Mostrar la barra d'eines",
	show_toolbar_aria_label_off: "Ocultar la barra d'eines",
	code_only_note: "Nota: Les opcions per les acciones personalitzades i els estats només estan disponibles manualment utilitzant la vista d'Edició de Codi."
};
var charger_status = {
	sessionEnergy: "Energia de la sessió"
};
var charger_substatus = {
	not_requesting_current: "No s'està consumint corrent",
	ok: "Ok",
	pending_schedule: "Esperant programa",
	none: "Cap",
	max_circuit_current_too_low: "Corrent màxima del circuit insuficient",
	max_dynamic_circuit_current_too_low: "Corrent dinàmica màxima del circuit insuficient",
	max_dynamic_offline_fallback_circuit_current_too_low: "Corrent dinàmica màxima de reserva insuficient",
	circuit_fuse_too_low: "Circuit de fusible insuficient",
	waiting_in_queue: "En cua esperant",
	waiting_in_fully: "Esperant completat",
	illegal_grid_type: "Xarxa il·legal",
	no_current_request: "No hi ha demanda de corrent",
	max_charger_current_too_low: "Corrent màxima del carregador insuficient",
	max_dynamic_charger_current_too_low: "Corrent dinàmica màxima del carregador insuficient",
	charger_disabled: "Carregador deshabilitat",
	pending_authorization: "Esperant Autorització",
	charger_in_error_state: "Error del carregador",
	"undefined": "No definit"
};
var ca = {
	status: status,
	common: common,
	error: error,
	editor: editor,
	charger_status: charger_status,
	charger_substatus: charger_substatus
};

var ca$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    status: status,
    common: common,
    error: error,
    editor: editor,
    charger_status: charger_status,
    charger_substatus: charger_substatus,
    'default': ca
});

// Borrowed from:
var languages = {
  en: en$1,
  nb: nb$1,
  sv: sv$1,
  de: de$1,
  da: da$1,
  ca: ca$1
};
function localize(string, brand = null, search = '', replace = '', debug = false) {
  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');
  let translated;
  let brandstr = brand === undefined || brand === null ? string : brand + "." + string;

  try {
    // Try to translate, add brand if valid
    translated = brandstr.split('.').reduce((o, i) => o[i], languages[lang]);
    if (debug) console.log("Translating 1 -> " + lang + ": " + string + " --> " + brandstr + " --> " + translated);

    if (translated === undefined) {
      translated = brandstr.toLowerCase().split('.').reduce((o, i) => o[i], languages[lang]);
      if (debug) console.log("Translating 2 -> " + lang + " lowercase: " + string + " --> " + brandstr + " --> " + translated);
    }

    if (translated === undefined) {
      translated = brandstr.split('.').reduce((o, i) => o[i], languages['en']);
      if (debug) console.log("Translating 3 -> en  : " + string + " --> " + brandstr + " --> " + translated);
    }

    if (translated === undefined) {
      translated = brandstr.toLowerCase().split('.').reduce((o, i) => o[i], languages['en']);
      if (debug) console.log("Translating 4 -> en lowercase: " + string + " --> " + brandstr + " --> " + translated);
    }
  } catch (e) {// Give up, do nothing
  }

  if (translated === undefined) {
    // If translation failed, return last item of array
    var strArray = string.split(".");
    translated = strArray.length > 0 ? strArray[strArray.length - 1] : strArray;
    if (debug) console.log("Gave up translating: " + string + " --> " + strArray + " --> " + translated);
  } //Search and replace


  if (search !== '' && replace !== '') {
    translated = translated.replace(search, replace);
  } //Return


  return translated || string;
}

/** EASEE CHARGING ROBOT */
const MAIN_ENTITY_BASE$2 = '_status'; //Defines what should be replaced from main entity name to use as template for other entities

const DEFAULT_CONFIG$2 = {
  show_leds: true
};
const DEFAULT_DETAILS$2 = {
  //NAME, LOCATION, STATUS ETC
  name: {
    entity_id: 'sensor.#ENTITYPREFIX#_status',
    attribute: 'name'
  },
  location: {
    entity_id: 'sensor.#ENTITYPREFIX#_status',
    attribute: 'site_name'
  },
  status: {
    entity_id: 'sensor.#ENTITYPREFIX#_status'
  },
  substatus: {
    entity_id: 'sensor.#ENTITYPREFIX#_reason_for_no_current'
  },
  smartcharging: {
    //controls white or blue leds
    entity_id: 'switch.#ENTITYPREFIX#_smart_charging'
  },
  // OVERRIDE CURRENTLIMITS
  currentlimits: [0, 6, 10, 16, 20, 25, 32],
  // OVERRIDE STATE TEXT - also overrides translation
  statetext: {
    disconnected: 'disconnected',
    awaiting_start: 'awaiting_start',
    charging: 'charging',
    completed: 'completed',
    error: 'error',
    ready_to_charge: 'ready_to_charge'
  },
  // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
  collapsiblebuttons: {
    group1: {
      text: 'click_for_group1',
      icon: 'mdi:speedometer'
    },
    group2: {
      text: 'click_for_group2',
      icon: 'mdi:information'
    },
    group3: {
      text: 'click_for_group3',
      icon: 'mdi:cog'
    }
  },
  //ICONS LEFT AND RIGHT
  info_left: [{
    entity_id: 'binary_sensor.#ENTITYPREFIX#_online',
    text: 'online'
  }],
  info_right: [{
    entity_id: 'sensor.#ENTITYPREFIX#_voltage',
    text: 'voltage',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_power',
    text: 'power',
    unit_show: true
  }],
  //LIMITS
  group1: [{
    entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit',
    text: 'dyn_charger_limit',
    service: 'easee.set_charger_dynamic_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      current: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit',
    text: 'dyn_circuit_limit',
    service: 'easee.set_charger_circuit_dynamic_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      currentP1: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit',
    text: 'max_charger_limit',
    service: 'easee.set_charger_max_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      current: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit',
    text: 'max_circuit_limit',
    service: 'easee.set_circuit_max_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      currentP1: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit',
    text: 'offline_circuit_limit',
    service: 'easee.set_charger_circuit_offline_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      currentP1: '#SERVICEVAL#'
    }
  }],
  //INFO
  group2: [{
    entity_id: 'binary_sensor.#ENTITYPREFIX#_online',
    text: 'online'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_voltage',
    text: 'voltage',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_power',
    text: 'power',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_current',
    text: 'charger_current',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_circuit_current',
    text: 'circuit_current',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_energy_per_hour',
    text: 'energy_per_hour',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
    text: 'session_energy',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_lifetime_energy',
    text: 'lifetime_energy',
    unit_show: true
  }],
  //CONFIG
  group3: [{
    entity_id: 'switch.#ENTITYPREFIX#_is_enabled',
    text: 'enabled'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_enable_idle_current',
    text: 'idle_current'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_cable_locked',
    text: 'cable_locked'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_cable_locked_permanently',
    text: 'perm_cable_locked'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_smart_charging',
    text: 'smart_charging'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_cost_per_kwh',
    text: 'cost_per_kwh'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_update_available',
    text: 'update_available'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
    text: 'schedule'
  }],
  //STATS - based on state of main entity, default if state not found
  stats: {
    default: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'switch.#ENTITYPREFIX#_cable_locked_permanently',
      text: 'cable_locked'
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }],
    disconnected: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'switch.#ENTITYPREFIX#_cable_locked_permanently',
      text: 'cable_locked'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }],
    awaiting_start: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }, {
      entity_id: 'switch.#ENTITYPREFIX#_smart_charging',
      text: 'smart_charging'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }],
    charging: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_energy_per_hour',
      text: 'energy_per_hour',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_circuit_current',
      text: 'circuit_current',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_output_limit',
      text: 'output_limit',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_current',
      text: 'current',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_power',
      text: 'power',
      unit_show: true
    }],
    completed: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }],
    error: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }],
    ready_to_charge: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }]
  },
  // TOOLBAR
  toolbar_left: {
    default: [{}],
    disconnected: [{}],
    awaiting_start: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.resume',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'resume',
      icon: 'hass:play'
    }, {
      service: 'easee.override_schedule',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'override',
      icon: 'hass:motion-play'
    }],
    charging: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.pause',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'pause',
      icon: 'hass:pause'
    }],
    completed: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.override_schedule',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'override',
      icon: 'hass:motion-play'
    }],
    error: [{
      service: 'easee.reboot',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'reboot',
      icon: 'hass:restart'
    }],
    ready_to_charge: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.override_schedule',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'override',
      icon: 'hass:motion-play'
    }]
  },
  toolbar_right: {
    default: [{
      service: 'persistent_notification.create',
      service_data: {
        message: 'Firmware update is available, but only possible when disconnected!',
        title: 'Update'
      },
      text: 'update',
      icon: 'mdi:file-download',
      conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available'
    }],
    disconnected: [{
      service: 'easee.update_firmware',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'update',
      icon: 'mdi:file-download',
      conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available'
    }]
  }
};

/** TEMPLATE */
const MAIN_ENTITY_BASE$1 = '_status'; //Defines what should be replaced from main entity name to use as template for other entities

const DEFAULT_CONFIG$1 = {
  //To override card config when template selected
  show_leds: false
};
const DEFAULT_DETAILS$1 = {
  // TEMPLATE
  // template: [{
  //     entity_id: '',                  // entity id
  //     attribute: '',                  // attribute is used as value if specified
  //     unit: '',                       // unit if you want to override entity unit
  //     unit_show: true,                // show unit next to value
  //     unit_showontext: true,          // show unit next to value in tooltip text
  //     text: '',                       // text to be used instead of entity friendly-name (do not use dots '.' and apply translation key to achieve translation)
  //     service: '',                    // service on format 'domain.service'
  //     service_data: {'test','test'},  // service data for the service call
  //     icon: '',                       // icon to be used instead of entity icon
  //     round: 0,                       // round to specified number of decimals (integer)
  //     type: '',                       // type
  //     calc_function: ''               // define entity_id as 'calculated' and specify min,max,mean,sum here to calculate
  //     calc_entities: ''               // entities to calculate from above feature
  //     conditional_entity: ''          // if you want the entity_id to be shown conditionally, specify a on/off or true/false sensor here
  //     conditional_attribute: ''       // if you prefer the conditional showing of entity to be based on an attribute, define it here
  //     conditional_invert: ''          // if you prefer to invert the conditional showing of an entity to show when false, invert by true
  //NAME, LOCATION, STATUS ETC
  name: {
    entity_id: 'sensor.#ENTITYPREFIX#_status',
    attribute: 'name'
  },
  location: {
    entity_id: 'sensor.#ENTITYPREFIX#_status',
    attribute: 'site_name'
  },
  status: {
    entity_id: 'sensor.#ENTITYPREFIX#_status'
  },
  substatus: {
    entity_id: 'sensor.#ENTITYPREFIX#_reason_for_no_current'
  },
  smartcharging: {
    //controls white or blue leds
    entity_id: 'switch.#ENTITYPREFIX#_smart_charging'
  },
  // OVERRIDE CURRENTLIMITS
  currentlimits: [0, 6, 10, 16, 20, 25, 32],
  // OVERRIDE STATE TEXT - also overrides translation
  statetext: {
    disconnected: 'disconnected',
    awaiting_start: 'awaiting_start',
    charging: 'charging',
    completed: 'completed',
    error: 'error',
    ready_to_charge: 'ready_to_charge'
  },
  // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
  collapsiblebuttons: {
    group1: {
      text: 'click_for_group1',
      icon: 'mdi:speedometer'
    },
    group2: {
      text: 'click_for_group2',
      icon: 'mdi:information'
    },
    group3: {
      text: 'click_for_group3',
      icon: 'mdi:cog'
    }
  },
  //ICONS LEFT AND RIGHT
  info_left: [{
    entity_id: 'binary_sensor.#ENTITYPREFIX#_online',
    text: 'online'
  }],
  info_right: [{
    entity_id: 'sensor.#ENTITYPREFIX#_voltage',
    text: 'voltage',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_power',
    text: 'power',
    unit_show: true
  }],
  //LIMITS
  group1: [{
    entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit',
    text: 'dyn_charger_limit',
    service: 'easee.set_charger_dynamic_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      current: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit',
    text: 'dyn_circuit_limit',
    service: 'easee.set_charger_circuit_dynamic_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      currentP1: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit',
    text: 'max_charger_limit',
    service: 'easee.set_charger_max_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      current: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit',
    text: 'max_circuit_limit',
    service: 'easee.set_circuit_max_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      currentP1: '#SERVICEVAL#'
    }
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit',
    text: 'offline_circuit_limit',
    service: 'easee.set_charger_circuit_offline_limit',
    service_data: {
      charger_id: '#SERVICEID#',
      currentP1: '#SERVICEVAL#'
    }
  }],
  //INFO
  group2: [{
    entity_id: 'binary_sensor.#ENTITYPREFIX#_online',
    text: 'online'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_voltage',
    text: 'voltage',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_power',
    text: 'power',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_current',
    text: 'charger_current',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_circuit_current',
    text: 'circuit_current',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_energy_per_hour',
    text: 'energy_per_hour',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
    text: 'session_energy',
    unit_show: true
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_lifetime_energy',
    text: 'lifetime_energy',
    unit_show: true
  }],
  //CONFIG
  group3: [{
    entity_id: 'switch.#ENTITYPREFIX#_is_enabled',
    text: 'enabled'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_enable_idle_current',
    text: 'idle_current'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_cable_locked',
    text: 'cable_locked'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_cable_locked_permanently',
    text: 'perm_cable_locked'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_smart_charging',
    text: 'smart_charging'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_cost_per_kwh',
    text: 'cost_per_kwh'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_update_available',
    text: 'update_available'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
    text: 'schedule'
  }],
  //STATS - based on state of main entity, default if state not found
  stats: {
    default: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'switch.#ENTITYPREFIX#_cable_locked_permanently',
      text: 'cable_locked'
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }],
    disconnected: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'switch.#ENTITYPREFIX#_cable_locked_permanently',
      text: 'cable_locked'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }],
    awaiting_start: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }, {
      entity_id: 'switch.#ENTITYPREFIX#_smart_charging',
      text: 'smart_charging'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }],
    charging: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_energy_per_hour',
      text: 'energy_per_hour',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_circuit_current',
      text: 'circuit_current',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_output_limit',
      text: 'output_limit',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_current',
      text: 'current',
      unit_show: true
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_power',
      text: 'power',
      unit_show: true
    }],
    completed: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }],
    error: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }],
    ready_to_charge: [{
      entity_id: 'sensor.#ENTITYPREFIX#_session_energy',
      text: 'session_energy',
      unit_show: true
    }, {
      entity_id: 'binary_sensor.#ENTITYPREFIX#_basic_schedule',
      text: 'schedule'
    }, {
      entity_id: 'calculated',
      text: 'used_limit',
      unit: 'A',
      unit_show: true,
      calc_function: 'min',
      calc_entities: [{
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_dynamic_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_charger_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_max_circuit_limit'
      }, {
        entity_id: 'sensor.#ENTITYPREFIX#_offline_circuit_limit'
      }]
    }]
  },
  // TOOLBAR
  toolbar_left: {
    default: [{}],
    disconnected: [{}],
    awaiting_start: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.resume',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'resume',
      icon: 'hass:play'
    }, {
      service: 'easee.override_schedule',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'override',
      icon: 'hass:motion-play'
    }],
    charging: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.pause',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'pause',
      icon: 'hass:pause'
    }],
    completed: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.override_schedule',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'override',
      icon: 'hass:motion-play'
    }],
    error: [{
      service: 'easee.reboot',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'reboot',
      icon: 'hass:restart'
    }],
    ready_to_charge: [{
      service: 'easee.stop',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'stop',
      icon: 'hass:stop'
    }, {
      service: 'easee.override_schedule',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'override',
      icon: 'hass:motion-play'
    }]
  },
  toolbar_right: {
    default: [{
      service: 'persistent_notification.create',
      service_data: {
        message: 'Firmware update is available, but only possible when disconnected!',
        title: 'Update'
      },
      text: 'update',
      icon: 'mdi:file-download',
      conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available'
    }],
    disconnected: [{
      service: 'easee.update_firmware',
      service_data: {
        charger_id: '#SERVICEID#'
      },
      text: 'update',
      icon: 'mdi:file-download',
      conditional_entity: 'binary_sensor.#ENTITYPREFIX#_update_available'
    }]
  }
};

/** VOLKSWAGEN e-GOLF */
const MAIN_ENTITY_BASE = '_position'; //Defines what should be replaced from main entity name to use as template for other entities

const DEFAULT_CONFIG = {
  show_leds: false
};
const DEFAULT_DETAILS = {
  //NAME, LOCATION, STATUS ETC
  name: 'e-Golf',
  status: {
    entity_id: 'device_tracker.#ENTITYPREFIX#_position'
  },
  location: {
    entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
    unit_show: true
  },
  substatus: {
    entity_id: 'sensor.#ENTITYPREFIX#_last_connected'
  },
  // OVERRIDE STATE TEXT - also overrides translation
  statetext: {
    home: 'home',
    away: 'away'
  },
  // OVERRIDE COLLAPSIBLE BUTTON ICONS AND TOOLTIP TEXT
  collapsiblebuttons: {
    group1: {
      text: 'click_for_group1',
      icon: 'mdi:lock'
    },
    group2: {
      text: 'click_for_group2',
      icon: 'mdi:information'
    },
    group3: {
      text: 'click_for_group3',
      icon: 'mdi:cog'
    }
  },
  //ICONS LEFT AND RIGHT
  info_left: [{
    entity_id: 'binary_sensor.#ENTITYPREFIX#_charging_cable_connected',
    text: 'connected'
  }],
  info_right: [{
    entity_id: 'sensor.#ENTITYPREFIX#_battery_level',
    text: 'soc',
    unit_show: true
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_charging',
    text: 'charging',
    icon: 'mdi:ev-station'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_charging_time_left',
    text: 'charging_time_left',
    unit_show: true
  }],
  //LIMITS
  group1: [{
    entity_id: 'binary_sensor.#ENTITYPREFIX#_charging_cable_locked',
    text: 'cable_locked',
    type: 'info'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_doors_locked',
    text: 'doors_locked',
    type: 'info'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_hood_closed',
    text: 'hood_closed',
    type: 'info'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_trunk_closed',
    text: 'trunk_closed',
    type: 'info'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_windows_closed',
    text: 'windows_closed',
    type: 'info'
  }],
  //INFO
  group2: [{
    entity_id: 'sensor.#ENTITYPREFIX#_battery_level',
    text: 'soc'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_charging_cable_connected',
    text: 'connected'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
    text: 'range'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_energy_flow',
    text: 'energy_flow'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_external_power',
    text: 'external_power'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_electric_engine_consumption',
    text: 'avg_consumption'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_speed',
    text: 'avg_speed'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_outside_temperature',
    text: 'outside_temperature'
  }, {
    entity_id: 'sensor.#ENTITYPREFIX#_climatisation_target_temperature',
    text: 'climate_target_temp'
  }, {
    entity_id: 'binary_sensor.#ENTITYPREFIX#_parking_light',
    text: 'parking_light'
  }],
  //CONFIG
  group3: [{
    entity_id: 'switch.#ENTITYPREFIX#_charging',
    text: 'charging'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_climatisation_from_battery',
    text: 'clima_from_battery'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_electric_climatisation',
    text: 'electric_climatisation'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_window_heater',
    text: 'window_heater'
  }, {
    entity_id: 'switch.#ENTITYPREFIX#_force_data_refresh',
    text: 'force_data_refresh'
  }, {
    entity_id: 'lock.#ENTITYPREFIX#_door_locked',
    text: 'door_locked'
  }, {
    entity_id: 'lock.#ENTITYPREFIX#_trunk_locked',
    text: 'trunk_locked'
  }],
  //STATS - based on state of main entity, default if state not found
  stats: {
    default: [{
      entity_id: 'sensor.#ENTITYPREFIX#_odometer',
      text: 'odometer'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
      text: 'range'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_electric_engine_consumption',
      text: 'avg_consumption'
    }],
    home: [{
      entity_id: 'sensor.#ENTITYPREFIX#_odometer',
      text: 'odometer'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
      text: 'range'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_electric_engine_consumption',
      text: 'avg_consumption'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_charging_time_left',
      text: 'charging_time_left'
    }],
    away: [{
      entity_id: 'sensor.#ENTITYPREFIX#_odometer',
      text: 'odometer'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_last_connected',
      text: 'last_connected'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_electric_range',
      text: 'range'
    }, {
      entity_id: 'sensor.#ENTITYPREFIX#_last_trip_average_electric_engine_consumption',
      text: 'avg_consumption'
    }]
  },
  // TOOLBAR
  toolbar_left: {
    default: [{}],
    home: [{
      service: 'switch.toggle',
      service_data: {
        entity_id: 'entity_id: switch.#ENTITYPREFIX#_charging'
      },
      text: 'toggle_charging',
      icon: 'mdi:ev-station'
    }],
    away: [{
      service: 'switch.toggle',
      service_data: {
        entity_id: 'switch.#ENTITYPREFIX#_charging'
      },
      text: 'toggle_charging',
      icon: 'mdi:ev-station'
    }, {
      service: 'switch.toggle',
      service_data: {
        entity_id: 'switch.#ENTITYPREFIX#_electric_climatisation'
      },
      text: 'toggle_clima',
      icon: 'mdi:radiator'
    }, {
      service: 'switch.toggle',
      service_data: {
        entity_id: 'switch.#ENTITYPREFIX#_window_heater'
      },
      text: 'toggle_window_heater',
      icon: 'mdi:car-defrost-rear'
    }]
  },
  toolbar_right: {
    default: [{
      service: 'switch.toggle',
      service_data: {
        entity_id: 'switch.#ENTITYPREFIX#_force_data_refresh'
      },
      text: 'force_refresh',
      icon: 'mdi:car-connected'
    }]
  }
};

var img$d = "data:image/png;base64,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";

var img$c = "data:image/png;base64,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";

var img$b = "data:image/png;base64,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";

var img$a = "data:image/png;base64,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";

var img$9 = "data:image/png;base64,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";

var img$8 = "data:image/png;base64,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";

var img$7 = "data:image/gif;base64,R0lGODlhAwBIAHAAACwAAAAAAwBIAIGAgIAAAAAAAAAAAAACDYSPqcvtD6OctNqLVQEAOw==";

var img$6 = "data:image/gif;base64,R0lGODlhAwBIAHAAACwAAAAAAwBIAIFwcHBgYGD///8AAAACHYSDqZvmwOJ6R1oKrcR60x5x4EQJ5ommJ6a2qVMAADs=";

var img$5 = "data:image/gif;base64,R0lGODlhAwBIAHAAACwAAAAAAwBIAIFwcHD///8AAAAAAAACGYSDqZvmwOJ6R1oKrcR60x5x4PSNimgiTgEAOw==";

var img$4 = "data:image/gif;base64,R0lGODlhAwBIAIAAAAAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/hZDcmVhdGVkIHdpdGggUGFpbnQuTkVUACH5BAkZAAAALAAAQQADAAYAAAIEjI95BQAh+QQJGQAAACwAADkAAwAOAAACB4yPecCtnwoAIfkECRkAAAAsAAAxAAMAFgAAAgqMj3nArZ+ag7QAACH5BAkZAAAALAAAKQADAB4AAAIMjI95wK2fmoNUMkoLACH5BAkZAAAALAAAIQADACYAAAIOjI95wK2fmoNUMlothgUAIfkECRkAAAAsAAAZAAMALgAAAhGMj3nArZ+ag1QyWi2GFuxXAAAh+QQJGQAAACwAABEAAwA2AAACE4yPecCtn5qDVDJaLYYW7Nd9SgEAIfkECRkAAAAsAAAJAAMAPgAAAhWMj3nArZ+ag1QyWi2GFuzXfUooIgUAIfkECRkAAAAsAAABAAMARgAAAheMj3nArZ+ag1QyWi2GFuzXfUooImRpFAA7";

var img$3 = "data:image/gif;base64,R0lGODlhAwBIAHAAACwAAAAAAwBIAIFwcHBgYGAAJv8AAAACHYSDqZvmwOJ6R1oKrcR60x5x4EQJ5ommJ6a2qVMAADs=";

var img$2 = "data:image/gif;base64,R0lGODlhAwBIAHAAACwAAAAAAwBIAIFwcHAAJv8AAAAAAAACGYSDqZvmwOJ6R1oKrcR60x5x4PSNimgiTgEAOw==";

var img$1 = "data:image/gif;base64,R0lGODlhAwBIAIAAAAAAAAAm/yH/C05FVFNDQVBFMi4wAwEAAAAh/hZDcmVhdGVkIHdpdGggUGFpbnQuTkVUACH5BAkZAAAALAAAQQADAAYAAAIEjI95BQAh+QQJGQAAACwAADkAAwAOAAACB4yPecCtnwoAIfkECRkAAAAsAAAxAAMAFgAAAgqMj3nArZ+ag7QAACH5BAkZAAAALAAAKQADAB4AAAIMjI95wK2fmoNUMkoLACH5BAkZAAAALAAAIQADACYAAAIOjI95wK2fmoNUMlothgUAIfkECRkAAAAsAAAZAAMALgAAAhGMj3nArZ+ag1QyWi2GFuxXAAAh+QQJGQAAACwAABEAAwA2AAACE4yPecCtn5qDVDJaLYYW7Nd9SgEAIfkECRkAAAAsAAAJAAMAPgAAAhWMj3nArZ+ag1QyWi2GFuzXfUooIgUAIfkECRkAAAAsAAABAAMARgAAAheMj3nArZ+ag1QyWi2GFuzXfUooImRpFAA7";

var img = "data:image/gif;base64,R0lGODlhAwBIAIEAAAAAAGBgYP8AAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hZDcmVhdGVkIHdpdGggUGFpbnQuTkVUACH5BAkZAAAALAAAAAADAEgAAAINjI+py+0Po5y02otVAQAh+QQJGQAAACwAAAEAAwBGAAACF5SPecCtn5qDVDJaLYYW7Nd9SigiZGkUADs=";

const VERSION = '0.0.14'; //Replacement tags

const ENTITYPREFIX = '#ENTITYPREFIX#';
const SERVICEID = '#SERVICEID#';
const SERVICEID_ENTITY = '#SERVICEID_MAIN_ENTITY#';
const SERVICEID_STATE = '#SERVICEID_MAIN_STATE#';
const SERVICEID_ATTR = '#SERVICEID_MAIN_ATTR#';
const SERVICEVAL = '#SERVICEVAL#';
const CARDCONFIGTYPES = [{
  'domain': 'easee',
  'name': 'Easee charger',
  'defaults': DEFAULT_CONFIG$2,
  'domainconfig': DEFAULT_DETAILS$2,
  'domainbase': MAIN_ENTITY_BASE$2,
  'serviceid': SERVICEID_ATTR,
  'serviceid_data': {
    entity: null,
    attr: 'id'
  }
}, {
  'domain': 'vwegolf',
  'name': 'VW e-golf',
  'defaults': DEFAULT_CONFIG,
  'domainconfig': DEFAULT_DETAILS,
  'domainbase': MAIN_ENTITY_BASE,
  'serviceid': SERVICEID_ATTR,
  'serviceid_data': {
    entity: null,
    attr: null
  }
}, {
  'domain': 'test',
  'name': 'Test',
  'defaults': DEFAULT_CONFIG$2,
  'domainconfig': DEFAULT_DETAILS$2,
  'domainbase': MAIN_ENTITY_BASE$2,
  'serviceid': SERVICEID_STATE,
  'serviceid_data': {
    entity: null,
    attr: null
  }
}, {
  'domain': 'template',
  'name': 'Template',
  'defaults': DEFAULT_CONFIG$1,
  'domainconfig': DEFAULT_DETAILS$1,
  'domainbase': MAIN_ENTITY_BASE$1,
  'serviceid': SERVICEID_STATE,
  'serviceid_data': {
    entity: null,
    attr: 'id'
  }
}]; // TODO: Find a way to read device_class icons instead of this

const DEVICECLASS_ICONS = {
  voltage: 'mdi:sine-wave',
  lock: 'mdi:lock',
  connectivity: 'mdi:wifi',
  current: 'mdi:sine-wave',
  energy: 'mdi:flash',
  power: 'mdi:flash',
  plug: 'mdi:power-plug'
};
const DEFAULT_ICON = 'mdi:crosshairs-question';
const DEFAULT_IMAGE = 'Generic';
const CHARGER_IMAGES = [{
  name: 'Generic',
  img: img$d
}, {
  name: 'Anthracite',
  img: img$c
}, {
  name: 'Red',
  img: img$b
}, {
  name: 'Black',
  img: img$a
}, {
  name: 'White',
  img: img$9
}, {
  name: 'Darkblue',
  img: img$8
}];
const DEFAULT_CURRENTLIMITS = [8.0, 10.0, 16.0, 20.0, 25.0, 32.0];
const DEFAULT_CUSTOMCARDTHEME = 'theme_default';
const CARD_THEMES = [{
  name: 'theme_default',
  desc: 'Default HA colors'
}, {
  name: 'theme_custom',
  desc: 'Use custom theme'
}, {
  name: 'theme_transp_blue',
  desc: 'Transparent Blue'
}, {
  name: 'theme_transp_black',
  desc: 'Transparent Black'
}, {
  name: 'theme_transp_white',
  desc: 'Transparent White'
}, {
  name: 'theme_lightgrey_blue',
  desc: 'LightGrey Blue'
}];
const LEDIMAGES = {
  normal: {
    DEFAULT: img$7,
    disconnected: img$6,
    awaiting_start: img$5,
    charging: img$4,
    completed: img$5,
    error: img,
    ready_to_charge: img$5
  },
  smart: {
    DEFAULT: img$7,
    disconnected: img$3,
    awaiting_start: img$2,
    charging: img$1,
    completed: img$2,
    error: img,
    ready_to_charge: img$2
  }
};

// import * as template from './const_template.js';

class ChargerCardEditor extends LitElement {
  static get properties() {
    return {
      hass: Object,
      _config: Object,
      _toggle: Boolean
    };
  }

  get _chargerImage() {
    if (this._config) {
      return this._config.chargerImage || DEFAULT_IMAGE;
    }

    return DEFAULT_IMAGE;
  }

  get _customCardTheme() {
    if (this._config) {
      return this._config.customCardTheme || '';
    }

    return DEFAULT_CUSTOMCARDTHEME;
  }

  get _show_name() {
    if (this._config) {
      return this._config.show_name !== undefined ? this._config.show_name : true;
    }

    return true;
  }

  get _show_leds() {
    if (this._config) {
      return this._config.show_leds !== undefined ? this._config.show_leds : true;
    }

    return true;
  }

  get _show_status() {
    if (this._config) {
      return this._config.show_status !== undefined ? this._config.show_status : true;
    }

    return true;
  }

  get _show_toolbar() {
    if (this._config) {
      return this._config.show_toolbar !== undefined ? this._config.show_toolbar : true;
    }

    return true;
  }

  get _show_stats() {
    if (this._config) {
      return this._config.show_stats !== undefined ? this._config.show_stats : true;
    }

    return true;
  }

  get _show_collapsibles() {
    if (this._config) {
      return this._config.show_collapsibles !== undefined ? this._config.show_collapsibles : true;
    }

    return true;
  }

  get _compact_view() {
    if (this._config) {
      return this._config.compact_view !== undefined ? this._config.compact_view : false;
    }

    return false;
  }

  get debug() {
    if (this._config) {
      return this._config.debug !== undefined ? this._config.debug : false;
    }

    return false;
  }

  setConfig(config) {
    this._config = config;

    if (!this._config.entity) {
      this._config.entity = this.getAllEntitiesByType('sensor')[0] || '';
      A(this, 'config-changed', {
        config: this._config
      });
    }
  }

  get_config(item) {
    if (this._config) {
      return this._config[`${item}`] || '';
    }

    return '';
  }

  log(debug) {
    if (this.debug !== undefined && this.debug === true) {
      console.log(debug);
    }
  } // get_sensors(sensor) {
  //   if (this._config) {
  //     return this._config[`${sensor}`] || '';
  //   }
  //   return '';
  // }


  getAllEntities() {
    return Object.keys(this.hass.states);
  }

  getAllEntitiesByType(type) {
    return Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === type);
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const allEntities = this.getAllEntities();
    return html`
      <div class="card-config">

      <strong>
      ${localize('editor.instruction')}
      </strong>

        <paper-dropdown-menu label="${localize('editor.entity')}" @value-changed=${this._valueChanged} .configValue=${'entity'}>
          <paper-listbox slot="dropdown-content" .selected=${allEntities.indexOf(this.get_config("entity"))}>
            ${allEntities.map(entity => {
      return html` <paper-item>${entity}</paper-item> `;
    })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-dropdown-menu label="${localize('editor.brand')}" @value-changed=${this.setConfigDetails} .configValue=${'brand'}>
          <paper-listbox slot="dropdown-content" .selected=${CARDCONFIGTYPES.findIndex(brand => brand.domain === this.get_config("brand"))}>
            ${Object.values(CARDCONFIGTYPES).map(brand => {
      return html` <paper-item>${brand.domain}</paper-item> `;
    })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-dropdown-menu label="${localize('editor.theme')}" @value-changed=${this._valueChanged} .configValue=${'customCardTheme'}>
          <paper-listbox slot="dropdown-content" selected="${this._customCardTheme}" attr-for-selected="value">
            ${CARD_THEMES.map(customCardTheme => {
      return html` <paper-item value="${customCardTheme.name}">${customCardTheme.name}</paper-item> `;
    })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-dropdown-menu label="${localize('editor.chargerImage')}" @value-changed=${this._valueChanged} .configValue=${'chargerImage'}>
          <paper-listbox slot="dropdown-content" selected="${this._chargerImage}" attr-for-selected="value">
            ${CHARGER_IMAGES.map(chargerImage => {
      return html` <paper-item value="${chargerImage.name}">${chargerImage.name}</paper-item> `;
    })}
          </paper-listbox>
        </paper-dropdown-menu>

        <paper-input label="${localize('editor.customImage')}" .value=${this.get_config("customImage")} .configValue=${'customImage'} @value-changed=${this._valueChanged}"></paper-input>
        <p class="option">
          <ha-switch
            aria-label=${localize(this._compact_view ? 'editor.compact_view_aria_label_off' : 'editor.compact_view_aria_label_on')}
            .checked=${this._compact_view !== false}
            .configValue=${'compact_view'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.compact_view')}
        </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(this._show_name ? 'editor.show_name_aria_label_off' : 'editor.show_name_aria_label_on')}
            .checked=${this._show_name}
            .configValue=${'show_name'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_name')} [${this._show_name}]
        </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(this._show_leds ? 'editor.show_leds_aria_label_off' : 'editor.show_leds_aria_label_on')}
            .checked=${this._show_leds !== false}
            .configValue=${'show_leds'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_leds')}
        </p>


        <p class="option">
          <ha-switch
            aria-label=${localize(this._show_status ? 'editor.show_status_aria_label_off' : 'editor.show_status_aria_label_on')}
            .checked=${this._show_status !== false}
            .configValue=${'show_status'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_status')}
        </p>

        <p class="option">
        <ha-switch
          aria-label=${localize(this._show_collapsibles ? 'editor.show_collapsibles_aria_label_off' : 'editor.show_collapsibles_aria_label_on')}
          .checked=${this._show_collapsibles !== false}
          .configValue=${'show_collapsibles'}
          @change=${this._valueChanged}
        >
        </ha-switch>
        ${localize('editor.show_collapsibles')}
      </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(this._show_stats ? 'editor.show_stats_aria_label_off' : 'editor.show_stats_aria_label_on')}
            .checked=${this._show_stats}
            .configValue=${'show_stats'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_stats')}
        </p>

        <p class="option">
          <ha-switch
            aria-label=${localize(this._show_toolbar ? 'editor.show_toolbar_aria_label_off' : 'editor.show_toolbar_aria_label_on')}
            .checked=${this._show_toolbar !== false}
            .configValue=${'show_toolbar'}
            @change=${this._valueChanged}
          >
          </ha-switch>
          ${localize('editor.show_toolbar')}
        </p>

        <strong>
          ${localize('editor.code_only_note')}
        </strong>
      </div>
    `;
  }

  setConfigDetails(ev) {
    // SKIP EQUAL OR EMPTY BRAND CONFIG
    if (this._config["brand"] == ev.target.value || ev.target.value == '') return; // SKIP EMPTY ENTITY, MUST BE SELECTED FIRST

    if (this._config["entity"] === undefined || this._config["entity"] == '') return;

    this._valueChanged(ev);

    let brand = ev.target.value;
    let domainconfig, domainbase, entityprefix, serviceid, defaults;
    let carddetails = CARDCONFIGTYPES[CARDCONFIGTYPES.findIndex(brandObj => brandObj.domain === brand)];
    domainconfig = carddetails.domainconfig;
    domainbase = carddetails.domainbase;
    defaults = carddetails.defaults; // Use main entity as default unless given otherwise in template

    if (carddetails.serviceid_data.entity === null) carddetails.serviceid_data.entity = this._config.entity; // Get which data to use for service calls

    switch (carddetails.serviceid) {
      case SERVICEID_ENTITY:
        serviceid = carddetails.serviceid_data.entity;
        break;

      case SERVICEID_STATE:
        serviceid = this.hass.states[carddetails.serviceid_data.entity].state;
        break;

      case SERVICEID_ATTR:
        serviceid = this.hass.states[carddetails.serviceid_data.entity].attributes[carddetails.serviceid_data.attr];
        break;
    } // Set prefix by domain


    entityprefix = this._config.entity.split('.')[1].replace(domainbase, ''); // Replace template with actual data

    try {
      var domainconfig_str = JSON.stringify(domainconfig);
      domainconfig_str = this.replaceAll(domainconfig_str, ENTITYPREFIX, entityprefix);
      domainconfig_str = this.replaceAll(domainconfig_str, SERVICEID, serviceid);
      domainconfig = JSON.parse(domainconfig_str);
    } catch (err) {
      console.error("Something went wrong with the default setup, please check your YAML configuration or enable debugging to see details.");
    }

    this.log("domain: " + brand + ", entityprefix: " + entityprefix + ", serviceid: " + serviceid);
    this.log(domainconfig); // Set config

    let details = {};

    for (let data in domainconfig) {
      details[`${data}`] = domainconfig[data];
    }

    this._config = { ...this._config,
      ...defaults
    };
    this._config = { ...this._config,
      details
    };
    A(this, 'config-changed', {
      config: this._config
    });
    return;
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      console.log("C: no config");
      return;
    }

    const target = ev.target;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }

    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config
        };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = { ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value
        };
      }
    }

    A(this, 'config-changed', {
      config: this._config
    });
  }

  static get styles() {
    return css`
      .card-config paper-dropdown-menu {
        width: 100%;
      }

      .option {
        display: flex;
        align-items: center;
      }

      .option ha-switch {
        margin-right: 10px;
      }
    `;
  }

}
customElements.define('charger-card-editor', ChargerCardEditor);

var styles = css`
  :host {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  ha-card {
    flex-direction: column;
    flex: 1;
    position: relative;
    padding: 0px;
    // border-radius: 4px;
    // overflow: hidden;    // Removed to show tooltips outside of card

    // border-color: coral;
    // border-style: solid;
  }

  .preview {
    background: var(
      --custom-card-background-color
    ); //var(--custom-primary-color);
    cursor: pointer;
    // overflow: hidden;  // Removed to show tooltips outside of card
    position: relative;
    // height: auto;
    height: 100%;

    // border-color: yellow;
    // border-style: solid;
  }

  .preview-compact {
    background: var(
      --custom-card-background-color
    ); //var(--custom-primary-color);
    cursor: pointer;
    overflow: hidden;
    position: relative;
    height: 220px;

    // // border-color: yellow;
    // // border-style: solid;
  }

  .preview.not-available {
    filter: grayscale(1);
  }

  .image{
    display: block;
    align-items: center;
    justify-content: center;
    text-align: center;



    // border-color: yellow;
    // border-style: dashed;


  }

  .charger {
    // display: block;
    max-width: 90%;
    max-height: 200px;
    image-rendering: crisp-edges;
    margin: 30px auto 20px auto;

    // // border-color: red;
    // // border-style: dashed;
  }

  .charger-compact {
    display: block;
    // max-width: 50%;
    // width: 130px;
    max-width: 400px;
    max-height: 130px;
    image-rendering: crisp-edges;
    margin: 20px auto 10px 20px;
    position: absolute;
    // left: -150px;
    // top: -20px;
    left: 10px;
    top: 0px;

    // // border-color: red;
    // // border-style: dashed;
  }

  .charger.led {
    visibility: visible;
    display: block;
    width: 2px;
    position: relative;
    top: -200px;

    // display: block;
    // position: relative;
    // top: -175px;
    // position: absolute;
    // // top: 95px;
    // // left: 245px;
    // width: 2px;

    // // border-color: red;
    // // border-style: dashed;

  }

  .charger.led-hidden {
    visibility: hidden;
    display: block;
    width: 2px;
    position: relative;
    top: -175px;

  }


  .charger.led-compact {
    // position: relative;
    position: absolute;
    top: 20px;
    // position: absolute;
    // top: 95px;
    // left: -170px;
    left: 77px;
    top: 22px;
    width: 1.4px;

    // // border-color: red;
    // // border-style: dashed;
  }

  .charger.charging,
  .charger.on {
    animation: cleaning 5s linear infinite;
  }

  .charger.returning {
    animation: returning 2s linear infinite;
  }

  .charger.paused {
    opacity: 100%;
  }

  .charger.standby {
    opacity: 50%;
  }

  .fill-gap {
    flex-grow: 1;
  }

  .header {
    height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: var(--custom-text-color);

    // border-color: green;
    // border-style: dashed;
  }

  .infoitems {
    // display: flex;
    height: 250px;
    text-align: right;
    // font-weight: bold;
    // transform: translate(-10px, 50%);
    color: var(--custom-text-color);
    top: 30px;
    right: 10px;
    position: absolute;

    // border-color: darkblue;
    // border-style: dashed;
  }

  .infoitems-left {
    // display: flex;
    height: 250px;
    text-align: right;
    // font-weight: bold;
    // transform: translate(10px, 50%);
    color: var(--custom-text-color);
    top: 30px;
    left: 10px;
    position: absolute;

    // border-color: darkgreen;
    // border-style: dashed;
  }

  .infoitems-item-info_right {
    display: flex;
    // spacing: 0px 0 40
    // text-align: right;
    justify-content: right;
    padding: 5px;
    font-weight: bold;
    color: var(--custom-text-color);

    border: 1px;
    // border-style: dotted;
  }

  .infoitems-item-info_left {
    display: flex;
    // spacing: 0px 0 40
    // text-align: right;
    justify-content: left;
    padding: 5px;
    font-weight: bold;
    color: var(--custom-text-color);

    border: 1px;
    // border-style: dotted;
  }

  .metadata {
    display: block;
    // margin: 20px auto;
    // position: relative;
    // top: -50px;
    position: absolute;
    justify-content: centre;
    top: 270px;
    width: 100%;

    // border-color: pink;
    // border-style: dashed;
  }

  .status {
    display: block;
    align-items: center;
    justify-content: center;
    text-align: center;
    // position: absolute;


    // // border-color: pink;
    // // border-style: dashed;
  }

  .status-compact {
    // display: block;
    // align-items: center;
    // justify-content: center;
    // text-align: center;
    // position: relative;
    // top: -250px;
    // // left: 200px;
    // // padding-left: 200px;

    display: block;
    // align-items: center;
    // justify-content: center;
    // text-align: center;
    // font-weight: bold;
    color: var(--custom-text-color);
    position: absolute;
    left: 160px;
    top: 65px;

    // // border-color: pink;
    // // border-style: dashed;
  }

  .status-text {
    color: var(--custom-text-color);
    white-space: nowrap;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-left: calc(20px + 9px); /* size + margin of spinner */
    text-transform: uppercase;
    font-size: 22px;
  }
  .status-text-compact {
    color: var(--custom-text-color);
    white-space: nowrap;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    // margin-left: calc(20px + 9px); /* size + margin of spinner */
    text-transform: uppercase;
    font-size: 16px;
  }

  .status-detail-text {
    color: var(--custom-text-color);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-transform: uppercase;
    font-size: 9px;
  }

  .status-detail-text-compact {
    // margin-left: calc(20px + 9px); /* size + margin of spinner */
    color: var(--custom-text-color);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-transform: uppercase;
    font-size: 9px;
  }

  .status ha-circular-progress {
    --mdc-theme-primary: var(
      --custom-card-background-color
    ); /* hack to override the color */
    min-width: 24px;
    width: 24px;
    height: 24px;
    margin-left: 9px;
  }

  .charger-name {
    text-align: center;
    // font-weight: bold;
    color: var(--custom-text-color);
    font-size: 16px;

    // // border-color: grey;
    // // border-style: dashed;
  }

  .charger-name-compact {
    // display: block;
    // align-items: center;
    // justify-content: center;
    // text-align: center;
    // font-weight: bold;
    color: var(--custom-text-color);
    font-size: 16px;
    // position: relative;
    position: absolute;
    left: 160px;
    top: 55px;
    // // border-color: grey;
    // // border-style: dashed;
  }

  .not-available {
    text-align: center;
    color: var(--custom-text-color);
    font-size: 16px;
  }

  .stats {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);
    width: 100%;


    // position: relative;
    // top: 100px;
    // top: 450px;
    // top: 450px;


    // border-color: black;
    // border-style: dashed;
  }

  .stats-compact {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);

    width: 100%;
    position: absolute;
    left: 0px;
    top: 160px;

    // // border-color: black;
    // // border-style: dashed;
  }

  .stats-block {
    margin: 10px 0px;
    text-align: center;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    flex-grow: 1;
    // // border-color: black;
    // // border-style: dashed;
  }

  .stats-block:last-child {
    border: 0px;
  }

  .stats-value {
    font-size: 20px;
    font-weight: bold;
  }

  ha-icon {
    // color: #fff;
    color: var(--custom-icon-color);
  }

  .toolbar {
    // background: var(--lovelace-background, var(--primary-background-color));
    min-height: 30px;
    display: flex;
    margin: 0 20px 0 20px;
    flex-direction: row;
    justify-content: space-evenly;

    // // border-color: black;
    // // border-style: dashed;
  }

  .toolbar ha-icon-button {
    color: var(--custom-primary-color);
    flex-direction: column;
    width: 44px;
    height: 44px;
    --mdc-icon-button-size: 44px;
    margin: 5px 0;

    // // border-color: red;
    // // border-style: dashed;
  }

  .toolbar ha-icon-button:first-child {
    margin-left: 5px;
  }

  .toolbar ha-icon-button:last-child {
    margin-right: 5px;
  }

  .toolbar paper-button {
    color: var(--custom-primary-color);
    flex-direction: column;
    margin-right: 10px;
    padding: 10px;
    cursor: pointer;

    // // border-color: blue;
    // // border-style: dashed;
  }

  .toolbar ha-icon-button:active,
  .toolbar paper-button:active {
    opacity: 0.4;
    background: rgba(0, 0, 0, 0.1);
  }

  .toolbar paper-button {
    color: var(--custom-primary-color);
    flex-direction: row;
  }

  .toolbar ha-icon {
    color: var(--custom-primary-color);
    padding-right: 15px;
  }

  /* Tooltip container */

  .tooltip {
    position: relative;
    display: inline-block;
    // border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
  }

  /* Tooltip text */
  .tooltip .tooltiptext-right {
    visibility: hidden;
    width: 160px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 1px 0;
    position: absolute;
    top: 110%;
    right: -60px;
    z-index: 1;
    margin-left: -80px;
  }


  /* Tooltip text */
  .tooltip .tooltiptext {
    visibility: hidden;
    width: 160px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 1px 0;
    position: absolute;
    top: 110%;
    left: 20px;
    z-index: 1;
    margin-left: -80px;
  }

  .tooltip .tooltiptext::after, .tooltip-right .tooltiptext-right::after, .tooltip .tooltiptext-right::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    // border-style: solid;
    // border-color: transparent transparent black transparent;
  }


  .tooltip-right .tooltiptext-right {
    visibility: hidden;
    width: 160px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 1px 0;
    position: absolute;
    z-index: 1;
    margin-left: -80px;
    top: 5px;
    right: 105%;
  }


  .tooltip:hover .tooltiptext, .tooltip-right:hover .tooltiptext-right, .tooltip:hover .tooltiptext-right {
    visibility: visible;
  }

  /* CSS COLLAPSIBLE */

  input[type='checkbox'] {
    display: none;
  }

  .lbl-toggle {
    display: block;
    // text-align: right;
    // padding: 1rem;
    padding: 5px;
    // margin: auto;
    color: var(--custom-text-color);
    background: transparent;
    // transition: all 0.25s ease-out;
    position: absolute;
    // bottom: 70px;
    top: 330px;
    right: 0px;
    // left: 40%;

    width: 30px;
    height: 30px;
    // align: right;
    // float: right;
    z-index: 1;
    // margin-left: auto;
    // margin-right: auto;

    // border-style: dotted;
    // border-color: red;
  }

  .collapsible-content {
    max-height: 0px;
    overflow: hidden;

    // transition: max-height .25s ease-in-out;
  }

  .toggle:checked + .lbl-toggle + .collapsible-content {
    max-height: 200px;
    // height: 200px;
    position: relative;
    top: 0px;
    // margin-left: auto;
    // margin-right: auto;
    // width: 100%;
    margin: auto;

    text-align: center;
    vertical-align: middle;
    background: transparent;

    display: block;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);

    // // border-style: solid;
    // // border-color: red;
  }

  .collapsible-content .content-inner {
    color: var(--custom-text-color);
    background: transparent;
    text-align: center;
    max-height: 200px;
    height: 70px;
    // vertical-align: middle;
    // width: 100%;
    // z-index: 3;
    content: '';
    clear: both;
    display: table;

    margin-left: auto;
    margin-right: auto;

    // // border-style: dashed;
    // // border-color: white;
  }

  .collapsible-item {
    display: inline;
    text-align: center;
    align-items: center;
    padding: 5px;
    // font-weight: bold;
    // border: 1px;
    // // border-style: dotted;
    justify-content: center;
    vertical-align: middle;
  }

  paper-listbox {
    width: auto;
    min-width: 75px;
    // margin: 0px 0px 0px 0px;
    // padding: 0px 0px 0px 0px;
    padding: 0px;
    border: 1px dotted var(--custom-text-color);
    background: var(--custom-card-background-color);
    color: var(--custom-text-color);
    overflow-y: auto; /* vertical scrollbar */
    overflow-x: hidden; /* horizontal scrollbar */
  }

  paper-item {
    margin: 0px 0px 0px 5px;
    padding: 0px 0px 0px 5px;
    width: auto;
    color: var(--custom-text-color);
    cursor: pointer;
    background: transparent;
    font-size: 14px;

    border-bottom: 1px dotted var(--custom-text-color);

  }


  /* collapsible info */

  .lbl-toggle-info {
    display: block;
    padding: 5px;
    color: var(--custom-text-color);
    background: transparent;
    // transition: all 0.25s ease-out;
    position: absolute;
    // bottom: 100px;
    top: 300px;
    right: 0px;
    width: 30px;
    height: 30px;
    z-index: 1;

    // // border-style: dotted;
    // // border-color: darkblue;
  }

  .toggle-info:checked + .lbl-toggle-info + .collapsible-content-info {
    max-height: 200px;
    // height: 200px;
    position: relative;
    top: 0px;
    // margin-left: auto;
    // margin-right: auto;
    // width: 100%;
    margin: auto;

    text-align: center;
    vertical-align: middle;
    background: transparent;

    display: block;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);

    // // border-style: solid;
    // // border-color: red;
  }

  .collapsible-content-info .content-inner-info {
    color: var(--custom-text-color);
    background: transparent;
    text-align: center;
    max-height: 200px;
    height: 70px;
    // vertical-align: middle;
    // width: 100%;
    // z-index: 3;
    content: '';
    clear: both;
    display: table;

    margin-left: auto;
    margin-right: auto;

    // // border-style: dashed;
    // // border-color: white;
  }

  // .wrap-collabsible-info {
  //   // display: flex;
  //   // margin-bottom: 1.2rem 0;
  //   // // border-style: solid;
  //   // min-height:0px;
  //   // max-height:300px;
  //   height: 50px;

  //   // border-top: 1px solid rgba(255, 255, 255, 0.2);
  //   // display: flex;
  //   // flex-direction: row;
  //   // justify-content: space-evenly;
  //   // color: var(--custom-text-color);

  //   text-align: left;
  //   vertical-align: top;

  //   display: block;
  //   // flex-direction: row;
  //   // justify-content: space-evenly;
  //   // color: var(--custom-text-color);
  //   margin: auto;

  //   // border-color: black;
  //   // border-style: solid;

  // }

  // .wrap-collabsible {
  //   // display: flex;
  //   // margin-bottom: 1.2rem 0;
  //   // // border-style: solid;
  //   // min-height:0px;
  //   // max-height:300px;
  //   height: 50px;

  //   // border-top: 1px solid rgba(255, 255, 255, 0.2);
  //   // display: flex;
  //   // flex-direction: row;
  //   // justify-content: space-evenly;
  //   // color: var(--custom-text-color);

  //   text-align: left;
  //   vertical-align: top;

  //   display: block;
  //   // flex-direction: row;
  //   // justify-content: space-evenly;
  //   // color: var(--custom-text-color);
  //   margin: auto;

  //   // border-color: red;
  //   // border-style: solid;

  // }

  .collapsible-content-info {
    max-height: 0px;
    overflow: hidden;

    // transition: max-height .25s ease-in-out;
  }

  /* collapsible limits */

  .lbl-toggle-lim {
    display: block;
    padding: 5px;
    color: var(--custom-text-color);
    background: transparent;
    // transition: all 0.25s ease-out;
    position: absolute;
    // bottom: 100px;
    top: 270px;
    right: 0px;
    width: 30px;
    height: 30px;
    z-index: 1;

    // border-style: dotted;
    // border-color: darkblue;
  }

  .toggle-lim:checked + .lbl-toggle-lim + .collapsible-content-lim {
    max-height: 200px;
    // height: 200px;
    position: relative;
    top: 0px;
    // margin-left: auto;
    // margin-right: auto;
    // width: 100%;
    margin: auto;

    text-align: center;
    vertical-align: middle;
    background: transparent;

    display: block;
    flex-direction: row;
    justify-content: space-evenly;
    color: var(--custom-text-color);

    // // border-style: solid;
    // // border-color: red;
  }

  .collapsible-content-lim .content-inner-lim {
    color: var(--custom-text-color);
    background: transparent;
    text-align: center;
    max-height: 200px;
    height: 70px;
    // vertical-align: middle;
    // width: 100%;
    // z-index: 3;
    content: '';
    clear: both;
    display: table;

    margin-left: auto;
    margin-right: auto;
    padding-bottom: 15px;

    // // border-style: dashed;
    // // border-color: white;
  }

  // .wrap-collabsible-lim {
  //   // display: flex;
  //   // margin-bottom: 1.2rem 0;
  //   // // border-style: solid;
  //   // min-height:0px;
  //   // max-height:300px;
  //   height: 50px;

  //   // border-top: 1px solid rgba(255, 255, 255, 0.2);
  //   // display: flex;
  //   // flex-direction: row;
  //   // justify-content: space-evenly;
  //   // color: var(--custom-text-color);

  //   text-align: left;
  //   vertical-align: top;

  //   display: block;
  //   // flex-direction: row;
  //   // justify-content: space-evenly;
  //   // color: var(--custom-text-color);
  //   margin: auto;

  //   // border-color: black;
  //   // border-style: solid;

  // }

  .collapsible-content-lim {
    max-height: 0px;
    overflow: hidden;

    // transition: max-height .25s ease-in-out;
  }
`;

class ChargerCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      requestInProgress: Boolean
    };
  }

  static async getConfigElement() {
    return document.createElement('charger-card-editor');
  }

  static getStubConfig(hass, entities) {
    const [chargerEntity] = entities.filter(eid => eid.substr(0, eid.indexOf('.')) === 'sensor');
    return {
      entity: chargerEntity || '',
      image: 'default'
    };
  }

  static get styles() {
    return styles;
  }

  get brand() {
    return this.config.brand;
  }

  get entity() {
    return this.hass.states[this.config.entity];
  }

  get image() {
    var image;

    if (this.config.customImage !== undefined && this.config.customImage !== null && this.config.customImage !== '') {
      // For images in www try path \local\image.png
      image = this.config.customImage;
    } else {
      var imageSel = this.config.chargerImage || DEFAULT_IMAGE;
      image = CHARGER_IMAGES.find(({
        name
      }) => {
        if (name === imageSel) {
          return name;
        }
      }).img;
    }

    return image;
  }

  get customCardTheme() {
    if (this.config.customCardTheme === undefined) {
      return DEFAULT_CUSTOMCARDTHEME;
    }

    return this.config.customCardTheme;
  }

  get showLeds() {
    if (this.config.show_leds === undefined) {
      return true;
    }

    return this.config.show_leds;
  }

  get showName() {
    if (this.config.show_name === undefined) {
      return true;
    }

    return this.config.show_name;
  }

  get showStatus() {
    if (this.config.show_status === undefined) {
      return true;
    }

    return this.config.show_status;
  }

  get showStats() {
    if (this.config.show_stats === undefined) {
      return true;
    }

    return this.config.show_stats;
  }

  get showCollapsibles() {
    if (this.config.show_collapsibles === undefined) {
      return true;
    }

    return this.config.show_collapsibles;
  }

  get showToolbar() {
    if (this.config.show_toolbar === undefined) {
      return true;
    }

    return this.config.show_toolbar;
  }

  get compactView() {
    if (this.config.compact_view === undefined) {
      return false;
    }

    return this.config.compact_view;
  }

  get currentlimits() {
    if (this.config.currentlimits !== undefined && Array.isArray(this.config.details.currentlimits)) {
      return this.config.details.currentlimits;
    } // console.log(Array.isArray(this.config.details.currentlimits))


    return DEFAULT_CURRENTLIMITS;
  }

  get statetext() {
    if (this.config.details.statetext !== undefined && typeof this.config.details.statetext == 'object') {
      return this.config.details.statetext;
    }

    return [{}];
  }

  get debug() {
    if (this.config) {
      return this.config.debug !== undefined ? this.config.debug : false;
    }

    return false;
  }

  getCardData(data) {
    var entities = {};

    if (data === undefined || data === null) {
      return null;
    } else if (typeof data == 'object' && Array.isArray(data)) {
      // ARRAYS OF ENTITY DATA
      for (let [key, val] of Object.entries(data)) {
        if (typeof val == 'object' && 'entity_id' in val) {
          entities[key] = this.getCardCheckData(val);
        }
      }

      return entities;
    } else if (typeof data == 'object' && 'entity_id' in data) {
      // SINGLE ENTITY DATA
      entities = this.getCardCheckData(data);
      return entities;
    } else if (typeof data == 'object') {
      // STATES DEPENDANT STUFF (STATS AND TOOLBAR)
      var stateobj = {};

      for (let [statekey, stateval] of Object.entries(data)) {
        var stateentities = {};

        for (let [key, val] of Object.entries(stateval)) {
          if (typeof val == 'object') {
            stateentities[key] = this.getCardCheckData(val);
          }

          stateobj[statekey] = stateentities;
        }
      }

      return stateobj;
    } else {
      // STRINGS AND NON-OBJECTS
      entities = data;
    } // console.log(entities);


    return entities;
  }

  getCardCheckData(val) {
    var data = {}; //Set defaults if not given in config

    data['entity_id'] = val.entity_id !== undefined ? val.entity_id : null;
    data['unit'] = val.unit !== undefined ? val.unit : this.getEntityAttr(data.entity_id, 'unit_of_measurement');
    data['text'] = val.text !== undefined ? val.text : this.getEntityAttr(data.entity_id, 'friendly_name');
    data['icon'] = val.icon !== undefined ? val.icon : this.getEntityIcon(data.entity_id);
    data['unit_show'] = val.unit_show !== undefined ? val.unit_show : false;
    data['unit_showontext'] = val.unit_showontext !== undefined ? val.unit_showontext : false;
    data['round'] = val.round !== undefined ? val.round : false;
    data['type'] = val.type !== undefined ? val.type : 'info';
    data['attribute'] = val.attribute !== undefined ? val.attribute : null;
    data['useval'] = this.getEntityState(data.entity_id);
    data['service'] = val.service !== undefined ? val.service : null;
    data['service_data'] = val.service_data !== undefined ? val.service_data : null;
    data['type'] = val.type !== undefined ? val.type : null;
    data['conditional_entity'] = val.conditional_entity !== undefined ? val.conditional_entity : null;
    data['conditional_attribute'] = val.conditional_attribute !== undefined ? val.conditional_attribute : null;
    data['conditional_invert'] = val.conditional_invert !== undefined ? val.conditional_invert : null; // Get entity

    data['entity'] = this.getEntity(data.entity_id); // Use attribute if given in config

    if (data.entity !== null && data.attribute != null && data.attribute in data.entity.attributes) {
      data['useval'] = this.getEntityAttr(data.entity_id, data.attribute);
    } // Calculated entities


    if (data.entity_id == 'calculated') {
      data['calc_function'] = val.calc_function !== undefined ? val.calc_function : null;
      data['calc_entities'] = val.calc_entities !== undefined ? val.calc_entities : null;

      if (data.calc_function !== null && data.calc_entities !== null) {
        try {
          data.useval = this.getEntityCalcVal(data.calc_function, data.calc_entities);
        } catch (err) {
          console.error("The calculation you asked for didn't work, check your config (" + err + ")");
        }
      }
    } //Apply rounding of number if specified, round to zero decimals if other than integer given (for instance true)


    if (data.round) {
      var decimals = Number.isInteger(data.round) ? data.round : 0;
      data.useval = this.round(data.useval, decimals);
    } // Conditional entities


    if (data.conditional_entity !== undefined && data.conditional_entity !== null) {
      data['hide'] = false;
      var cond_state, cond_attr;
      cond_state = this.getEntityState(data.conditional_entity);
      data['hide'] = cond_state !== null && (cond_state == 'off' || cond_state == 'false' || cond_state === false) ? true : data['hide'];

      if (data.conditional_attribute !== undefined && data.conditional_attribute !== null) {
        cond_attr = this.getEntityAttr(data.conditional_entity, data.conditional_attribute);
        data['hide'] = cond_attr !== null && (cond_attr == 'off' || cond_attr == 'false' || cond_attr === false) ? true : data['hide'];
      }

      if (data.conditional_invert === true) {
        data['hide'] = !data.hide;
      }
    }

    return data;
  }

  loc(string, group = '', brand = null, search = '', replace = '') {
    if (this.config.localize === undefined || this.config.localize == true) {
      group = group != '' ? group + "." : group;
      let debug = this.debug;
      return localize(group + string, brand, search, replace, debug);
    } else {
      return string;
    }
  }

  getEntityCalcVal(calcfunc, entities) {
    var calc;
    var calc_array = [];

    for (let [val] of Object.entries(entities)) {
      let useval = val.attribute !== undefined ? this.getEntityAttr(val.entity_id, val.attribute) : this.getEntityState(val.entity_id);
      calc_array.push(Number(useval));
    }

    switch (calcfunc) {
      case "max":
        calc = Math.max(...calc_array);
        break;

      case "min":
        calc = Math.min(...calc_array);
        break;

      case "mean":
        calc = this.math_mean(calc_array);
        break;

      case "sum":
        calc = this.math_sum(calc_array);
        break;
    }

    return calc;
  }

  log(debug) {
    if (this.debug !== undefined && this.debug === true) {
      console.log(debug);
    }
  }

  getEntityIcon(entity_id) {
    var entity = this.getEntity(entity_id);

    if (entity === undefined || entity === null || typeof entity !== 'object') {
      return DEFAULT_ICON;
    } else if ('icon' in entity.attributes && entity.attributes.icon !== '') {
      return entity.attributes['icon'];
    } else if ('device_class' in entity.attributes) {
      //TODO: Find better way to get deviceclass icons
      return DEVICECLASS_ICONS[entity.attributes['device_class']] || null;
    } else {
      return DEFAULT_ICON;
    }
  }

  getCollapsibleButton(button, deftext, deficon) {
    try {
      var btns = this.config.details.collapsiblebuttons;
      return {
        text: this.loc(btns[button].text, 'common', this.brand),
        icon: btns[button].icon
      };
    } catch (err) {
      return {
        text: deftext,
        icon: deficon
      };
    }
  }

  round(value, decimals) {
    try {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    } catch (err) {
      return value;
    }
  }

  math_sum(array) {
    var total = 0;

    for (var i = 0; i < array.length; i++) {
      total += array[i];
    }

    return total;
  }

  math_mean(array) {
    return this.math_sum(array) / array.length;
  }

  getEntity(entity_id) {
    try {
      var entity = this.hass.states[entity_id];
      return entity !== undefined ? entity : null;
    } catch (err) {
      return null;
    }
  }

  getEntityState(entity_id) {
    try {
      var attr = this.hass.states[entity_id].state;
      return attr !== undefined ? attr : null;
    } catch (err) {
      return null;
    }
  }

  getEntityAttr(entity_id, attribute = null) {
    try {
      var attr = attribute === null ? this.hass.states[entity_id].attributes : this.hass.states[entity_id].attributes[attribute];
      return attr !== undefined ? attr : null;
    } catch (err) {
      return null;
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error(localize('error.missing_entity'));
    }

    this.config = config;
  }

  getCardSize() {
    return 2;
  }

  shouldUpdate(changedProps) {
    return X(this, changedProps, true); //TODO: Probably not efficient to force update here?
  }

  updated(changedProps) {
    if (changedProps.get('hass') && changedProps.get('hass').states[this.config.entity].state !== this.hass.states[this.config.entity].state) {
      this.requestInProgress = false;
    }
  }

  handleMore(entity = this.entity) {
    A(this, 'hass-more-info', {
      entityId: entity.entity_id
    }, {
      bubbles: true,
      composed: true
    });
  }

  createServiceData(service, isRequest, service_data, event) {
    if (service === undefined || service === null || service_data === undefined || service_data === null) {
      console.error("Trying to call an empty service or without service data - please check your card configuration.");
      this.hass.callService("persistent_notification", "create", {
        title: "No service",
        message: "No service defined for this action or no service data given."
      });
      return;
    }

    var event_val = event.target.getAttribute('value'); // event_val = Number.isNaN(Number(event_val)) ? event_val : Number(event_val); //TODO is this neccessary?

    var service_data_mod = {};

    for (let [key, val] of Object.entries(service_data)) {
      service_data_mod[key] = val.replace(SERVICEVAL, event_val);
    }

    return this.callService(service, isRequest, service_data_mod);
  }

  callService(service, isRequest = true, service_data = {}) {
    this.log("CALLING SERVICE");
    this.log(service);
    this.log(service_data);

    if (service === undefined || service === null) {
      console.error("Trying to call an empty service - please check your card configuration.");
      this.hass.callService("persistent_notification", "create", {
        title: "No service",
        message: "No service defined for this action."
      });
    } else {
      service = service.split(".");
      this.hass.callService(service[0], service[1], service_data);

      if (isRequest) {
        // this.requestInProgress = true; //TODO: Removed, must be improved to check all sensors
        this.requestUpdate();
      }
    }
  }

  renderImage(state) {
    var compactview = '';

    if (this.compactView) {
      compactview = '-compact';
    }

    if (!this.image) {
      return html``;
    }

    return html`<div class='image'> <img
        class="charger${compactview}"
        src="${this.image}"
        @click="${() => this.handleMore()}"
        ?more-info="true"
      />${this.renderLeds(state)}
      </div>`;
  }

  renderLeds(state) {
    // if (!this.showLeds) {
    //   return html``;
    // }
    var hide = this.showLeds === true ? '' : '-hidden';
    var carddatas = this.getCardData(this.config.details["smartcharging"]);
    var chargingmode = 'normal';

    if (carddatas !== null && carddatas !== undefined && typeof carddatas === 'object' && carddatas.entity !== null) {
      chargingmode = carddatas.entity.state == 'on' ? 'smart' : 'normal';
    }

    var imageled = LEDIMAGES[chargingmode][state] || LEDIMAGES[chargingmode]['DEFAULT'];
    var compactview = this.compactView ? '-compact' : '';
    return html`<img class="charger led${hide}${compactview}" src="${imageled}" @click="${() => this.handleMore(carddatas.entity)}"?more-info="true"/> `;
  }

  renderStats(state) {
    /* SHOW DATATABLE */
    if (!this.showStats) {
      return html``;
    } // var compactview = this.compactView ? '-compact' : '';


    var stats;

    if (this.config.details['stats'] !== undefined && this.config.details['stats'] !== null) {
      stats = this.getCardData(this.config.details['stats']);
      stats = stats !== undefined && stats !== null ? stats[state] || stats['default'] : [];
    } else {
      console.info("Stats is turned on but no stats given in config.");
      stats = {};
    }

    return html`
      ${Object.values(stats).map(stat => {
      return html`
            <div
              class="stats-block"
              @click="${() => this.handleMore(stat.entity)}"
              ?more-info="true"
            >
              <span class="stats-value">${stat.useval}</span>
              ${stat.unit_show ? stat.unit : ''}
              <div class="stats-subtitle">${this.loc(stat.text, 'common', this.brand)}</div>
            </div>
          `;
    })}
      `;
  }

  renderName() {
    if (!this.showName) {
      return html``;
    }

    var carddata_name = this.getCardData(this.config.details["name"]);
    var carddata_location = this.getCardData(this.config.details["location"]);
    var name;
    var location;
    var moreEntity = null;
    var compactview = this.compactView ? '-compact' : '';

    if (carddata_name !== null && carddata_name !== undefined) {
      name = typeof carddata_name == 'object' ? carddata_name.useval : carddata_name;
      moreEntity = typeof carddata_name == 'object' ? carddata_name.entity : null;
    }

    if (carddata_location !== null && carddata_location !== undefined) {
      location = typeof carddata_location == 'object' ? carddata_location.useval : carddata_location;
    }

    var combinator = "";

    if (name !== undefined && location !== undefined) {
      combinator = " - ";
    }

    return html`
      <div
        class="charger-name${compactview}"
        @click="${() => this.handleMore(moreEntity)}"
        ?more-info="true"
      >
        ${name}${carddata_name.unit_show ? carddata_name.unit : ''}${combinator}${location}${carddata_location.unit_show ? carddata_location.unit : ''}
      </div>
    `;
  }

  renderStatus() {
    if (!this.showStatus) {
      return html``;
    }

    var carddata_status = this.getCardData(this.config.details["status"]);
    var carddata_substatus = this.getCardData(this.config.details["substatus"]);
    var status = null,
        substatus = null;
    var compactview = this.compactView ? '-compact' : '';

    if (carddata_status !== null && carddata_status !== undefined) {
      status = typeof carddata_status == 'object' ? carddata_status.useval : carddata_status;
    } else {
      status = this.entity.state;
    } // console.log(carddata_substatus.useval)


    if (carddata_substatus !== null && carddata_substatus !== undefined) {
      substatus = typeof carddata_substatus == 'object' ? carddata_substatus.useval : carddata_substatus;
    } //Localize and choose


    status = status !== null ? this.loc(status, "status", this.brand) || this.statetext[status] || status : '';
    substatus = substatus !== null ? this.loc(substatus, "substatus", this.brand) || substatus : '';
    return html`
      <div class="status${compactview}" @click="${() => this.handleMore(carddata_status.entity || null)}"?more-info="true">
        <span class="status-text${compactview}" alt=${status}>${status}${carddata_status.unit_show ? carddata_status.unit : ''}</span>
        <ha-circular-progress .active=${this.requestInProgress} size="small"></ha-circular-progress>
        <div class="status-detail-text${compactview}" alt=${substatus} @click="${() => this.handleMore(carddata_substatus.entity || null)}"?more-info="true">
          ${substatus}${carddata_substatus.unit_show ? carddata_substatus.unit : ''}
        </div>
      </div>
    `;
  }

  renderCollapsible(group, icon, tooltip, style, itemtype) {
    /* SHOW COLLAPSIBLES */
    if (!this.showCollapsibles) {
      return html``;
    }

    var carddatas = this.getCardData(this.config.details[group]);
    return html`
      <div class="wrap-collabsible${style}">
        <input id="collapsible${style}" class="toggle${style}" type="checkbox" />
        <label for="collapsible${style}" class="lbl-toggle${style}">
          <div class="tooltip-right">
            <ha-icon icon="${icon}"></ha-icon>
            <span class="tooltiptext-right">${this.loc(tooltip)}</span>
          </div>
        </label>
        <div class="collapsible-content${style}">
          <div class="content-inner${style}">
            ${carddatas !== null ? Object.values(carddatas).map(carddata => {
      return this.renderCollapsibleItems(carddata, carddata.type || itemtype);
    }) : localize('error.missing_group')}
          </div>
        </div>
      </div>
    `;
  }

  renderCollapsibleItems(carddata, itemtype = '') {
    if (carddata === null || carddata === undefined || typeof carddata !== 'object' || carddata.hide === true) {
      return html``;
    }

    if (itemtype === 'info' || itemtype === '' || itemtype === null) {
      return html`
        <div class="collapsible-item"
          @click="${() => this.handleMore(carddata.entity)}"
          ?more-info="true"
        >
          <div class="tooltip">
            <ha-icon icon="${carddata.icon}"></ha-icon>
            <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
            <span class="tooltiptext">${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? "(" + carddata.unit + ")" : ''}</span>
          </div>
        </div>
      `;
    } else if (itemtype === 'service') {
      return html`
          <div class="collapsible-item"
            @click="${() => this.callService(carddata.service, true, carddata.service_data)}"
            ?more-info="true"
          >
            <div class="tooltip">
              <ha-icon icon="${carddata.icon}"></ha-icon>
              <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
              <span class="tooltiptext">${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? "(" + carddata.unit + ")" : ''}</span>
            </div>
          </div>
        `;
    } else if (itemtype === 'dropdown') {
      const sources = this.currentlimits;
      var selected = sources.indexOf(carddata.useval);
      return html`
          <div class="collapsible-item">
            <paper-menu-button slot="dropdown-trigger" .noAnimations=${true} @click="${e => e.stopPropagation()}">
              <paper-button slot="dropdown-trigger">
                <div class="tooltip">
                  <ha-icon icon="${carddata.icon}"></ha-icon>
                  <br />${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
                  <span class="tooltiptext">${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? "(" + carddata.unit + ")" : ''}</span>
                </div>
              </paper-button>
              <paper-listbox slot="dropdown-content" selected=${selected} @click="${event => this.createServiceData(carddata.service, true, carddata.service_data, event)}">
                ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
              </paper-listbox>
            </paper-menu-button>
          </div>
        `;
    } else {
      return html``;
    }
  }

  renderMainInfoLeftRight(data) {
    var carddatas = this.getCardData(this.config.details[data]);

    if (carddatas === null || carddatas === undefined || typeof carddatas !== 'object') {
      return html``;
    }

    var tooltip = data == 'info_right' ? '-right' : '';
    return html`
      ${carddatas !== null ? Object.values(carddatas).map(carddata => {
      return html`
        <div
        class='infoitems-item-${data}'
        @click='${() => this.handleMore(carddata.entity)}'
        ?more-info='true'
      >
        <div class='tooltip'>
          <ha-icon icon=${data == 'info_left' ? carddata.icon : ''}></ha-icon>
          ${carddata.useval} ${carddata.unit_show ? carddata.unit : ''}
          <ha-icon icon=${data == 'info_right' ? carddata.icon : ''}></ha-icon>
          <span class='tooltiptext${tooltip}'>${this.loc(carddata.text, "common", this.brand)} ${carddata.unit_showontext ? '(' + carddata.unit + ')' : ''}</span>
        </div>
      </div>
      `;
    }) : ''}
    `;
  }

  renderToolbar(state) {
    /* SHOW TOOLBAR */
    if (!this.showToolbar) {
      return html``;
    }

    var toolbardata_left = this.getCardData(this.config.details.toolbar_left);
    var toolbardata_right = this.getCardData(this.config.details.toolbar_right);
    toolbardata_left = toolbardata_left !== null ? toolbardata_left[state] || toolbardata_left.default || [] : [];
    toolbardata_right = toolbardata_right !== null ? toolbardata_right[state] || toolbardata_right.default || [] : [];
    var toolbar_left = Object.values(toolbardata_left).map(btn => {
      return btn.hide !== true ? this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data) : '';
    });
    var toolbar_right = Object.values(toolbardata_right).map(btn => {
      return btn.hide !== true ? this.renderToolbarButton(btn.service, btn.icon, btn.text, btn.service_data) : '';
    });
    return html`
      <div class="toolbar">
        ${toolbar_left}
        <div class="fill-gap"></div>
        ${toolbar_right}
      </div>
    `;
  }

  renderToolbarButton(service, icon, text, service_data = {}, isRequest = true) {
    var usetext = this.loc(text, this.brand) || text;
    return html`
      <div class="tooltip">
        <ha-icon-button
          title="${this.loc(usetext, "common", this.brand)}"
          @click="${() => this.callService(service, isRequest, service_data)}"
          ><ha-icon icon="${icon}"></ha-icon
        ></ha-icon-button>
        <span class="tooltiptext">${this.loc(usetext, "common", this.brand)}</span>
      </div>
    `;
  }

  renderCompact() {
    var {
      state
    } = this.entity;
    return html`
      <ha-card>
        <div class="preview-compact">
          ${this.renderImage(state)}
          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>
          <div class="infoitems">${this.renderMainInfoLeftRight('info_right')}</div>
          <div class="stats-compact">
            ${this.renderStats(state)}
          </div>
        </div>
        ${this.renderToolbar(state)}
      </ha-card>
    `;
  }

  renderFull() {
    var {
      state
    } = this.entity;
    var btn1 = this.getCollapsibleButton('group1', 'click_for_group1', 'mdi:speedometer');
    var btn2 = this.getCollapsibleButton('group2', 'click_for_group2', 'mdi:information');
    var btn3 = this.getCollapsibleButton('group3', 'click_for_group3', 'mdi:cog');
    return html`
      <ha-card>
        <div class="preview">
          <div class="header">
            <div class="infoitems-left">${this.renderMainInfoLeftRight('info_left')}</div>
            <div class="infoitems">${this.renderMainInfoLeftRight('info_right')}</div>
          </div>
          ${this.renderImage(state)}
          <div class="metadata">
            ${this.renderName()} ${this.renderStatus()}
          </div>
            ${this.renderCollapsible('group1', btn1.icon, btn1.text, '-lim', 'dropdown')}
            ${this.renderCollapsible('group2', btn2.icon, btn2.text, '-info', 'info')}
            ${this.renderCollapsible('group3', btn3.icon, btn3.text, '', 'info')}
            <div class="stats">
              ${this.renderStats(state)}
            </div>
        </div>
        ${this.renderToolbar(state)}
      </ha-card>
    `;
  }

  renderCustomCardTheme() {
    switch (this.customCardTheme) {
      case 'theme_custom':
        {
          break;
        }

      case 'theme_default':
        {
          this.style.setProperty('--custom-card-background-color', '#03A9F4');
          this.style.setProperty('--custom-text-color', '#FFFFFF');
          this.style.setProperty('--custom-primary-color', '#03A9F4');
          this.style.setProperty('--custom-icon-color', '#FFFFFF');
          break;
        }

      case 'theme_transp_blue':
        {
          this.style.setProperty('--custom-card-background-color', 'transparent');
          this.style.setProperty('--custom-text-color', '#03A9F4');
          this.style.setProperty('--custom-primary-color', '#03A9F4');
          this.style.setProperty('--custom-icon-color', '#03A9F4');
          break;
        }

      case 'theme_transp_black':
        {
          this.style.setProperty('--custom-card-background-color', 'transparent');
          this.style.setProperty('--custom-text-color', 'black');
          this.style.setProperty('--custom-primary-color', 'black');
          this.style.setProperty('--custom-icon-color', 'black');
          break;
        }

      case 'theme_transp_white':
        {
          this.style.setProperty('--custom-card-background-color', 'transparent');
          this.style.setProperty('--custom-text-color', 'white');
          this.style.setProperty('--custom-primary-color', 'white');
          this.style.setProperty('--custom-icon-color', 'white');
          break;
        }

      case 'theme_lightgrey_blue':
        {
          this.style.setProperty('--custom-card-background-color', 'lightgrey');
          this.style.setProperty('--custom-text-color', '#03A9F4');
          this.style.setProperty('--custom-primary-color', '#03A9F4');
          this.style.setProperty('--custom-icon-color', '#03A9F4');
          break;
        }

      default:
        {
          this.style.setProperty('--custom-card-background-color', '#03A9F4');
          this.style.setProperty('--custom-text-color', '#FFFFFF');
          this.style.setProperty('--custom-primary-color', '#03A9F4');
          this.style.setProperty('--custom-icon-color', '#FFFFFF');
          break;
        }
    }
  }

  render() {
    this.renderCustomCardTheme();

    if (!this.entity) {
      return html`
        <ha-card>
          <div class="preview not-available">
            <div class="metadata">
              <div class="not-available">
                ${localize('error.not_available')}
              </div>
            <div>
          </div>
        </ha-card>
      `;
    }

    if (this.compactView) {
      return this.renderCompact();
    } else {
      return this.renderFull();
    }
  }

}

customElements.define('charger-card', ChargerCard);
console.info(`%cCHARGER-CARD ${VERSION} IS INSTALLED`, 'color: green; font-weight: bold', '');
window.customCards = window.customCards || [];
window.customCards.push({
  preview: true,
  type: 'charger-card',
  name: localize('common.name'),
  description: localize('common.description')
});
