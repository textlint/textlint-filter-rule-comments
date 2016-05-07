// LICENSE : MIT
"use strict";
const TextLintCore = require("textlint").TextLintCore;
const TextLintNodeType = require("textlint").TextLintNodeType;
const ignoreRule = require("../src/textlint-rule-ignore-comments");
const reportRule = require("textlint-rule-report-node-types");
const assert = require("power-assert");
describe("textlint-rule-ignore-node-types", function () {
    context("when before textlint-enable", function () {
        it("should not ignored", function () {
            const textlint = new TextLintCore();
            textlint.setupRules({
                ignore: ignoreRule,
                report: reportRule
            }, {
                report: {
                    nodeTypes: [TextLintNodeType.Str]
                }
            });
            return textlint.lintMarkdown(`
This is Error.

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->
`).then(({messages}) => {
                assert.equal(messages.length, 1);
            });
        });
    });
    context("when during disable -- enable", function () {
        it("should messages is ignored between disable and enable", function () {
            const textlint = new TextLintCore();
            textlint.setupRules({
                ignore: ignoreRule,
                report: reportRule
            }, {
                report: {
                    nodeTypes: [TextLintNodeType.Str]
                }
            });
            return textlint.lintMarkdown(`
<!-- textlint-disable -->

This is text.

<!-- textlint-enable -->
`).then(({messages}) => {
                assert.equal(messages.length, 0);
            });
        });
    });
    context("when after textlint-enable", function () {
        it("should not ignored", function () {
            const textlint = new TextLintCore();
            textlint.setupRules({
                ignore: ignoreRule,
                report: reportRule
            }, {
                report: {
                    nodeTypes: [TextLintNodeType.Str]
                }
            });
            return textlint.lintMarkdown(`

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->

This is Error.
`).then(({messages}) => {
                assert.equal(messages.length, 1);
            });
        });

    });
});