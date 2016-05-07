// LICENSE : MIT
"use strict";
const HTML_COMMENT_REGEXP = /<!--((?:.|\s)*?)-->/g;
export function isHTMLComment(htmlString) {
    return HTML_COMMENT_REGEXP.test(htmlString);
}
/**
 * get comment value from html comment tag
 * @param {string} commentValue <!-- comment -->
 */
export function getValueFromHTMLComment(commentValue) {
    return commentValue.replace(HTML_COMMENT_REGEXP, "$1");
}
/**
 * Parses a config of values separated by comma.
 * @param {string} string The string to parse.
 * @returns {Object} Result map of values and true values
 */
export function parseListConfig(string) {
    var items = {};

    // Collapse whitespace around ,
    string = string.replace(/\s*,\s*/g, ",");

    string.split(/,+/).forEach(function (name) {
        name = name.trim();
        if (!name) {
            return;
        }
        items[name] = true;
    });
    return items;
}

/**
 * parse "textlint-enable aRule, bRule" and return ["aRule", "bRule"]
 * @param {string} string
 * @returns {string[]}
 */
export function parseRuleIds(string) {
    return Object.keys(parseListConfig(string));
}